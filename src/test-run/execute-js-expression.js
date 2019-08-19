import { runInContext } from 'vm';
import { ExecuteAsyncExpressionError } from '../errors/test-run';

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

function createErrorFormattingOptions (expression) {
    return {
        filename:     formatExpression(expression),
        lineOffset:   ERROR_LINE_OFFSET,
        columnOffset: ERROR_COLUMN_OFFSET
    };
}

export function executeJsExpression (expression, testRun, options) {
    const context      = testRun.controller.getExecutionContext(options);
    const errorOptions = createErrorFormattingOptions(expression);

    return runInContext(expression, context, errorOptions);
}

export async function executeAsyncJsExpression (expression, testRun, callsite) {
    const context      = testRun.controller.getExecutionContext();
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
