import { UnhandledPromiseRejectionError, UncaughtExceptionError } from '../errors/test-run';

const runningTests = {};
let handlingTests  = false;

function handleError (ErrorCtor, message) {
    if (handlingTests) {
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

function onUnhandledRejection (reason) {
    const message = reason instanceof Error ? reason.stack : reason;

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

export function startHandlingTests () {
    handlingTests = true;
}

export function stopHandlingTests () {
    handlingTests = false;
}
