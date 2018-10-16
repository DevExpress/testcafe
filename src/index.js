import Promise from 'pinkie';
import { GeneralError } from './errors/runtime';
import MESSAGE from './errors/runtime/message';


const lazyRequire = require('import-lazy')(require);
const TestCafe = lazyRequire('./testcafe');
const endpointUtils = lazyRequire('endpoint-utils');
const setupExitHook = lazyRequire('async-exit-hook');
const embeddingUtils = lazyRequire('./embedding-utils');
const exportableLib = lazyRequire('./api/exportable-lib');


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

export default new Proxy(createTestCafe, {
    get (target, property) {
        if (exportableLib[property])
            return exportableLib[property];

        return Reflect.get(target, property);
    },
});
