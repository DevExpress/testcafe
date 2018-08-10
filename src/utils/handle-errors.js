import { UnhandledPromiseRejectionError, UncaughtExceptionError } from '../errors/test-run';

const runningTests     = {};
let handlingTestErrors = false;

function handleError (ErrorCtor, message) {
    if (handlingTestErrors) {
        Object.values(runningTests).forEach(testRun => {
            testRun.addError(new ErrorCtor(message));

            removeRunningTest(testRun);
        });
    }
    else {
        /* eslint-disable no-process-exit */
        /* eslint-disable no-console */
        console.log(message);

        setTimeout(() => process.exit(1), 0);
        /* eslint-enable no-process-exit */
        /* eslint-enable no-console */
    }
}

function formatUnhandledRejectionReason (reason) {
    const reasonType      = typeof reason;
    const isPrimitiveType = reasonType !== 'object' && reasonType !== 'function';

    if (isPrimitiveType)
        return String(reason);

    if (reason instanceof Error)
        return reason.stack;

    return Object.prototype.toString.call(reason);
}

function onUnhandledRejection (reason) {
    if (reason && reason.isRejectedDriverTask)
        return;

    const message = formatUnhandledRejectionReason(reason);

    handleError(UnhandledPromiseRejectionError, message);
}

function onUncaughtException (err) {
    handleError(UncaughtExceptionError, err.stack);
}

export function registerErrorHandlers () {
    process.on('unhandledRejection', onUnhandledRejection);
    process.on('uncaughtException', onUncaughtException);
}

export function addRunningTest (testRun) {
    runningTests[testRun.id] = testRun;
}

export function removeRunningTest (testRun) {
    delete runningTests[testRun.id];
}

export function startHandlingTestErrors () {
    handlingTestErrors = true;
}

export function stopHandlingTestErrors () {
    handlingTestErrors = false;
}
