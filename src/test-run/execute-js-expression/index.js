import { runInContext } from 'vm';

import {
    GeneralError,
    TestCompilationError,
    APIError,
    CompositeError,
} from '../../errors/runtime';

import { UncaughtErrorInCustomScript, UncaughtTestCafeErrorInCustomScript } from '../../errors/test-run';
import { setContextOptions } from '../../api/test-controller/execution-context';

import {
    ERROR_LINE_COLUMN_REGEXP,
    ERROR_FILENAME,
    ERROR_LINE_OFFSET,
} from './constants';

// NOTE: do not beautify this code since offsets for error lines and columns are coded here
function wrapInAsync (expression) {
    return '(async function() {\n' +
           expression + ';\n' +
           '});';
}

function getErrorLineColumn (err) {
    if (err.isTestCafeError) {
        if (!err.callsite)
            return {};

        if (err.callsite.id)
            return { line: 0, column: 0 };

        const stackFrames = err.callsite.stackFrames || [];
        const frameIndex  = err.callsite.callsiteFrameIdx;
        const stackFrame  = stackFrames[frameIndex];

        return stackFrame ? {
            line:   stackFrame.getLineNumber(),
            column: stackFrame.getColumnNumber(),
        } : {};
    }

    const result = err.stack && err.stack.match(ERROR_LINE_COLUMN_REGEXP);

    if (!result)
        return {};

    const line   = result[1] ? parseInt(result[1], 10) : void 0;
    const column = result[2] ? parseInt(result[2], 10) : void 0;

    return { line, column };
}

function createErrorFormattingOptions () {
    return {
        filename:   ERROR_FILENAME,
        lineOffset: ERROR_LINE_OFFSET,
    };
}

function getExecutionContext (testController, options = {}) {
    const context = testController.getExecutionContext();

    // TODO: Find a way to avoid this assignment
    setContextOptions(context, options);

    return context;
}

function isRuntimeError (err) {
    return err instanceof GeneralError ||
           err instanceof TestCompilationError ||
           err instanceof APIError ||
           err instanceof CompositeError;
}

export function executeJsExpression (expression, testRun, options) {
    const context      = getExecutionContext(testRun.controller, options);
    const errorOptions = createErrorFormattingOptions();

    return runInContext(expression, context, errorOptions);
}

export async function executeAsyncJsExpression (expression, testRun, callsite, onBeforeRaisingError) {
    if (!expression || !expression.length)
        return Promise.resolve();

    const context      = getExecutionContext(testRun.controller);
    const errorOptions = createErrorFormattingOptions(expression);

    try {
        return await runInContext(wrapInAsync(expression), context, errorOptions)();
    }
    catch (err) {
        const { line, column } = getErrorLineColumn(err);
        let resultError        = null;

        if (err.isTestCafeError || isRuntimeError(err))
            resultError = new UncaughtTestCafeErrorInCustomScript(err, expression, line, column, callsite);
        else
            resultError = new UncaughtErrorInCustomScript(err, expression, line, column, callsite);

        if (onBeforeRaisingError)
            await onBeforeRaisingError(resultError);

        throw resultError;
    }
}
