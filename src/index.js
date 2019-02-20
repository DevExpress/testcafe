import Promise from 'pinkie';
import { GeneralError } from './errors/runtime';
import { RUNTIME_ERRORS } from './errors/types';
import embeddingUtils from './embedding-utils';
import exportableLib from './api/exportable-lib';
import Configuration from './configuration';

const lazyRequire   = require('import-lazy')(require);
const TestCafe      = lazyRequire('./testcafe');
const endpointUtils = lazyRequire('endpoint-utils');
const setupExitHook = lazyRequire('async-exit-hook');

// Validations
async function getValidHostname (hostname) {
    if (hostname) {
        const valid = await endpointUtils.isMyHostname(hostname);

        if (!valid)
            throw new GeneralError(RUNTIME_ERRORS.invalidHostname, hostname);
    }
    else
        hostname = endpointUtils.getIPAddress();

    return hostname;
}

async function getValidPort (port) {
    if (port) {
        const isFree = await endpointUtils.isFreePort(port);

        if (!isFree)
            throw new GeneralError(RUNTIME_ERRORS.portIsNotFree, port);
    }
    else
        port = await endpointUtils.getFreePort();

    return port;
}

// API
async function createTestCafe (hostname, port1, port2, sslOptions, developmentMode, retryTestPages) {
    const configuration = new Configuration();

    await configuration.init({
        hostname,
        port1,
        port2,
        ssl: sslOptions,
        developmentMode,
        retryTestPages
    });

    [hostname, port1, port2] = await Promise.all([
        getValidHostname(configuration.getOption('hostname')),
        getValidPort(configuration.getOption('port1')),
        getValidPort(configuration.getOption('port2'))
    ]);

    configuration.mergeOptions({ hostname, port1, port2 });

    const testcafe = new TestCafe(configuration);

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
