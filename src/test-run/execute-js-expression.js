import { runInNewContext, runInThisContext } from 'vm';
import Module from 'module';
import { dirname } from 'path';
import { ExecuteJsExpressionError } from '../errors/test-run';
import SelectorBuilder from '../client-functions/selectors/selector-builder';
import ClientFunctionBuilder from '../client-functions/client-function-builder';

const ERROR_LINE_COLUMN_REGEXP = /:(\d+):(\d+)/;
const ERROR_LINE_OFFSET        = -1;
const ERROR_COLUMN_OFFSET      = -4;

// NOTE: do not beautify this code since offsets for for error lines and columns are coded here
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

function createSelectorDefinition (testRun, opts = {}) {
    return (fn, options = {}) => {
        const { skipVisibilityCheck, collectionMode } = opts;

        if (skipVisibilityCheck)
            options.visibilityCheck = false;

        if (testRun && testRun.id)
            options.boundTestRun = testRun;

        if (collectionMode)
            options.collectionMode = collectionMode;

        const builder = new SelectorBuilder(fn, options, { instantiation: 'Selector' });

        return builder.getFunction();
    };
}

function createClientFunctionDefinition (testRun) {
    return (fn, options = {}) => {
        if (testRun && testRun.id)
            options.boundTestRun = testRun;

        const builder = new ClientFunctionBuilder(fn, options, { instantiation: 'ClientFunction' });

        return builder.getFunction();
    };
}

function createExecutingContext (testRun, isAsync, options) {
    let filename = __filename;
    let controller = null;

    if (testRun) {
        controller = testRun.controller;

        if (testRun.test)
            filename = testRun.test.testFile.filename;
    }

    const dirName  = dirname(filename);

    const context = {
        require:        createRequire(filename),
        __filename:     filename,
        __dirname:      dirName,
        t:              controller,
        Selector:       createSelectorDefinition(testRun, options),
        ClientFunction: createClientFunctionDefinition(testRun)
    };

    return new Proxy(global, {
        get: (target, property) => {
            const value = context[property] || target[property];

            if (value === void 0 && !isAsync)
                return runInThisContext(property);

            return value;
        }
    });
}

function createErrorFormattingOptions (expression) {
    return {
        filename:     formatExpression(expression),
        lineOffset:   ERROR_LINE_OFFSET,
        columnOffset: ERROR_COLUMN_OFFSET
    };
}

export function executeJsExpression (expression, testRun, options) {
    const context      = createExecutingContext(testRun, false, options);
    const errorOptions = createErrorFormattingOptions(expression);

    return runInNewContext(expression, context, errorOptions);
}

export async function executeAsyncJsExpression (expression, testRun, callsite) {
    const proxy        = createExecutingContext(testRun, true);
    const errorOptions = createErrorFormattingOptions(expression);

    try {
        return await runInNewContext(wrapInAsync(expression), proxy, errorOptions)();
    }
    catch (err) {
        const { line, column } = getErrorLineColumn(err);

        throw new ExecuteJsExpressionError(err, expression, line, column, callsite);
    }
}


