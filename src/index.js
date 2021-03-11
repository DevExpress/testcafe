import { GeneralError } from './errors/runtime';
import { RUNTIME_ERRORS } from './errors/types';
import embeddingUtils from './embedding-utils';
import exportableLib from './api/exportable-lib';
import TestCafeConfiguration from './configuration/testcafe-configuration';
import OPTION_NAMES from './configuration/option-names';
import ProcessTitle from './services/process-title';

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
async function getConfiguration (args) {
    let configuration;

    if (args.length === 1 && typeof args[0] === 'object') {
        configuration = new TestCafeConfiguration(args[0]?.configFile);

        await configuration.init(args[0]);
    }
    else {
        const [hostname, port1, port2, ssl, developmentMode, retryTestPages, cache, configFile] = args;

        configuration = new TestCafeConfiguration(configFile);

        await configuration.init({
            hostname,
            port1,
            port2,
            ssl,
            developmentMode,
            retryTestPages,
            cache
        });
    }

    return configuration;
}

// API
async function createTestCafe (...args) {
    process.title = ProcessTitle.main;

    const configuration = await getConfiguration(args);

    const [hostname, port1, port2] = await Promise.all([
        getValidHostname(configuration.getOption(OPTION_NAMES.hostname)),
        getValidPort(configuration.getOption(OPTION_NAMES.port1)),
        getValidPort(configuration.getOption(OPTION_NAMES.port2))
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
