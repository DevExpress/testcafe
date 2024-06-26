import { GeneralError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';
import {
    isMyHostname,
    getIPAddress,
    isFreePort,
    getFreePort,
} from '../utils/endpoint-utils';

export async function getValidHostname (hostname: string): Promise<string> {
    if (hostname) {
        const valid = await isMyHostname(hostname);

        if (!valid)
            throw new GeneralError(RUNTIME_ERRORS.invalidHostname, hostname);
    }
    else {
        hostname = getIPAddress() ?? '';

        if (!hostname)
            throw new GeneralError(RUNTIME_ERRORS.invalidHostname, hostname);
    }

    return hostname;
}

export async function getValidPort (port: number): Promise<number> {
    if (port) {
        const isFree = await isFreePort(port);

        if (!isFree)
            throw new GeneralError(RUNTIME_ERRORS.portIsNotFree, port);
    }
    else
        port = await getFreePort();

    return port;
}
