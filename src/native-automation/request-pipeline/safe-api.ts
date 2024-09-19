import { ProtocolApi } from 'chrome-remote-interface';
import { requestPipelineLogger } from '../../utils/debug-loggers';
import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import FulfillRequestRequest = Protocol.Fetch.FulfillRequestRequest;
import ContinueResponseRequest = Protocol.Fetch.ContinueResponseRequest;
import ErrorReason = Protocol.Network.ErrorReason;
import { isRequestPausedEvent } from '../utils/cdp';
import { ContinueRequestArgs, SessionId } from '../types';

const IGNORED_ERROR_CODES = {
    // In some cases (a request was aborted, any page that initiated the request doesn't exist, etc.)
    // Chrome Debug Protocol doesn't allow to continue request pipeline
    // and raises the "Invalid InterceptionId" error.
    INVALID_INTERCEPTION_ID:         -32602,
    // The "Session not found" error can occur in iframes for unclear reasons.
    SESSION_WITH_GIVEN_ID_NOT_FOUND: -32001,
};
//The "WebSocket connection closed" error occurs on closeWindow in multiple windows mode
const IGNORED_ERROR_MESSAGES = ['WebSocket connection closed'];

export async function connectionResetGuard (handleRequestFn: () => Promise<void>, handleErrorFn: (err: any) => void): Promise<void> {
    try {
        await handleRequestFn();
    }
    catch (err: any) {
        if (Object.values(IGNORED_ERROR_CODES).includes(err?.response?.code) || IGNORED_ERROR_MESSAGES.includes(err.message))
            return;

        handleErrorFn(err);

        throw err;
    }
}

export async function safeContinueResponse (client: ProtocolApi, data: RequestPausedEvent | ContinueResponseRequest, sessionId: SessionId): Promise<void> {
    const isPausedEvent = isRequestPausedEvent(data);

    await connectionResetGuard(async () => {
        const param = isPausedEvent
            ? { requestId: data.requestId }
            : data;

        // @ts-ignore
        await client.Fetch.continueResponse(param, sessionId);
    }, err => {
        const formatter = isPausedEvent ? '%r' : '%s';

        requestPipelineLogger(`Fetch.continueResponse. Unhandled error %s during processing ${formatter}`, err, data);
    });
}

export async function safeFulfillRequest (client: ProtocolApi, fulfillInfo: FulfillRequestRequest, sessionId: SessionId): Promise<void> {
    await connectionResetGuard(async () => {
        // @ts-ignore
        await client.Fetch.fulfillRequest(fulfillInfo, sessionId);
    }, err => {
        requestPipelineLogger(`Fetch.fulfillRequest. Unhandled error %s during processing %s`, err, fulfillInfo.requestId);
    });
}

export async function safeContinueRequest (client: ProtocolApi, event: RequestPausedEvent, sessionId: SessionId, continueRequestArgs?: ContinueRequestArgs): Promise<void> {
    const { postData, method, url, headers } = continueRequestArgs || {};

    await connectionResetGuard(async () => {
        // @ts-ignore
        await client.Fetch.continueRequest({ requestId: event.requestId, postData, method, url, headers }, sessionId);
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
