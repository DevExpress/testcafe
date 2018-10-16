import Promise from 'pinkie';
import { GeneralError } from './errors/runtime';
import MESSAGE from './errors/runtime/message';
import embeddingUtils from './embedding-utils';
import exportableLib from './api/exportable-lib';

const lazyRequire   = require('import-lazy')(require);
const TestCafe      = lazyRequire('./testcafe');
const endpointUtils = lazyRequire('endpoint-utils');
const setupExitHook = lazyRequire('async-exit-hook');

// Validations
async function getValidHostname (hostname) {
    if (hostname) {
        const valid = await endpointUtils.isMyHostname(hostname);

        if (!valid)
            throw new GeneralError(MESSAGE.invalidHostname, hostname);
    }
    else
        hostname = endpointUtils.getIPAddress();

    return hostname;
}

async function getValidPort (port) {
    if (port) {
        const isFree = await endpointUtils.isFreePort(port);

        if (!isFree)
            throw new GeneralError(MESSAGE.portIsNotFree, port);
    }
    else
        port = await endpointUtils.getFreePort();

    return port;
}

// API
async function createTestCafe (hostname, port1, port2, sslOptions, developmentMode, retryTestPages) {
    [hostname, port1, port2] = await Promise.all([
        getValidHostname(hostname),
        getValidPort(port1),
        getValidPort(port2)
    ]);

    const testcafe = new TestCafe(hostname, port1, port2, {
        ssl: sslOptions,
        developmentMode,
        retryTestPages
    });

    setupExitHook(cb => testcafe.close().then(cb));

    return testcafe;
}

// Embedding utils
createTestCafe.embeddingUtils = embeddingUtils;

// Common API
Object.keys(exportableLib).forEach(key => {
    Object.defineProperty(createTestCafe, key, { get: () => exportableLib[key] });
});

export default createTestCafe;
