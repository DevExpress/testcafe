import Protocol from 'devtools-protocol';
import HeaderEntry = Protocol.Fetch.HeaderEntry;
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

export function getHeaderEntry (headers: HeaderEntry[] | undefined, headerName: string): HeaderEntry | undefined {
    return headers?.find(header => header.name.toLowerCase() === headerName);
}

