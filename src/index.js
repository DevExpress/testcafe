import Promise from 'pinkie';
import TestCafe from './testcafe';
import * as endpointUtils from 'endpoint-utils';
import setupExitHook from 'async-exit-hook';
import { GeneralError } from './errors/runtime';
import MESSAGE from './errors/runtime/message';
import embeddingUtils from './embedding-utils';
import exportableLib from './api/exportable-lib';


// Validations
async function getValidHostname (hostname) {
    if (hostname) {
        var valid = await endpointUtils.isMyHostname(hostname);

        if (!valid)
            throw new GeneralError(MESSAGE.invalidHostname, hostname);
    }
    else
        hostname = endpointUtils.getIPAddress();

    return hostname;
}

async function getValidPort (port) {
    if (port) {
        var isFree = await endpointUtils.isFreePort(port);

        if (!isFree)
            throw new GeneralError(MESSAGE.portIsNotFree, port);
    }
    else
        port = await endpointUtils.getFreePort();

    return port;
}

// API
async function createTestCafe (hostname, port1, port2) {
    [hostname, port1, port2] = await Promise.all([
        getValidHostname(hostname),
        getValidPort(port1),
        getValidPort(port2)
    ]);

    var testcafe = new TestCafe(hostname, port1, port2);

    setupExitHook(cb => testcafe.close().then(cb));

    return testcafe;
}

// Embedding utils
createTestCafe.embeddingUtils = embeddingUtils;

// Common API
Object.keys(exportableLib).forEach(key => {
    createTestCafe[key] = exportableLib[key];
});

export default createTestCafe;
