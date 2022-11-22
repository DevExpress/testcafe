import { remove } from 'lodash';
import { ProtocolApi } from 'chrome-remote-interface';
import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import FrameNavigatedEvent = Protocol.Page.FrameNavigatedEvent;
import LoadingFailedEvent = Protocol.Network.LoadingFailedEvent;
import ContinueResponseRequest = Protocol.Fetch.ContinueResponseRequest;
import FrameTree = Protocol.Page.FrameTree;
import ProxylessRequestHookEventProvider from '../request-hooks/event-provider';
import ResourceInjector from '../resource-injector';
import { convertToHeaderEntries } from '../utils/headers';

import {
    createRequestPausedEventForResponse,
    isRedirect,
    isRequest,
} from '../utils/cdp';

import BrowserConnection from '../../browser/connection';
import ERROR_ROUTE from '../error-route';
import { SpecialServiceRoutes } from '../types';
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
} from 'testcafe-hammerhead';

import ProxylessPipelineContext from '../request-hooks/pipeline-context';
import { ProxylessSetupOptions } from '../../shared/types';
import DEFAULT_PROXYLESS_SETUP_OPTIONS from '../default-setup-options';
import getSpecialRequestHandler from './special-handlers';
import { safeContinueResponse } from './safe-api';


export default class ProxylessRequestPipeline {
    private readonly _client: ProtocolApi;
    public readonly requestHookEventProvider: ProxylessRequestHookEventProvider;
    public restoringStorages: StoragesSnapshot | null;
    private readonly _resourceInjector: ResourceInjector;
    private _options: ProxylessSetupOptions;
    private readonly _specialServiceRoutes: SpecialServiceRoutes;
    private _stopped: boolean;
    private _currentFrameTree: FrameTree | null;
    private readonly _failedRequestIds: string[];

    public constructor (browserId: string, client: ProtocolApi) {
        this._client                  = client;
        this._specialServiceRoutes    = this._getSpecialServiceRoutes(browserId);
        this.requestHookEventProvider = new ProxylessRequestHookEventProvider(browserId);
        this._resourceInjector        = new ResourceInjector(browserId, this._specialServiceRoutes);
        this._options                 = DEFAULT_PROXYLESS_SETUP_OPTIONS;
        this._stopped                 = false;
        this._currentFrameTree        = null;
        this._failedRequestIds        = [];
        this.restoringStorages        = null;
    }

    private _getSpecialServiceRoutes (browserId: string): SpecialServiceRoutes {
        const browserConnection = BrowserConnection.getById(browserId) as BrowserConnection;
        const proxy             = browserConnection.browserConnectionGateway.proxy;

        return {
            errorPage1:          proxy.resolveRelativeServiceUrl(ERROR_ROUTE, proxy.server1Info.domain),
            errorPage2:          proxy.resolveRelativeServiceUrl(ERROR_ROUTE, proxy.server2Info.domain),
            idlePage:            browserConnection.idleUrl,
            openFileProtocolUrl: browserConnection.openFileProtocolUrl,
        };
    }

    private async _handleMockErrorIfNecessary (pipelineContext: ProxylessPipelineContext, event: RequestPausedEvent): Promise<void> {
        if (!pipelineContext.mock.hasError)
            return;

        await pipelineContext.handleMockError(this.requestHookEventProvider);

        requestPipelineMockLogger('%s\n%s', event.networkId, pipelineContext.mock.error);
    }

    private async _handleMockResponse (mockedResponse: IncomingMessageLike, pipelineContext: ProxylessPipelineContext, event: RequestPausedEvent): Promise<void> {
        const mockedResponseBodyStr = (mockedResponse.getBody() as Buffer).toString();

        const fulfillInfo = {
            requestId:       event.requestId,
            responseCode:    mockedResponse.statusCode,
            responseHeaders: convertToHeaderEntries(mockedResponse.headers),
            body:            mockedResponseBodyStr,
        };

        if (pipelineContext.reqOpts.isAjax)
            await this._resourceInjector.processNonProxiedContent(fulfillInfo, this._client);
        else
            await this._resourceInjector.processHTMLPageContent(fulfillInfo, { isIframe: false }, this._client);

        requestPipelineMockLogger(`Mock request ${event.requestId}`);
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

    private async _respondToOtherRequest (event: RequestPausedEvent): Promise<void> {
        if (isRedirectStatusCode(event.responseStatusCode as number)) {
            await safeContinueResponse(this._client, { requestId: event.requestId });

            return;
        }

        const resourceInfo = await this._resourceInjector.getDocumentResourceInfo(event, this._client);

        if (resourceInfo.error) {
            if (this._shouldRedirectToErrorPage(event))
                await this._resourceInjector.redirectToErrorPage(this._client, resourceInfo.error, event.request.url);

            return;
        }

        const modified = await this.requestHookEventProvider.onResponse(event, resourceInfo.body, this._client);

        if (event.resourceType !== 'Document') {
            const continueResponseRequest = this._createContinueResponseRequest(event, modified);

            await safeContinueResponse(this._client, continueResponseRequest);
        }
        else {
            await this._resourceInjector.processHTMLPageContent(
                {
                    requestId:       event.requestId,
                    responseHeaders: event.responseHeaders,
                    responseCode:    event.responseStatusCode as number,
                    body:            (resourceInfo.body as Buffer).toString(),
                },
                this._isIframe(event.frameId),
                this._client);
        }
    }

    private async _handleOtherRequests (event: RequestPausedEvent): Promise<void> {
        requestPipelineOtherRequestLogger('%r', event);

        if (isRequest(event) || isRedirect(event)) {
            await this.requestHookEventProvider.onRequest(event);

            const pipelineContext = this.requestHookEventProvider.getPipelineContext(event.networkId as string);

            if (!pipelineContext || !pipelineContext.mock)
                await this._client.Fetch.continueRequest({ requestId: event.requestId });
            else {
                const mockedResponse = await pipelineContext.getMockResponse();

                await this._handleMockErrorIfNecessary(pipelineContext, event);

                const mockedResponseEvent = createRequestPausedEventForResponse(mockedResponse, event);

                await this.requestHookEventProvider.onResponse(mockedResponseEvent, mockedResponse.getBody(), this._client);

                await this._handleMockResponse(mockedResponse, pipelineContext, event);
            }
        }
        else {
            try {
                await this._respondToOtherRequest(event);
            }
            catch (err) {
                if (event.networkId && this._failedRequestIds.includes(event.networkId)) {
                    remove(this._failedRequestIds, event.networkId);

                    return;
                }

                throw err;
            }
        }
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

    public init (options: ProxylessSetupOptions): void {
        this._options = options;

        this._client.Fetch.on('requestPaused', async (event: RequestPausedEvent) => {
            if (this._stopped)
                return;

            const specialRequestHandler = getSpecialRequestHandler(event, this._options, this._specialServiceRoutes);

            if (specialRequestHandler)
                await specialRequestHandler(event, this._client, this._options);
            else
                await this._handleOtherRequests(event);
        });

        this._client.Page.on('frameNavigated', async (event: FrameNavigatedEvent) => {
            requestPipelineLogger('%f', event);

            if (!this._topFrameNavigation(event)
                || event.frame.url !== SPECIAL_BLANK_PAGE)
                return;

            await this._resourceInjector.processAboutBlankPage(event, this._client);
        });

        this._client.Page.on('frameStartedLoading', async () => {
            await this._updateCurrentFrameTree();
        });

        this._client.Network.on('loadingFailed', async (event: LoadingFailedEvent) => {
            requestPipelineLogger('%l', event);

            this._failedRequestIds.push(event.requestId);

            if (event.requestId)
                this.requestHookEventProvider.cleanUp(event.requestId);
        });
    }

    public stop (): void {
        this._stopped = true;
    }
}
