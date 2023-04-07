import {
    BaseRequestHookEventFactory,
    OnResponseEventData,
    RequestHookEventProvider,
} from 'testcafe-hammerhead';
import NativeAutomationPipelineContext from './pipeline-context';
import RequestPausedEventBasedEventFactory from './event-factory/request-paused-event-based';
import { ProtocolApi } from 'chrome-remote-interface';
import { getResponseAsBuffer } from '../utils/string';
import { isPreflightRequest } from '../utils/cdp';
import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import NativeAutomationRequestContextInfo from '../request-pipeline/context-info';

export default class NativeAutomationRequestHookEventProvider extends RequestHookEventProvider {
    private static _hasResponseWithBody (context: NativeAutomationPipelineContext): boolean {
        return context.onResponseEventData.some((eventData: OnResponseEventData) => eventData.opts.includeBody);
    }

    private static async _setResponseBody ({ pipelineContext, resourceBody, eventFactory, event, client }: { pipelineContext: NativeAutomationPipelineContext, resourceBody: Buffer | null, eventFactory: BaseRequestHookEventFactory, event: RequestPausedEvent, client: ProtocolApi }): Promise<void> {
        if (resourceBody?.length || isPreflightRequest(event)) {
            (eventFactory as RequestPausedEventBasedEventFactory).setResponseBody(resourceBody as Buffer);

            return;
        }


        const hasOnResponseWithBody = NativeAutomationRequestHookEventProvider._hasResponseWithBody(pipelineContext);

        if (!hasOnResponseWithBody)
            return;

        const responseObj  = await client.Fetch.getResponseBody({ requestId: event.requestId });
        const responseBody = getResponseAsBuffer(responseObj);

        (eventFactory as RequestPausedEventBasedEventFactory).setResponseBody(responseBody);
    }

    public async onRequest (event: RequestPausedEvent, contextInfo: NativeAutomationRequestContextInfo): Promise<void> {
        if (!this.hasRequestEventListeners())
            return;

        const { pipelineContext, eventFactory } = contextInfo.getContextData(event);

        await pipelineContext.onRequestHookRequest(this, eventFactory);
    }

    public async onResponse (event: RequestPausedEvent, resourceBody: Buffer | null, contextInfo: NativeAutomationRequestContextInfo, client: ProtocolApi): Promise<boolean> {
        let modified = false;

        if (!this.hasRequestEventListeners())
            return modified;

        const { pipelineContext, eventFactory } = contextInfo.getContextData(event);

        (eventFactory as RequestPausedEventBasedEventFactory).update(event);

        await pipelineContext.onRequestHookConfigureResponse(this, eventFactory);

        if ((eventFactory as RequestPausedEventBasedEventFactory).headersModified)
            modified = true;

        await NativeAutomationRequestHookEventProvider._setResponseBody({
            pipelineContext,
            resourceBody,
            eventFactory,
            event,
            client,
        });

        await Promise.all(pipelineContext.onResponseEventData.map(async eventData => {
            await pipelineContext.onRequestHookResponse(this, eventFactory, eventData.rule, eventData.opts);
        }));

        return modified;
    }
}
