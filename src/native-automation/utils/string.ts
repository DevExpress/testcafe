import Protocol from 'devtools-protocol';
import GetResponseBodyResponse = Protocol.Network.GetResponseBodyResponse;
import HeaderEntry = Protocol.Fetch.HeaderEntry;
import { decodeBufferToString, encodeStringToBuffer } from 'testcafe-hammerhead';

export function getResponseAsString (response: GetResponseBodyResponse, contentType = ''): string {
    const bufferBody = getResponseAsBuffer(response);

    return decodeBufferToString(bufferBody, contentType);
}

export function getResponseAsBuffer (response: GetResponseBodyResponse): Buffer {
    return response.base64Encoded
        ? Buffer.from(response.body, 'base64')
        : Buffer.from(response.body);
}

export function toBase64String (str: string, contentType = ''): string {
    const bufferBody = encodeStringToBuffer(str, contentType);

    return bufferBody.toString('base64');
}

export function fromBase64String (str: string): Buffer {
    return Buffer.from(str, 'base64');
}

export function stringifyHeaderValues (headers: Record<string, any>[]): HeaderEntry[] {
    return headers.map(({ name, value }) => {
        if (typeof value !== 'string')
            value = value.toString ? value.toString() : String(value);

        return { name, value };
    });
}

