import { RequestHookEventProvider } from 'testcafe-hammerhead';
import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import ProxylessPipelineContext from './pipeline-context';
import { Dictionary } from '../../configuration/interfaces';
import ProxylessEventFactory from './event-factory';


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

        this._eventFactories[event.networkId as string] = eventFactory;

        return eventFactory;
    }

    public getPipelineContext (requestId: string): ProxylessPipelineContext {
        return this._pipelineContexts[requestId];
    }

    private _getEventFactory (requestId: string): ProxylessEventFactory {
        return this._eventFactories[requestId];
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

    public async onResponse (event: RequestPausedEvent): Promise<void> {
        this.cleanUp(event.networkId as string);
    }
}
