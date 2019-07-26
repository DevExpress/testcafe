import { runInContext, createContext } from 'vm';
import Module from 'module';
import { dirname } from 'path';
import nanoid from 'nanoid';
import { ExecuteAsyncExpressionError } from '../errors/test-run';
import exportableLib from '../api/exportable-lib';

const ERROR_LINE_COLUMN_REGEXP = /:(\d+):(\d+)/;
const ERROR_LINE_OFFSET        = -1;
const ERROR_COLUMN_OFFSET      = -4;

const contexts = {};

// NOTE: do not beautify this code since offsets for error lines and columns are coded here
function wrapInAsync (expression) {
    return '(async function() {\n' +
           expression + ';\n' +
           '});';
}

function getErrorLineColumn (err) {
    const result = err.stack.match(ERROR_LINE_COLUMN_REGEXP);

    const line   = parseInt(result[1], 10);
    const column = parseInt(result[2], 10);

    return { line, column };
}

function formatExpression (expression) {
    const expresionMessage = expression.split('\n');

    return '[JS code]\n' + expresionMessage.map(str => {
        return ' '.repeat(10) + str;
    }).join('\n');
}

function createRequire (filename) {
    if (Module.createRequireFromPath)
        return Module.createRequireFromPath(filename);

    const dummyModule = new Module(filename, module);

    dummyModule.filename = filename;
    dummyModule.paths    = [filename].concat(module.paths);

    return id => dummyModule.require(id);
}

function createSelectorDefinition (testRun) {
    return (fn, options = {}) => {
        const { skipVisibilityCheck, collectionMode } = contexts[testRun.contextId].options;

        if (skipVisibilityCheck)
            options.visibilityCheck = false;

        if (testRun && testRun.id)
            options.boundTestRun = testRun;

        if (collectionMode)
            options.collectionMode = collectionMode;

        return exportableLib.Selector(fn, options);
    };
}

function createClientFunctionDefinition (testRun) {
    return (fn, options = {}) => {
        if (testRun && testRun.id)
            options.boundTestRun = testRun;

        return exportableLib.ClientFunction(fn, options);
    };
}

function getExecutingContext (testRun, options = {}) {
    const contextId = testRun.contextId || nanoid(7);

    if (!contexts[contextId])
        contexts[contextId] = createExecutingContext(testRun);

    contexts[contextId].options = options;
    testRun.contextId           = contextId;

    return contexts[contextId];
}

function createExecutingContext (testRun) {
    const filename = testRun.test.testFile.filename;

    const replacers = {
        require:        createRequire(filename),
        __filename:     filename,
        __dirname:      dirname(filename),
        t:              testRun.controller,
        Selector:       createSelectorDefinition(testRun),
        ClientFunction: createClientFunctionDefinition(testRun),
        Role:           exportableLib.Role,
        RequestLogger:  exportableLib.RequestLogger,
        RequestMock:    exportableLib.RequestMock,
        RequestHook:    exportableLib.RequestHook
    };

    return createContext(new Proxy(replacers, {
        get: (target, property) => {
            if (replacers.hasOwnProperty(property))
                return replacers[property];

            if (global.hasOwnProperty(property))
                return global[property];

            throw new Error(`${property} is not defined`);
        }
    }));
}

function createErrorFormattingOptions (expression) {
    return {
        filename:     formatExpression(expression),
        lineOffset:   ERROR_LINE_OFFSET,
        columnOffset: ERROR_COLUMN_OFFSET
    };
}

export function executeJsExpression (expression, testRun, options) {
    const context      = getExecutingContext(testRun, options);
    const errorOptions = createErrorFormattingOptions(expression);

    return runInContext(expression, context, errorOptions);
}

export async function executeAsyncJsExpression (expression, testRun, callsite) {
    const context      = getExecutingContext(testRun);
    const errorOptions = createErrorFormattingOptions(expression);

    try {
        return await runInContext(wrapInAsync(expression), context, errorOptions)();
    }
    catch (err) {
        if (err.isTestCafeError)
            throw err;

        const { line, column } = getErrorLineColumn(err);

        throw new ExecuteAsyncExpressionError(err, expression, line, column, callsite);
    }
}


