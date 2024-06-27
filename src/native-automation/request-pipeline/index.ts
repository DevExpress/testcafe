import { remove } from 'lodash';
import { ProtocolApi } from 'chrome-remote-interface';
import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import FrameNavigatedEvent = Protocol.Page.FrameNavigatedEvent;
import LoadingFailedEvent = Protocol.Network.LoadingFailedEvent;
import ContinueResponseRequest = Protocol.Fetch.ContinueResponseRequest;
import FrameTree = Protocol.Page.FrameTree;
import FulfillRequestRequest = Protocol.Fetch.FulfillRequestRequest;
import RequestPattern = Protocol.Fetch.RequestPattern;
import CertificateErrorEvent = Protocol.Security.CertificateErrorEvent;
import HeaderEntry = Protocol.Fetch.HeaderEntry;
import NativeAutomationRequestHookEventProvider from '../request-hooks/event-provider';
import ResourceInjector, { ResourceInjectorOptions } from '../resource-injector';
import { convertToHeaderEntries, getHeaderEntry } from '../utils/headers';
import httpHeaders from '../../utils/http-headers';

import {
    createRequestPausedEventForResponse,
    getRequestId,
    isRequest,
    isUnauthorized,
} from '../utils/cdp';

import ERROR_ROUTE from '../error-route';

import {
    ContinueRequestArgs,
    SessionId,
    SessionStorageInfo,
    SpecialServiceRoutes,
} from '../types';

import {
    requestPipelineLogger,
    requestPipelineMockLogger,
    requestPipelineOtherRequestLogger,
} from '../../utils/debug-loggers';

import {
    IncomingMessageLike,
    isRedirectStatusCode,
    SPECIAL_BLANK_PAGE,
    StoragesSnapshot,
    injectUpload,
    contentTypeUtils,
} from 'testcafe-hammerhead';

import NativeAutomationPipelineContext from '../request-hooks/pipeline-context';
import { NativeAutomationInitOptions } from '../../shared/types';
import getSpecialRequestHandler from './special-handlers';
import {
    connectionResetGuard,
    safeContinueRequest,
    safeContinueResponse,
} from './safe-api';
import NativeAutomationApiBase from '../api-base';
import { resendAuthRequest } from './resendAuthRequest';
import TestRunBridge from './test-run-bridge';
import NativeAutomationRequestContextInfo from './context-info';
import { failedToFindDNSError, sslCertificateError } from '../errors';

const ALL_REQUEST_RESPONSES = { requestStage: 'Request' } as RequestPattern;
const ALL_REQUEST_REQUESTS  = { requestStage: 'Response' } as RequestPattern;

const ALL_REQUESTS_DATA = [ALL_REQUEST_REQUESTS, ALL_REQUEST_RESPONSES];

const TARGET_INFO_TYPE = {
    iframe:        'iframe',
    worker:        'worker',
    serviceWorker: 'service_worker',
};

export default class NativeAutomationRequestPipeline extends NativeAutomationApiBase {
    private readonly _windowId: string;
    private readonly _isMainWindow: boolean;
    private readonly _testRunBridge: TestRunBridge;
    private readonly _contextInfo: NativeAutomationRequestContextInfo;
    public readonly requestHookEventProvider: NativeAutomationRequestHookEventProvider;
    public restoringStorages: StoragesSnapshot | null;
    public contextStorage: SessionStorageInfo | null;
    private readonly _resourceInjector: ResourceInjector;
    private readonly _specialServiceRoutes: SpecialServiceRoutes;
    private _stopped: boolean;
    private _currentFrameTree: FrameTree | null;
    private readonly _failedRequestIds: string[];
    private _pendingCertificateError: CertificateErrorEvent | null;

    public constructor (browserId: string, windowId: string, client: ProtocolApi, isMainWindow: boolean, options: NativeAutomationInitOptions) {
        super(browserId, client, options);

        this._testRunBridge           = new TestRunBridge(browserId, windowId);
        this._windowId                = windowId;
        this._isMainWindow            = isMainWindow;
        this._contextInfo             = new NativeAutomationRequestContextInfo(this._testRunBridge);
        this._specialServiceRoutes    = this._getSpecialServiceRoutes();
        this.requestHookEventProvider = new NativeAutomationRequestHookEventProvider();
        this._resourceInjector        = new ResourceInjector(this._testRunBridge);
        this._stopped                 = false;
        this._currentFrameTree        = null;
        this._failedRequestIds        = [];
        this.restoringStorages        = null;
        this.contextStorage           = null;
        this._pendingCertificateError = null;

        this._setOptionsForResourceInjector();
    }

    private _setOptionsForResourceInjector (): void {
        const options = this._createResourceInjectorOptions();

        this._resourceInjector.setOptions(options);
    }

    private _createResourceInjectorOptions (): ResourceInjectorOptions {
        return {
            specialServiceRoutes: this._specialServiceRoutes,
            developmentMode:      this.options.developmentMode,
        };
    }

    private _getSpecialServiceRoutes (): SpecialServiceRoutes {
        const browserConnection = this._testRunBridge.getBrowserConnection();
        const proxy             = browserConnection.browserConnectionGateway.proxy;

        return {
            errorPage1:          proxy.resolveRelativeServiceUrl(ERROR_ROUTE, proxy.server1Info.domain),
            errorPage2:          proxy.resolveRelativeServiceUrl(ERROR_ROUTE, proxy.server2Info.domain),
            idlePage:            browserConnection.idleUrl,
            openFileProtocolUrl: browserConnection.openFileProtocolUrl,
        };
    }

    private async _handleMockErrorIfNecessary (pipelineContext: NativeAutomationPipelineContext, event: RequestPausedEvent): Promise<void> {
        if (!pipelineContext.mock.hasError)
            return;

        await pipelineContext.handleMockError(this.requestHookEventProvider);

        requestPipelineMockLogger('%s\n%s', event.networkId, pipelineContext.mock.error);
    }

    private async _handleMockResponse (mockedResponse: IncomingMessageLike, pipelineContext: NativeAutomationPipelineContext, event: RequestPausedEvent, sessionId: SessionId): Promise<void> {
        if (this._stopped)
            return;

        const mockedResponseBodyStr = (mockedResponse.getBody() as Buffer).toString();

        const fulfillInfo = {
            requestId:       event.requestId,
            responseCode:    mockedResponse.statusCode,
            responseHeaders: convertToHeaderEntries(mockedResponse.headers),
            body:            mockedResponseBodyStr,
        };

        if (pipelineContext.reqOpts.isAjax
            || !NativeAutomationRequestPipeline._isPage(fulfillInfo.responseHeaders))
            await this._resourceInjector.processNonProxiedContent(fulfillInfo, this._client, sessionId);
        else {
            const userScripts = await this._getUserScripts(event);
            const contentType = getHeaderEntry(event.responseHeaders, httpHeaders.contentType)?.value;

            await this._resourceInjector.processHTMLPageContent(fulfillInfo, {
                isIframe:       false,
                contextStorage: this.contextStorage,
                userScripts,
            }, this._client, sessionId, contentType);
        }

        requestPipelineMockLogger(`sent mocked response for the ${event.requestId}`);
    }

    private _createContinueResponseRequest (event: RequestPausedEvent, modified: boolean): ContinueResponseRequest {
        const continueResponseRequest = {
            requestId: event.requestId,
        } as ContinueResponseRequest;

        if (modified) {
            continueResponseRequest.responseHeaders = event.responseHeaders;
            continueResponseRequest.responseCode    = event.responseStatusCode as number;
        }

        return continueResponseRequest;
    }

    private _shouldRedirectToErrorPage (event: RequestPausedEvent): boolean {
        return event.resourceType === 'Document'
            && !this._isIframe(event.frameId);
    }

    private async _getUserScripts (event: RequestPausedEvent | FrameNavigatedEvent): Promise<string[]> {
        const { pipelineContext, eventFactory } = this._contextInfo.getContextData(event);

        await pipelineContext.prepareInjectableUserScripts(eventFactory, this._testRunBridge.getUserScripts());

        return pipelineContext.injectableUserScripts;
    }

    private async _respondToOtherRequest (event: RequestPausedEvent, sessionId: SessionId): Promise<void> {
        if (isRedirectStatusCode(event.responseStatusCode)) {
            await safeContinueResponse(this._client, { requestId: event.requestId }, sessionId);

            return;
        }

        const contentType = getHeaderEntry(event.responseHeaders, httpHeaders.contentType)?.value;
        const resourceInfo = await this._resourceInjector.getDocumentResourceInfo(event, this._client, contentType);

        if (resourceInfo.error) {
            if (this._shouldRedirectToErrorPage(event)) {
                await this._resourceInjector.redirectToErrorPage(this._client, resourceInfo.error, event.request.url);

                this._contextInfo.dispose(getRequestId(event));
            }

            return;
        }

        const modified = await this.requestHookEventProvider.onResponse(event, resourceInfo.body, this._contextInfo, this._client);

        if (this._needInjectResources(event)) {
            const fulfillInfo = {
                requestId:       event.requestId,
                responseHeaders: event.responseHeaders,
                responseCode:    event.responseStatusCode as number,
                body:            (resourceInfo.body as Buffer).toString(),
            } as FulfillRequestRequest;

            // NOTE: Strange behavior of the CDP API:
            // if we pass the empty "responseStatusText" value, we get an error 'Invalid status code or phrase'.
            if (event.responseStatusText !== '')
                fulfillInfo.responsePhrase = event.responseStatusText;

            if (isUnauthorized(event.responseStatusCode as number))
                await this._tryAuthorizeWithHttpBasicAuthCredentials(event, fulfillInfo);

            const userScripts = await this._getUserScripts(event);

            await this._resourceInjector.processHTMLPageContent(
                fulfillInfo,
                {
                    isIframe:          this._isIframe(event.frameId),
                    url:               event.request.url,
                    restoringStorages: this.restoringStorages,
                    contextStorage:    this.contextStorage,
                    userScripts,
                },
                this._client, sessionId, contentType);

            this._contextInfo.dispose(getRequestId(event));

            this.restoringStorages = null;
        }
        else {
            const continueResponseRequest = this._createContinueResponseRequest(event, modified);

            await safeContinueResponse(this._client, continueResponseRequest, sessionId);

            this._contextInfo.dispose(getRequestId(event));
        }
    }

    private static _isPage (responseHeaders: HeaderEntry[] | undefined): boolean {
        const contentType = getHeaderEntry(responseHeaders, httpHeaders.contentType)?.value;

        if (contentType)
            return contentTypeUtils.isPage(contentType);

        return true;
    }

    private _needInjectResources (event: Protocol.Fetch.RequestPausedEvent): boolean {
        if (event.resourceType !== 'Document')
            return false;

        return NativeAutomationRequestPipeline._isPage(event.responseHeaders);
    }

    private async _tryAuthorizeWithHttpBasicAuthCredentials (event: RequestPausedEvent, fulfillInfo: FulfillRequestRequest): Promise<void> {
        const credentials = this._testRun.getAuthCredentials();

        if (!credentials)
            return;

        const authRequest = await resendAuthRequest(event.request, credentials);

        if (typeof authRequest !== 'string' && !isUnauthorized(authRequest.status)) {
            fulfillInfo.responseCode    = authRequest.status;
            fulfillInfo.body            = authRequest.body.toString();
            fulfillInfo.responsePhrase  = authRequest.statusText;
            fulfillInfo.responseHeaders = convertToHeaderEntries(authRequest.headers);
        }
    }

    private _createError (event: RequestPausedEvent): Error {
        if (this._pendingCertificateError)
            return sslCertificateError(this._pendingCertificateError.errorType);

        if (event.responseErrorReason === 'NameNotResolved')
            return failedToFindDNSError(event.request.url);

        return new Error(event.responseErrorReason);
    }

    private async _tryRespondToOtherRequest (event: RequestPausedEvent, sessionId: SessionId): Promise<void> {
        try {
            if (event.responseErrorReason && this._shouldRedirectToErrorPage(event)) {
                const error = this._createError(event);

                await this._resourceInjector.redirectToErrorPage(this._client, error, event.request.url);
            }
            else
                await this._respondToOtherRequest(event, sessionId);
        }
        catch (err) {
            if (event.networkId && this._failedRequestIds.includes(event.networkId)) {
                remove(this._failedRequestIds, event.networkId);

                return;
            }

            throw err;
        }
    }

    private async _handleOtherRequests (event: RequestPausedEvent, sessionId: SessionId): Promise<void> {
        requestPipelineOtherRequestLogger('%r', event);

        if (!event.responseErrorReason && (isRequest(event) || isRedirectStatusCode(event.responseStatusCode))) {
            this._contextInfo.init(event);

            await this.requestHookEventProvider.onRequest(event, this._contextInfo);

            const pipelineContext = this._contextInfo.getPipelineContext(getRequestId(event));

            if (!pipelineContext || !pipelineContext.mock)
                await safeContinueRequest(this._client, event, sessionId, this._createContinueEventArgs(event, pipelineContext?.reqOpts));
            else {
                requestPipelineMockLogger('begin mocking request %r', event);

                const mockedResponse = await pipelineContext.getMockResponse();

                await this._handleMockErrorIfNecessary(pipelineContext, event);

                const mockedResponseEvent = createRequestPausedEventForResponse(mockedResponse, event);

                await this.requestHookEventProvider.onResponse(mockedResponseEvent, mockedResponse.getBody(), this._contextInfo, this._client);

                await this._handleMockResponse(mockedResponse, pipelineContext, event, sessionId);

                this._contextInfo.dispose(getRequestId(event));

                requestPipelineMockLogger('end mocking request %r', event);
            }
        }
        else
            await this._tryRespondToOtherRequest(event, sessionId);
    }

    private _getUploadPostData (event: Protocol.Fetch.RequestPausedEvent): string | undefined {
        if (!event.request.postDataEntries || !event.request.postDataEntries.length)
            return void 0;

        const contentTypeHeader = event.request.headers['Content-Type'] as string;
        const dataBuffers       = [];

        for (const dataEntry of event.request.postDataEntries)
            dataBuffers.push(Buffer.from(dataEntry.bytes ?? '', 'base64'));

        const postData        = Buffer.concat(dataBuffers);
        const bodyWithUploads = injectUpload(contentTypeHeader, postData);

        return bodyWithUploads ? bodyWithUploads.toString('base64') : void 0;
    }

    private _topFrameNavigation (event: FrameNavigatedEvent): boolean {
        return event.type === 'Navigation'
            && !event.frame.parentId;
    }

    private async _updateCurrentFrameTree (): Promise<void> {
        // NOTE: Due to CDP restrictions (it hangs), we can't get the frame tree
        // right before injecting service scripts.
        // So, we are forced tracking frames tree.
        const result = await this._client.Page.getFrameTree();

        this._currentFrameTree = result.frameTree;
    }

    private _isIframe (frameId: string): boolean {
        if (!this._currentFrameTree)
            return false;

        return this._currentFrameTree.frame.id !== frameId;
    }

    public async start (): Promise<void> {
        // NOTE: We are forced to handle all requests and responses at once
        // because CDP API does not allow specifying request filtering behavior for different handlers.
        await this._client.Fetch.enable({
            patterns: ALL_REQUESTS_DATA,
        });

        await this._client.Target.setAutoAttach({
            autoAttach:             true,
            waitForDebuggerOnStart: true,
            flatten:                true,
        });

        // NOTE: We need to enable the Fetch domain for iframe targets
        // to intercept some requests. We need to use the `sessionId` option
        // in continueRequest/continueResponse/fulfillRequest methods
        await this._client.Target.on('attachedToTarget', async event => {
            const isIFrame        = event.targetInfo.type === TARGET_INFO_TYPE.iframe;
            const isWorker        = event.targetInfo.type === TARGET_INFO_TYPE.worker;
            const isServiceWorker = event.targetInfo.type === TARGET_INFO_TYPE.serviceWorker;

            if (!isIFrame && !isWorker && !isServiceWorker)
                return;

            await connectionResetGuard(async () => {
                // @ts-ignore
                await this._client.Runtime.runIfWaitingForDebugger(event.sessionId);

                if (isIFrame) {
                    // @ts-ignore
                    await this._client.Fetch.enable({ patterns: ALL_REQUESTS_DATA }, event.sessionId);
                }
            }, err => {
                requestPipelineLogger(`Unhandled error %s during processing %s`, err, event);
            });
        });

        // @ts-ignore
        this._client.Fetch.on('requestPaused', async (event: RequestPausedEvent, sessionId: SessionId) => {
            if (this._stopped)
                return;

            const specialRequestHandler = getSpecialRequestHandler(event, this.options, this._specialServiceRoutes);

            if (specialRequestHandler)
                await specialRequestHandler(event, this._client, this._isMainWindow, this.options, sessionId);
            else
                await this._handleOtherRequests(event, sessionId);
        });

        this._client.Page.on('frameNavigated', async (event: FrameNavigatedEvent) => {
            requestPipelineLogger('%f', event);

            if (!this._topFrameNavigation(event)
                || event.frame.url !== SPECIAL_BLANK_PAGE)
                return;

            this._contextInfo.init(event);

            const userScripts = await this._getUserScripts(event);

            await this._resourceInjector.processAboutBlankPage(event, userScripts, this.contextStorage, this._client);

            this._contextInfo.dispose(getRequestId(event));
        });

        this._client.Page.on('frameStartedLoading', async () => {
            await this._updateCurrentFrameTree();
        });

        this._client.Network.on('loadingFailed', async (event: LoadingFailedEvent) => {
            requestPipelineLogger('%l', event);

            this._failedRequestIds.push(event.requestId);

            if (event.requestId)
                this._contextInfo.dispose(event.requestId);
        });

        await this._client.Page.setBypassCSP({ enabled: true });

        await this._client.Security.enable();

        this._client.Security.on('certificateError', async (event: CertificateErrorEvent) => {
            this._pendingCertificateError = event;
        });
    }

    public stop (): void {
        this._stopped = true;
    }

    public async dispose (): Promise<void> {
        await this._client.Fetch.disable();
    }

    private _getRequestOptionsModifiedByRequestHook (event: Protocol.Fetch.RequestPausedEvent, reqOpts: any): ContinueRequestArgs {
        if (!reqOpts)
            return {};

        let modifierUrl: any = void 0;

        if (reqOpts._changedUrlProperties.length) {
            modifierUrl = new URL(event.request.url);

            for (const changedUrlProperty of reqOpts._changedUrlProperties)
                modifierUrl[changedUrlProperty.name] = changedUrlProperty.value;

            modifierUrl = modifierUrl.toString();
        }

        const headers = this._formatHeadersForContinueResponse(event.request.headers);

        for (const changedHeader of reqOpts._changedHeaders) {
            const targetHeader = getHeaderEntry(headers, changedHeader.name);

            if (targetHeader)
                targetHeader.value = changedHeader.value;
            else
                headers.push({ name: changedHeader.name, value: changedHeader.value });
        }

        for (const removedHeader of reqOpts._removedHeaders)
            remove(headers, header => header.name.toLowerCase() === removedHeader.name);

        return {
            url:    modifierUrl,
            method: reqOpts.method,
            headers,
        };
    }

    private _createContinueEventArgs (event: Protocol.Fetch.RequestPausedEvent, reqOpts: any): ContinueRequestArgs {
        const continueEventArgs = {
            postData: this._getUploadPostData(event),
        };

        if (reqOpts)
            Object.assign(continueEventArgs, this._getRequestOptionsModifiedByRequestHook(event, reqOpts));

        return continueEventArgs;
    }

    private _formatHeadersForContinueResponse (headers: Protocol.Network.Headers): Protocol.Fetch.HeaderEntry[] {
        const result = [];

        for (const header in headers)
            result.push({ name: header, value: headers[header] });

        return result;
    }
}
