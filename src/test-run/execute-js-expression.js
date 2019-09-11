import { runInContext } from 'vm';
import { UncaughtErrorInCustomScript, UncaughtTestCafeErrorInCustomScript } from '../errors/test-run';
import { setContextOptions } from '../api/test-controller/execution-context';

const ERROR_LINE_COLUMN_REGEXP = /:(\d+):(\d+)/;
const ERROR_LINE_OFFSET        = -1;
const ERROR_COLUMN_OFFSET      = -4;

// NOTE: do not beautify this code since offsets for error lines and columns are coded here
function wrapInAsync (expression) {
    return '(async function() {\n' +
           expression + ';\n' +
           '});';
}

function getErrorLineColumn (err) {
    const result = err.stack && err.stack.match(ERROR_LINE_COLUMN_REGEXP);

    if (!result)
        return {};

    const line   = parseInt(result[1], 10);
    const column = parseInt(result[2], 10);

    return { line, column };
}

function createErrorFormattingOptions (expression) {
    return {
        filename:     formatExpression(expression),
        lineOffset:   ERROR_LINE_OFFSET,
        columnOffset: ERROR_COLUMN_OFFSET
    };
}

function getExecutionContext (testController, options = {}) {
    const context = testController.getExecutionContext();

    // TODO: Find a way to avoid this assignment
    setContextOptions(context, options);

    return context;
}

export function formatExpression (expression) {
    const expresionMessage = expression.split('\n');

    return expresionMessage.map(str => {
        return ' '.repeat(4) + str;
    }).join('\n');
}

export function executeJsExpression (expression, testRun, options) {
    const context      = getExecutionContext(testRun.controller, options);
    const errorOptions = createErrorFormattingOptions(expression);

    return runInContext(expression, context, errorOptions);
}

export async function executeAsyncJsExpression (expression, testRun, callsite) {
    const context      = getExecutionContext(testRun.controller);
    const errorOptions = createErrorFormattingOptions(expression);

    try {
        return await runInContext(wrapInAsync(expression), context, errorOptions)();
    }
    catch (err) {
        if (err.isTestCafeError)
            throw new UncaughtTestCafeErrorInCustomScript(err, expression, callsite);

        const { line, column } = getErrorLineColumn(err);

        throw new UncaughtErrorInCustomScript(err, expression, line, column, callsite);
    }
}
