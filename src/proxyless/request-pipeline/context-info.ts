import { Dictionary } from '../../configuration/interfaces';
import ProxylessPipelineContext from '../request-hooks/pipeline-context';
import RequestPausedEventBasedEventFactory from '../request-hooks/event-factory/request-paused-event-based';
import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import FrameNavigatedEvent = Protocol.Page.FrameNavigatedEvent;
import TestRunBridge from './test-run-bridge';
import { getRequestId, isRequestPausedEvent } from '../utils/cdp';
import { BaseRequestHookEventFactory } from 'testcafe-hammerhead';
import FrameNavigatedEventBasedEventFactory from '../request-hooks/event-factory/frame-navigated-event-based';

export interface ContextData {
    pipelineContext: ProxylessPipelineContext;
    eventFactory: BaseRequestHookEventFactory;
}

export default class ProxylessRequestContextInfo {
    private readonly _pipelineContexts: Dictionary<ProxylessPipelineContext>;
    private readonly _eventFactories: Dictionary<BaseRequestHookEventFactory>;
    private readonly _testRunBridge: TestRunBridge;

    public constructor (testRunBridge: TestRunBridge) {
        this._pipelineContexts = {};
        this._eventFactories   = {};
        this._testRunBridge    = testRunBridge;
    }

    private _createPipelineContext (requestId: string): ProxylessPipelineContext {
        const pipelineContext = new ProxylessPipelineContext(requestId);

        this._pipelineContexts[requestId] = pipelineContext;

        return pipelineContext;
    }

    private _createEventFactory (event: RequestPausedEvent | FrameNavigatedEvent): BaseRequestHookEventFactory {
        const sessionId    = this._testRunBridge.getSessionId();
        const requestId    = getRequestId(event);
        const eventFactory = isRequestPausedEvent(event) ? new RequestPausedEventBasedEventFactory(event, sessionId) : new FrameNavigatedEventBasedEventFactory(event, sessionId);

        this._eventFactories[requestId] = eventFactory;

        return eventFactory;
    }

    private _getEventFactory (requestId: string): BaseRequestHookEventFactory {
        return this._eventFactories[requestId];
    }

    public init (event: RequestPausedEvent | FrameNavigatedEvent): void {
        const requestId       = getRequestId(event);
        const pipelineContext = this._createPipelineContext(requestId);
        const eventFactory    = this._createEventFactory(event);

        pipelineContext.setRequestOptions(eventFactory);
    }
    public dispose (requestId?: string): void {
        if (!requestId)
            return;

        delete this._pipelineContexts[requestId];
        delete this._eventFactories[requestId];
    }

    public getPipelineContext (requestId: string): ProxylessPipelineContext {
        return this._pipelineContexts[requestId];
    }

    public getContextData (event: RequestPausedEvent | FrameNavigatedEvent): ContextData {
        const requestId       = getRequestId(event);
        const pipelineContext = this.getPipelineContext(requestId);
        const eventFactory    = this._getEventFactory(requestId);

        return { pipelineContext, eventFactory };
    }
}
