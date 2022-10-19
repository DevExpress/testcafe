import Protocol from 'devtools-protocol';
import GetResponseBodyResponse = Protocol.Network.GetResponseBodyResponse;
import HeaderEntry = Protocol.Fetch.HeaderEntry;

export function getResponseAsString (response: GetResponseBodyResponse): string {
    return response.base64Encoded
        ? Buffer.from(response.body, 'base64').toString()
        : response.body;
}

export function getResponseAsBuffer (response: GetResponseBodyResponse): Buffer {
    return response.base64Encoded
        ? Buffer.from(response.body, 'base64')
        : Buffer.from(response.body);
}

export function toBase64String (str: string): string {
    return Buffer.from(str).toString('base64');
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

