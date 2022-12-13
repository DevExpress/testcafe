import TEST_FILE_TEMP_VARIABLE_NAME from '../../compiler/test-file/test-file-temp-variable-name';

const lazyRequire           = require('import-lazy')(require);
const ClientFunctionBuilder = lazyRequire('../../client-functions/client-function-builder');
const SelectorBuilder       = lazyRequire('../../client-functions/selectors/selector-builder');
const role                  = lazyRequire('../../role');
const createRequestLogger   = lazyRequire('../request-hooks/request-logger');
const createRequestMock     = lazyRequire('../request-hooks/request-mock/create-request-mock');
const userVariables         = lazyRequire('../user-variables');
const addExportAPI          = lazyRequire('../../compiler/test-file/add-export-api');

// NOTE: We can't use lazy require for RequestHook, because it will break base class detection for inherited classes
let RequestHook = null;

// NOTE: We can't use lazy require for testControllerProxy, because it will break test controller detection
let testControllerProxy = null;

function Role (loginUrl, initFn, options) {
    return role.createRole(loginUrl, initFn, options);
}

function RequestMock () {
    return createRequestMock();
}

function RequestLogger (requestFilterRuleInit, logOptions) {
    return createRequestLogger(requestFilterRuleInit, logOptions);
}

function ClientFunction (fn, options) {
    const builder = new ClientFunctionBuilder(fn, options, { instantiation: 'ClientFunction' });

    return builder.getFunction();
}

function Selector (fn, options) {
    const builder = new SelectorBuilder(fn, options, { instantiation: 'Selector' });

    return builder.getFunction();
}

Object.defineProperty(Role, 'anonymous', {
    get: () => role.createAnonymousRole,
});

const exportableLib = {
    Role,

    ClientFunction,

    Selector,

    RequestLogger,

    RequestMock,

    get RequestHook () {
        if (!RequestHook)
            RequestHook = require('../request-hooks/hook');

        return RequestHook;
    },

    get t () {
        if (!testControllerProxy)
            testControllerProxy = require('../test-controller/proxy');

        return testControllerProxy;
    },

    get userVariables () {
        return userVariables.value;
    },
};

if (global[TEST_FILE_TEMP_VARIABLE_NAME]) {
    const { testFile, baseUrl } = global[TEST_FILE_TEMP_VARIABLE_NAME];

    addExportAPI(testFile, exportableLib, { isCompilerServiceMode: true, baseUrl });

    delete global[TEST_FILE_TEMP_VARIABLE_NAME];
}

export default exportableLib;

