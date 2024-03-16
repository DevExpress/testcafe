import embeddingUtils from './embedding-utils';
import exportableLib from './api/exportable-lib';
import TestCafeConfiguration from './configuration/testcafe-configuration';
import OPTION_NAMES from './configuration/option-names';
import userVariables from './api/user-variables';
import { getValidPort } from './configuration/utils';
import getTestCafeVersion from './utils/get-testcafe-version';
import { versionLogger } from './utils/debug-loggers';

const lazyRequire   = require('import-lazy')(require);
const TestCafe      = lazyRequire('./testcafe');
const setupExitHook = lazyRequire('async-exit-hook');

// API
async function getConfiguration (args) {
    let configuration;

    if (args.length === 1 && typeof args[0] === 'object') {
        configuration = new TestCafeConfiguration(args[0]?.configFile);

        await configuration.init(args[0]);
    }
    else {
        // NOTE: Positional arguments support is left only for backward compatibility.
        // It should be removed in future TestCafe versions.
        // All new APIs should be enabled through the configuration object in the upper clause.
        // Please do not add new APIs here.
        const [hostname, port1, port2, ssl, developmentMode, retryTestPages, cache, configFile, compilerOptions] = args;

        configuration = new TestCafeConfiguration(configFile);

        await configuration.init({
            hostname,
            port1,
            port2,
            ssl,
            developmentMode,
            retryTestPages,
            cache,
            compilerOptions,
        });
    }

    return configuration;
}

// API
async function createTestCafe (...args) {
    versionLogger(getTestCafeVersion());

    const configuration = await getConfiguration(args);

    const [port1, port2] = await Promise.all([
        getValidPort(configuration.getOption(OPTION_NAMES.port1)),
        getValidPort(configuration.getOption(OPTION_NAMES.port2)),
    ]);

    const userVariablesOption = configuration.getOption(OPTION_NAMES.userVariables);

    if (userVariablesOption)
        userVariables.value = userVariablesOption;

    configuration.mergeOptions({ port1, port2 });

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
