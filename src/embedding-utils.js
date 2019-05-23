const lazyRequire = require('import-lazy')(require);

const hammerhead                     = lazyRequire('testcafe-hammerhead');
const ReporterPluginHost             = lazyRequire('./reporter/plugin-host');
const getTestListModule              = lazyRequire('./compiler/test-file/formats/es-next/get-test-list');
const getTypeScriptTestListModule    = lazyRequire('./compiler/test-file/formats/typescript/get-test-list');
const getCoffeeScriptTestListModule  = lazyRequire('./compiler/test-file/formats/coffeescript/get-test-list');
const COMMAND_TYPE                   = lazyRequire('./test-run/commands/type');
const ASSERTION_TYPE                 = lazyRequire('./assertions/type');
const createCommandFromObject        = lazyRequire('./test-run/commands/from-object');
const initializers                   = lazyRequire('./test-run/commands/validations/initializers');
const errorTypes                     = lazyRequire('./errors/types');
const TestRunErrorFormattableAdapter = lazyRequire('./errors/test-run/formattable-adapter');
const testRunErrors                  = lazyRequire('./errors/test-run');
const processTestFnError             = lazyRequire('./errors/process-test-fn-error');
const testRunErrorUtils              = lazyRequire('./errors/test-run/utils');
const browserProviderPool            = lazyRequire('./browser/provider/pool');
const BrowserConnection              = lazyRequire('./browser/connection');


// NOTE: we can't use lazy require for TestRun and Assignable, because it breaks prototype chain for inherited classes
let TestRun    = null;
let Assignable = null;

export default {
    TestRunErrorFormattableAdapter,
    testRunErrors,
    COMMAND_TYPE,
    ASSERTION_TYPE,
    errorTypes,
    testRunErrorUtils,
    BrowserConnection,

    get Assignable () {
        if (!Assignable)
            Assignable = require('./utils/assignable');

        return Assignable;
    },

    get TestRun () {
        if (!TestRun)
            TestRun = require('./test-run');

        return TestRun;
    },

    get getTestList () {
        return getTestListModule.getTestList;
    },

    get getTypeScriptTestList () {
        return getTypeScriptTestListModule.getTypeScriptTestList;
    },

    get getCoffeeScriptTestList () {
        return getCoffeeScriptTestListModule.getCoffeeScriptTestList;
    },

    get getTestListFromCode () {
        return getTestListModule.getTestListFromCode;
    },

    get getTypeScriptTestListFromCode () {
        return getTypeScriptTestListModule.getTypeScriptTestListFromCode;
    },

    get getCoffeeScriptTestListFromCode () {
        return getCoffeeScriptTestListModule.getCoffeeScriptTestListFromCode;
    },

    get initSelector () {
        return initializers.initSelector;
    },

    get createCommandFromObject () {
        return createCommandFromObject;
    },

    get processTestFnError () {
        return processTestFnError;
    },

    get browserProviderPool () {
        return browserProviderPool;
    },

    ensureUploadDirectory (...args) {
        return hammerhead.UploadStorage.ensureUploadsRoot(...args);
    },

    copyFilesToUploadFolder (...args) {
        return hammerhead.UploadStorage.copy(...args);
    },

    buildReporterPlugin (pluginFactory, outStream) {
        const plugin = pluginFactory();

        return new ReporterPluginHost(plugin, outStream);
    }
};
