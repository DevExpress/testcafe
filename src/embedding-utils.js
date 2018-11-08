const lazyRequire                    = require('import-lazy')(require);
const hammerhead                     = lazyRequire('testcafe-hammerhead');
const ReporterPluginHost             = lazyRequire('./reporter/plugin-host');
const TestRunErrorFormattableAdapter = lazyRequire('./errors/test-run/formattable-adapter');
const testRunErrors                  = lazyRequire('./errors/test-run');
const TestRun                        = lazyRequire('./test-run');
const COMMAND_TYPE                   = lazyRequire('./test-run/commands/type');
const Assignable                     = lazyRequire('./utils/assignable');
const getTestListModule              = lazyRequire('./compiler/test-file/formats/es-next/get-test-list');
const getTypeScriptTestListModule    = lazyRequire('./compiler/test-file/formats/typescript/get-test-list');
const getCoffeeScriptTestListModule  = lazyRequire('./compiler/test-file/formats/coffeescript/get-test-list');
const initializers                   = lazyRequire('./test-run/commands/validations/initializers');

export default {
    TestRunErrorFormattableAdapter,
    TestRun,
    testRunErrors,
    COMMAND_TYPE,
    Assignable,

    getTestList (...args) {
        return getTestListModule.getTestList(...args);
    },

    getTypeScriptTestList (...args) {
        return getTypeScriptTestListModule.getTypeScriptTestList(...args);
    },

    getCoffeeScriptTestList (...args) {
        return getCoffeeScriptTestListModule.getCoffeeScriptTestList(...args);
    },

    getTestListFromCode (...args) {
        return getTestListModule.getTestListFromCode(...args);
    },

    getTypeScriptTestListFromCode (...args) {
        return getTypeScriptTestListModule.getTypeScriptTestListFromCode(...args);
    },

    getCoffeeScriptTestListFromCode (...args) {
        return getCoffeeScriptTestListModule.getCoffeeScriptTestListFromCode(...args);
    },

    initSelector (...args) {
        return initializers.initSelector(...args);
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
