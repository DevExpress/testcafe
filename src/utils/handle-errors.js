import { UnhandledPromiseRejectionError, UncaughtExceptionError } from '../errors/test-run';
import util from 'util';

const runningTests     = {};
let handlingTestErrors = false;

function printErrorMessagesAndTerminate (...messages) {
    // eslint-disable-next-line no-console
    messages.map(msg => console.log(msg));

    // eslint-disable-next-line no-process-exit
    setTimeout(() => process.exit(1), 0);
}

function handleTestRunError (ErrorCtor, message) {
    Object.values(runningTests).forEach(testRun => {
        testRun.addError(new ErrorCtor(message));

        removeRunningTest(testRun);
    });
}

function handleError (ErrorCtor, message) {
    if (handlingTestErrors)
        handleTestRunError(ErrorCtor, message);
    else
        printErrorMessagesAndTerminate(message);
}

function formatUnhandledRejectionReason (reason) {
    const reasonType      = typeof reason;
    const isPrimitiveType = reasonType !== 'object' && reasonType !== 'function';

    if (isPrimitiveType)
        return String(reason);

    if (reason instanceof Error)
        return reason.stack;

    return util.inspect(reason, { depth: 2, breakLength: Infinity });
}

export function formatError (ErrorCtor, error) {
    if (ErrorCtor === UncaughtExceptionError)
        return error.stack;

    if (ErrorCtor === UnhandledPromiseRejectionError)
        return formatUnhandledRejectionReason(error);

    return error;
}

export function handleUnexpectedError (ErrorCtor, error) {
    try {
        const formattedError = typeof error === 'string' ? error : formatError(ErrorCtor, error);

        handleError(ErrorCtor, formattedError);
    }
    catch (e) {
        printErrorMessagesAndTerminate(error, e);
    }
}

export function registerErrorHandlers () {
    process.on('unhandledRejection', e => handleUnexpectedError(UnhandledPromiseRejectionError, e));
    process.on('uncaughtException', e => handleUnexpectedError(UncaughtExceptionError, e));
}

export function addRunningTest (testRun) {
    runningTests[testRun.id] = testRun;
}

export function removeRunningTest (testRun) {
    if (testRun)
        delete runningTests[testRun.id];
}

export function startHandlingTestErrors () {
    handlingTestErrors = true;
}

export function stopHandlingTestErrors () {
    handlingTestErrors = false;
}
