import { GeneralError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';
import endpointUtils from 'endpoint-utils';

export async function getValidHostname (hostname: string): Promise<string> {
    if (hostname) {
        const valid = await endpointUtils.isMyHostname(hostname);

        if (!valid)
            throw new GeneralError(RUNTIME_ERRORS.invalidHostname, hostname);
    }
    else
        hostname = endpointUtils.getIPAddress();

    return hostname;
}

export async function getValidPort (port: number): Promise<number> {
    if (port) {
        const isFree = await endpointUtils.isFreePort(port);

        if (!isFree)
            throw new GeneralError(RUNTIME_ERRORS.portIsNotFree, port);
    }
    else
        port = await endpointUtils.getFreePort();

    return port;
}
