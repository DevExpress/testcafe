const testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
const Runner               = testCafeLegacyRunner.get('./runner');
const transport            = testCafeLegacyRunner.get('./transport');
const StepIterator         = testCafeLegacyRunner.get('./step-iterator');
const SETTINGS             = testCafeLegacyRunner.get('./settings').get();

let testRunner                    = null;
let savedTakeScreenshots          = null;
let savedTakeScreenshotsOnFails   = null;
let savedAsyncServiceMsg          = null;
let savedTransportFatalError      = null;
let savedTransportAssertionFailed = null;

transport.batchUpdate = function (callback) {
    callback();
};

$.fn.load = function (callback) {
    callback();
};

Runner.checkStatus = function () {
};

QUnit.testStart(function () {
    testRunner                    = new Runner();
    savedTakeScreenshots          = SETTINGS.TAKE_SCREENSHOTS;
    savedTakeScreenshotsOnFails   = SETTINGS.TAKE_SCREENSHOTS_ON_FAILS;
    savedAsyncServiceMsg          = transport.asyncServiceMsg;
    savedTransportFatalError      = transport.fatalError;
    savedTransportAssertionFailed = transport.assertionFailed;

    transport.asyncServiceMsg = function (msg, callback) {
        if (callback)
            callback();
    };
});

QUnit.testDone(function () {
    SETTINGS.TAKE_SCREENSHOTS          = savedTakeScreenshots;
    SETTINGS.TAKE_SCREENSHOTS_ON_FAILS = savedTakeScreenshotsOnFails;
    transport.asyncServiceMsg          = savedAsyncServiceMsg;
    transport.fatalError               = savedTransportFatalError;
    transport.assertionFailed          = savedTransportAssertionFailed;
});

module('Regression');

asyncTest('Test iterator should not call Transport.fail twice (without screenshots)', function () {
    let transportFailCount = 0;

    transport.fatalError = function () {
        transportFailCount++;
    };

    SETTINGS.TAKE_SCREENSHOTS_ON_FAILS = false;

    testRunner._onFatalError({ message: 'err1' });
    testRunner._onFatalError({ message: 'err2' });

    window.setTimeout(function () {
        equal(transportFailCount, 1);

        start();
    }, 100);
});

asyncTest('Test iterator should not call Transport.fail twice (with screenshots)', function () {
    let transportFailCount = 0;

    transport.fatalError = function () {
        transportFailCount++;
    };

    SETTINGS.TAKE_SCREENSHOTS_ON_FAILS = true;

    testRunner._onFatalError({ message: 'err1' });
    testRunner._onFatalError({ message: 'err2' });

    window.setTimeout(function () {
        equal(transportFailCount, 1);

        start();
    }, 100);
});

asyncTest("The 'assertion-failed' command should be sent earlier than 'done' if the 'takeScreenshotOnFail' option is enabled (GH-660)", function () {
    const commandStorage = [];

    SETTINGS.TAKE_SCREENSHOTS_ON_FAILS          = true;
    SETTINGS.TAKE_SCREENSHOTS                   = true;
    testRunner.stepIterator.state.curStepErrors = [];
    testRunner.stepIterator.state.testSteps     = [];

    transport.asyncServiceMsg = function () {
        commandStorage.push('done');
    };

    transport.assertionFailed = function (err, callback) {
        commandStorage.push('assertion-failed');
        callback();
    };

    testRunner.stepIterator.on(StepIterator.TEST_COMPLETE_EVENT, function () {
        testRunner._onTestComplete();
    });

    testRunner._onAssertionFailed({ err: {} });
    testRunner.stepIterator._runStep();

    setTimeout(function () {
        equal(commandStorage.length, 2);
        equal(commandStorage[0], 'assertion-failed');
        equal(commandStorage[1], 'done');

        start();
    }, 600);
});
