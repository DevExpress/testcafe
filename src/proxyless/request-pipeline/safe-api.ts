import { ProtocolApi } from 'chrome-remote-interface';
import { requestPipelineLogger } from '../../utils/debug-loggers';
import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import FulfillRequestRequest = Protocol.Fetch.FulfillRequestRequest;
import ContinueResponseRequest = Protocol.Fetch.ContinueResponseRequest;
import { isRequestPausedEvent } from '../utils/cdp';

const INVALID_INTERCEPTED_RESPONSE_ERROR_MSG = 'Invalid InterceptionId.';

// In some cases (a request was aborted, any page that initiated the request doesn't exist, etc.)
// Chrome Debug Protocol doesn't allow to continue request pipeline
// and raises the "Invalid InterceptionId" error.
// We use the simplest way to fix it - omit such an error.

export async function safeContinueResponse (client: ProtocolApi, data: RequestPausedEvent | ContinueResponseRequest): Promise<void> {
    const isPausedEvent = isRequestPausedEvent(data);

    try {
        const param = isPausedEvent
            ? { requestId: data.requestId }
            : data;

        await client.Fetch.continueResponse(param);
    }
    catch (err: any) {
        if (err.message === INVALID_INTERCEPTED_RESPONSE_ERROR_MSG)
            return;

        const formatter = isPausedEvent ? '%r' : '%s';

        requestPipelineLogger(`Fetch.continueResponse. Unhandled error %s during processing ${formatter}`, err, data);

        throw err;
    }
}

export async function safeFulfillRequest (client: ProtocolApi, fulfillInfo: FulfillRequestRequest): Promise<void> {
    try {
        await client.Fetch.fulfillRequest(fulfillInfo);
    }
    catch (err: any) {
        if (err.message === INVALID_INTERCEPTED_RESPONSE_ERROR_MSG)
            return;

        requestPipelineLogger(`Fetch.fulfillRequest. Unhandled error %s during processing %s`, err, fulfillInfo.requestId);

        throw err;
    }
}

export async function safeContinueRequest (client: ProtocolApi, event: RequestPausedEvent): Promise<void> {
    try {
        await client.Fetch.continueRequest({ requestId: event.requestId });
    }
    catch (err: any) {
        if (err.message === INVALID_INTERCEPTED_RESPONSE_ERROR_MSG)
            return;

        requestPipelineLogger(`Fetch.continueRequest. Unhandled error %s during processing %r`, err, event);

        throw err;
    }
}
