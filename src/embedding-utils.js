const lazyRequire = require('import-lazy')(require);

const hammerhead                     = lazyRequire('testcafe-hammerhead');
const ReporterPluginHost             = lazyRequire('./reporter/plugin-host');
const getTestListModule              = lazyRequire('./compiler/test-file/formats/es-next/get-test-list');
const getTypeScriptTestListModule    = lazyRequire('./compiler/test-file/formats/typescript/get-test-list');
const getCoffeeScriptTestListModule  = lazyRequire('./compiler/test-file/formats/coffeescript/get-test-list');
const COMMAND_TYPE                   = lazyRequire('./test-run/commands/type');
const ASSERTION_TYPE                 = lazyRequire('./assertions/type');
const TEST_RUN_PHASE                 = lazyRequire('./test-run/phase');
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

/**
 * Provides internal utilities and components for embedding TestCafe functionality
 * or for advanced internal integrations.
 * @module embedding-utils
 */
export default {
    /**
     * Provides a formattable adapter for TestRun errors.
     * @type {TestRunErrorFormattableAdapter}
     */
    TestRunErrorFormattableAdapter,
    /**
     * Collection of TestRun error classes.
     * @type {object}
     */
    testRunErrors,
    /**
     * Enumeration of TestCafe command types.
     * @type {object}
     */
    COMMAND_TYPE,
    /**
     * Enumeration of TestCafe assertion types.
     * @type {object}
     */
    ASSERTION_TYPE,
    /**
     * Enumeration of TestRun phases.
     * @type {object}
     */
    TEST_RUN_PHASE,
    /**
     * Enumeration of general TestCafe error types.
     * @type {object}
     */
    errorTypes,
    /**
     * Utility functions for TestRun errors.
     * @type {object}
     */
    testRunErrorUtils,
    /**
     * Manages a connection to a browser instance.
     * @type {BrowserConnection}
     */
    BrowserConnection,

    /**
     * Base class for objects that can be assigned properties.
     * @type {Assignable}
     */
    get Assignable () {
        if (!Assignable)
            Assignable = require('./utils/assignable');

        return Assignable;
    },

    /**
     * Represents a single test run.
     * @type {TestRun}
     */
    get TestRun () {
        if (!TestRun)
            TestRun = require('./test-run');

        return TestRun;
    },

    /**
     * Retrieves a list of tests from an ES-Next test file.
     * @type {function(string): Promise<Array<object>>}
     */
    get getTestList () {
        return getTestListModule.getTestList;
    },

    /**
     * Retrieves a list of tests from a TypeScript test file.
     * @type {function(string): Promise<Array<object>>}
     */
    get getTypeScriptTestList () {
        return getTypeScriptTestListModule.getTypeScriptTestList;
    },

    /**
     * Retrieves a list of tests from a CoffeeScript test file.
     * @type {function(string): Promise<Array<object>>}
     */
    get getCoffeeScriptTestList () {
        return getCoffeeScriptTestListModule.getCoffeeScriptTestList;
    },

    /**
     * Retrieves a list of tests from ES-Next test code.
     * @type {function(string): Promise<Array<object>>}
     */
    get getTestListFromCode () {
        return getTestListModule.getTestListFromCode;
    },

    /**
     * Retrieves a list of tests from TypeScript test code.
     * @type {function(string): Promise<Array<object>>}
     */
    get getTypeScriptTestListFromCode () {
        return getTypeScriptTestListModule.getTypeScriptTestListFromCode;
    },

    /**
     * Retrieves a list of tests from CoffeeScript test code.
     * @type {function(string): Promise<Array<object>>}
     */
    get getCoffeeScriptTestListFromCode () {
        return getCoffeeScriptTestListModule.getCoffeeScriptTestListFromCode;
    },

    /**
     * Initializes a selector command.
     * @type {function(object): object}
     */
    get initSelector () {
        return initializers.initSelector;
    },

    /**
     * Creates a TestCafe command from a plain object.
     * @type {function(object, object): object}
     */
    get createCommandFromObject () {
        return createCommandFromObject;
    },

    /**
     * Processes an error that occurred within a test function.
     * @type {function(Error): TestRunErrorFormattableAdapter}
     */
    get processTestFnError () {
        return processTestFnError;
    },

    /**
     * Manages a pool of browser providers.
     * @type {object}
     */
    get browserProviderPool () {
        return browserProviderPool;
    },

    /**
     * Ensures the existence of the upload directory.
     * @param {...*} args - Arguments passed to hammerhead's ensureUploadsRoot.
     * @returns {Promise<void>}
     */
    ensureUploadDirectory (...args) {
        return hammerhead.UploadStorage.ensureUploadsRoot(...args);
    },

    /**
     * Copies files to the upload folder.
     * @param {...*} args - Arguments passed to hammerhead's UploadStorage.copy.
     * @returns {Promise<void>}
     */
    copyFilesToUploadFolder (...args) {
        return hammerhead.UploadStorage.copy(...args);
    },

    /**
     * Builds a reporter plugin instance.
     * @param {function(): object} pluginFactory - A factory function that returns the reporter plugin object.
     * @param {object} outStream - The output stream for the reporter.
     * @returns {ReporterPluginHost}
     */
    buildReporterPlugin (pluginFactory, outStream) {
        const plugin = pluginFactory();

        return new ReporterPluginHost(plugin, outStream);
    },
};
