import { ProtocolApi } from 'chrome-remote-interface';
import { StatusCodes } from 'http-status-codes';
import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import { IncomingMessageLike } from 'testcafe-hammerhead';
import { convertToHeaderEntries } from './headers';


export async function redirect (client: ProtocolApi, requestId: string, url: string): Promise<void> {
    await client.Fetch.fulfillRequest({
        requestId,
        responseCode:    StatusCodes.MOVED_PERMANENTLY,
        responseHeaders: [
            { name: 'location', value: url },
        ],
    });
}

export async function navigateTo (client: ProtocolApi, url: string): Promise<void> {
    await client.Page.navigate({ url });
}

export function isRequest (event: RequestPausedEvent): boolean {
    return event.responseStatusCode === void 0;
}

export function isRequestPausedEvent (val: any): val is RequestPausedEvent {
    return val && val.frameId && typeof val.request === 'object';
}

export function isPreflightRequest (event: RequestPausedEvent): boolean {
    return event.request.method === 'OPTIONS';
}

export function createRequestPausedEventForResponse (mockedResponse: IncomingMessageLike, requestEvent: RequestPausedEvent): RequestPausedEvent {
    return Object.assign({}, requestEvent, {
        responseStatusCode: mockedResponse.statusCode,
        responseHeaders:    convertToHeaderEntries(mockedResponse.headers),
    });
}
