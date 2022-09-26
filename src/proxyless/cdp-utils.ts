import { ProtocolApi } from 'chrome-remote-interface';
import { StatusCodes } from 'http-status-codes';

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
