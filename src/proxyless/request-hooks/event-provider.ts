import { ProtocolApi } from 'chrome-remote-interface';
import { RequestHookEventProvider } from 'testcafe-hammerhead';
import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import ProxylessPipelineContext from './pipeline-context';
import { Dictionary } from '../../configuration/interfaces';
import ProxylessEventFactory from './event-factory';
import { continueRequestOrResponse } from '../utils/cdp';


export default class ProxylessRequestHookEventProvider extends RequestHookEventProvider {
    private readonly _pipelineContexts: Dictionary<ProxylessPipelineContext>;
    private readonly _eventFactories: Dictionary<ProxylessEventFactory>;

    constructor () {
        super();

        this._pipelineContexts = {};
        this._eventFactories   = {};
    }

    private _createPipelineContext (requestId: string): ProxylessPipelineContext {
        const pipelineContext = new ProxylessPipelineContext(requestId);

        this._pipelineContexts[requestId] = pipelineContext;

        return pipelineContext;
    }

    private _createEventFactory (event: RequestPausedEvent): ProxylessEventFactory {
        const eventFactory = new ProxylessEventFactory(event);

        this._eventFactories[event.requestId] = eventFactory;

        return eventFactory;
    }

    public getPipelineContext (requestId: string): ProxylessPipelineContext {
        return this._pipelineContexts[requestId];
    }

    private _getEventFactory (requestId: string): ProxylessEventFactory {
        return this._eventFactories[requestId];
    }

    private _cleanUpServiceData (requestId: string): void {
        delete this._pipelineContexts[requestId];
        delete this._eventFactories[requestId];
    }

    public async onRequest (event: RequestPausedEvent, client: ProtocolApi): Promise<void> {
        if (!this.hasRequestEventListeners()) {
            await continueRequestOrResponse(client, event);

            return;
        }

        const pipelineContext = this._createPipelineContext(event.requestId);
        const eventFactory    = this._createEventFactory(event);

        pipelineContext.setRequestOptions(eventFactory);

        await pipelineContext.onRequestHookRequest(this, eventFactory);
    }

    public async onResponse (event: RequestPausedEvent, client: ProtocolApi): Promise<void> {
        if (!this.hasRequestEventListeners()) {
            await continueRequestOrResponse(client, event);

            return;
        }

        this._cleanUpServiceData(event.requestId);
    }
}
