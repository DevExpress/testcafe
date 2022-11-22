import { OnResponseEventData, RequestHookEventProvider } from 'testcafe-hammerhead';
import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import ProxylessPipelineContext from './pipeline-context';
import { Dictionary } from '../../configuration/interfaces';
import ProxylessEventFactory from './event-factory';
import { ProtocolApi } from 'chrome-remote-interface';
import { getResponseAsBuffer } from '../utils/string';
import BrowserConnection from '../../browser/connection';
import { isPreflightRequest } from '../utils/cdp';

interface ContextData {
    pipelineContext: ProxylessPipelineContext;
    eventFactory: ProxylessEventFactory;
}

export default class ProxylessRequestHookEventProvider extends RequestHookEventProvider {
    private readonly _pipelineContexts: Dictionary<ProxylessPipelineContext>;
    private readonly _eventFactories: Dictionary<ProxylessEventFactory>;
    private readonly _browserId: string;

    constructor (browserId: string) {
        super();

        this._pipelineContexts = {};
        this._eventFactories   = {};
        this._browserId        = browserId;
    }

    private _createPipelineContext (requestId: string): ProxylessPipelineContext {
        const pipelineContext = new ProxylessPipelineContext(requestId);

        this._pipelineContexts[requestId] = pipelineContext;

        return pipelineContext;
    }

    private _getSessionId (): string {
        const browserConnection = BrowserConnection.getById(this._browserId) as BrowserConnection;
        const currentTestRun    = browserConnection.getCurrentTestRun();

        return currentTestRun?.id || '';
    }

    private _createEventFactory (event: RequestPausedEvent): ProxylessEventFactory {
        const sessionId    = this._getSessionId();
        const eventFactory = new ProxylessEventFactory(event, sessionId);

        this._eventFactories[event.networkId as string] = eventFactory;

        return eventFactory;
    }

    public getPipelineContext (requestId: string): ProxylessPipelineContext {
        return this._pipelineContexts[requestId];
    }

    private _getEventFactory (requestId: string): ProxylessEventFactory {
        return this._eventFactories[requestId];
    }

    private _getContextData (event: RequestPausedEvent): ContextData {
        const pipelineContext = this.getPipelineContext(event.networkId as string);
        const eventFactory    = this._getEventFactory(event.networkId as string);

        return { pipelineContext, eventFactory };
    }

    private static _hasResponseWithBody (context: ProxylessPipelineContext): boolean {
        return context.onResponseEventData.some((eventData: OnResponseEventData) => eventData.opts.includeBody);
    }

    private static async _setResponseBody ({ pipelineContext, resourceBody, eventFactory, event, client }: { pipelineContext: ProxylessPipelineContext, resourceBody: Buffer | null, eventFactory: ProxylessEventFactory, event: RequestPausedEvent, client: ProtocolApi }): Promise<void> {
        if (resourceBody?.length || isPreflightRequest(event)) {
            eventFactory.setResponseBody(resourceBody as Buffer);

            return;
        }


        const hasOnResponseWithBody = ProxylessRequestHookEventProvider._hasResponseWithBody(pipelineContext);

        if (!hasOnResponseWithBody)
            return;

        const responseObj  = await client.Fetch.getResponseBody({ requestId: event.requestId });
        const responseBody = getResponseAsBuffer(responseObj);

        eventFactory.setResponseBody(responseBody);
    }

    public cleanUp (requestId: string): void {
        delete this._pipelineContexts[requestId];
        delete this._eventFactories[requestId];
    }

    public async onRequest (event: RequestPausedEvent): Promise<void> {
        if (!this.hasRequestEventListeners())
            return;

        const pipelineContext = this._createPipelineContext(event.networkId as string);
        const eventFactory    = this._createEventFactory(event);

        pipelineContext.setRequestOptions(eventFactory);

        await pipelineContext.onRequestHookRequest(this, eventFactory);
    }

    public async onResponse (event: RequestPausedEvent, resourceBody: Buffer | null, client: ProtocolApi): Promise<boolean> {
        let modified = false;

        if (!this.hasRequestEventListeners()) {
            this.cleanUp(event.networkId as string);

            return modified;
        }

        const { pipelineContext, eventFactory } = this._getContextData(event);

        eventFactory.update(event);

        await pipelineContext.onRequestHookConfigureResponse(this, eventFactory);

        if (eventFactory.headersModified)
            modified = true;

        await ProxylessRequestHookEventProvider._setResponseBody({
            pipelineContext,
            resourceBody,
            eventFactory,
            event,
            client,
        });

        await Promise.all(pipelineContext.onResponseEventData.map(async eventData => {
            await pipelineContext.onRequestHookResponse(this, eventFactory, eventData.rule, eventData.opts);
        }));

        this.cleanUp(event.networkId as string);

        return modified;
    }
}
