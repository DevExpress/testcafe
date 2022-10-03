import { ProtocolApi } from 'chrome-remote-interface';
import { StatusCodes } from 'http-status-codes';
import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import HeaderEntry = Protocol.Fetch.HeaderEntry;
import { IncomingHttpHeaders } from 'http';


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

export async function continueRequestOrResponse (client: ProtocolApi, event: RequestPausedEvent): Promise<void> {
    const { requestId } = event;

    if (isRequest(event))
        await client.Fetch.continueRequest({ requestId });
    else
        await client.Fetch.continueResponse({ requestId });
}

export function isRequest (event: RequestPausedEvent): boolean {
    return event.responseStatusCode === void 0;
}

export function convertToHeaderEntries (headers: IncomingHttpHeaders): HeaderEntry[] {
    return Object.entries(headers).map(([name, value]) => {
        let resultValue = '';

        if (value)
            resultValue = Array.isArray(value) ? value.toString() : value;

        return { name, value: resultValue };
    });
}


