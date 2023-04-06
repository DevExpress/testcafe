import { ProtocolApi } from 'chrome-remote-interface';
import { requestPipelineLogger } from '../../utils/debug-loggers';
import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import FulfillRequestRequest = Protocol.Fetch.FulfillRequestRequest;
import ContinueResponseRequest = Protocol.Fetch.ContinueResponseRequest;
import ErrorReason = Protocol.Network.ErrorReason;
import { isRequestPausedEvent } from '../utils/cdp';

const INVALID_INTERCEPTED_RESPONSE_ERROR_MSG = 'Invalid InterceptionId.';

// In some cases (a request was aborted, any page that initiated the request doesn't exist, etc.)
// Chrome Debug Protocol doesn't allow to continue request pipeline
// and raises the "Invalid InterceptionId" error.
// We use the simplest way to fix it - omit such an error.

async function connectionResetGuard (handleRequestFn: () => Promise<void>, handleErrorFn: (err: any) => void): Promise<void> {
    try {
        await handleRequestFn();
    }
    catch (err: any) {
        if (err.message === INVALID_INTERCEPTED_RESPONSE_ERROR_MSG)
            return;

        handleErrorFn(err);

        throw err;
    }
}

export async function safeContinueResponse (client: ProtocolApi, data: RequestPausedEvent | ContinueResponseRequest): Promise<void> {
    const isPausedEvent = isRequestPausedEvent(data);

    await connectionResetGuard(async () => {
        const param = isPausedEvent
            ? { requestId: data.requestId }
            : data;

        await client.Fetch.continueResponse(param);
    }, err => {
        const formatter = isPausedEvent ? '%r' : '%s';

        requestPipelineLogger(`Fetch.continueResponse. Unhandled error %s during processing ${formatter}`, err, data);
    });
}

export async function safeFulfillRequest (client: ProtocolApi, fulfillInfo: FulfillRequestRequest): Promise<void> {
    await connectionResetGuard(async () => {
        await client.Fetch.fulfillRequest(fulfillInfo);
    }, err => {
        requestPipelineLogger(`Fetch.fulfillRequest. Unhandled error %s during processing %s`, err, fulfillInfo.requestId);
    });
}

export async function safeContinueRequest (client: ProtocolApi, event: RequestPausedEvent): Promise<void> {
    await connectionResetGuard(async () => {
        await client.Fetch.continueRequest({ requestId: event.requestId });
    }, err => {
        requestPipelineLogger(`Fetch.continueRequest. Unhandled error %s during processing %r`, err, event);
    });
}

export async function safeFailRequest (client: ProtocolApi, event: RequestPausedEvent, errorReason: ErrorReason = 'Aborted'): Promise<void> {
    await connectionResetGuard(async () => {
        await client.Fetch.failRequest({
            requestId: event.requestId,
            errorReason,
        });
    }, err => {
        requestPipelineLogger(`Fetch.failRequest. Unhandled error %s during processing %s`, err, event.requestId);
    });
}
