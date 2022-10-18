import { ProtocolApi } from 'chrome-remote-interface';
import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import FrameNavigatedEvent = Protocol.Page.FrameNavigatedEvent;
import LoadingFailedEvent = Protocol.Network.LoadingFailedEvent;
import ProxylessRequestHookEventProvider from './request-hooks/event-provider';
import ResourceInjector from './resource-injector';
import { convertToHeaderEntries, isRequest } from './utils/cdp';
import BrowserConnection from '../browser/connection';
import ERROR_ROUTE from './error-route';
import { SpecialServiceRoutes } from './types';
import { requestPipelineLogger, requestPipelineMockLogger } from '../utils/debug-loggers';
import { IncomingMessageLike, SPECIAL_BLANK_PAGE } from 'testcafe-hammerhead';
import ProxylessPipelineContext from './request-hooks/pipeline-context';

const INVALID_INTERCEPTED_RESPONSE_ERROR_MSG = 'Invalid InterceptionId.';

export default class ProxylessRequestPipeline {
    private readonly _browserId: string;
    private readonly _client: ProtocolApi;
    public readonly requestHookEventProvider: ProxylessRequestHookEventProvider;
    private readonly _resourceInjector: ResourceInjector;
    private _serviceDomains: string[];
    private readonly _specialServiceRoutes: SpecialServiceRoutes;
    private _stopped: boolean;

    public constructor (browserId: string, client: ProtocolApi) {
        this._browserId               = browserId;
        this._client                  = client;
        this._specialServiceRoutes    = this._getSpecialServiceRoutes(browserId);
        this.requestHookEventProvider = new ProxylessRequestHookEventProvider();
        this._resourceInjector        = new ResourceInjector(browserId, this._specialServiceRoutes);
        this._serviceDomains          = [];
        this._stopped                 = false;
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

    private _isServiceRequest (url: string): boolean {
        // NOTE: the service 'Error page' should be proxied.
        if (url === this._specialServiceRoutes.errorPage1
            || url === this._specialServiceRoutes.errorPage2)
            return false;

        return this._serviceDomains.some(domain => url.startsWith(domain));
    }

    private async _handleServiceRequest (event: RequestPausedEvent): Promise<void> {
        const { requestId } = event;

        if (isRequest(event))
            await this._client.Fetch.continueRequest({ requestId });
        else {
            // Hack: CDP doesn't allow to continue response for requests sent from the reloaded page.
            // Such situation rarely occurs on 'heartbeat' or 'open-file-protocol' requests.
            // We are using the simplest way to fix it - just omit such errors.
            try {
                await this._client.Fetch.continueResponse({ requestId });
            }
            catch (err: any) {
                if (err.message === INVALID_INTERCEPTED_RESPONSE_ERROR_MSG)
                    return;

                throw err;
            }

        }
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
            await this._resourceInjector.processHTMLPageContent(fulfillInfo, this._client);

        requestPipelineMockLogger(`Mock request ${event.requestId}`);

    }

    private async _handleRequestMock (event: RequestPausedEvent): Promise<boolean> {
        const pipelineContext = this.requestHookEventProvider.getPipelineContext(event.networkId as string);

        if (!pipelineContext?.mock)
            return false;

        const mockedResponse = await pipelineContext.getMockResponse();

        await this._handleMockErrorIfNecessary(pipelineContext, event);
        await this._handleMockResponse(mockedResponse, pipelineContext, event);

        return true;
    }

    private async _handleOtherRequests (event: RequestPausedEvent): Promise<void> {
        if (isRequest(event)) {
            await this.requestHookEventProvider.onRequest(event);

            const requestIsHandled = await this._handleRequestMock(event);

            if (!requestIsHandled)
                await this._client.Fetch.continueRequest({ requestId: event.requestId });
            else
                await this.requestHookEventProvider.onResponse(event);
        }
        else {
            await this.requestHookEventProvider.onResponse(event);
            await this._resourceInjector.onResponse(event, this._client);
        }
    }

    private _topFrameNavigation (event: FrameNavigatedEvent): boolean {
        return event.type === 'Navigation'
            && !event.frame.parentId;
    }

    private _isInternalRequest (event: RequestPausedEvent): boolean {
        return !event.networkId;
    }

    private async _failInternalRequest (event: RequestPausedEvent): Promise<void> {
        await this._client.Fetch.failRequest({
            requestId:   event.requestId,
            errorReason: 'Aborted',
        });
    }

    public init (): void {
        this._client.Fetch.on('requestPaused', async (event: RequestPausedEvent) => {
            if (this._stopped)
                return;

            requestPipelineLogger('%r', event);

            if (this._isInternalRequest(event))
                await this._failInternalRequest(event);
            else if (this._isServiceRequest(event.request.url))
                await this._handleServiceRequest(event);
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

        this._client.Network.on('loadingFailed', async (event: LoadingFailedEvent) => {
            requestPipelineLogger('%l', event);

            if (event.requestId)
                this.requestHookEventProvider.cleanUp(event.requestId);
        });
    }

    public setServiceDomains (domains: string[]): void {
        this._serviceDomains = domains;
    }

    public stop (): void {
        this._stopped = true;
    }
}
