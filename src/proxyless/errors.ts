export function notImplementedError (): Error {
    return new Error('Not implemented');
}

export function failedToFindDNSError (url: string): Error {
    return new Error(`Failed to find a DNS-record for the resource at "${url}"`);
}

export function sslCertificateError (type: string): Error {
    return new Error(`SSL certificate error (${type})`);
}

export function unknownCDPEventType (type: string): Error {
    return new Error(`Unknown CDP event type: ${type}`);
}

