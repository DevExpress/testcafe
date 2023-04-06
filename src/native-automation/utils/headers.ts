import Protocol from 'devtools-protocol';
import HeaderEntry = Protocol.Fetch.HeaderEntry;
import Headers = Protocol.Network.Headers;
import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http';


export function convertToHeaderEntries (headers: IncomingHttpHeaders): HeaderEntry[] {
    return Object.entries(headers).map(([name, value]) => {
        let resultValue = '';

        if (value)
            resultValue = Array.isArray(value) ? value.toString() : value;

        return { name, value: resultValue };
    });
}

export function convertToOutgoingHttpHeaders (headers: HeaderEntry[] | undefined): OutgoingHttpHeaders {
    if (!headers)
        return {};

    return headers.reduce((result: any, header) => {
        result[header.name.toLowerCase()] = header.value;

        return result;
    }, {});
}

export function lowerCaseHeaderNames (headers: Headers): Headers {
    const result: Headers = {};

    Object.keys(headers).forEach(name => {
        result[name.toLowerCase()] = headers[name];
    });

    return result;
}

