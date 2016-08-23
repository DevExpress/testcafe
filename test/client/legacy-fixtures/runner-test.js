var hammerhead = window.getTestCafeModule('hammerhead');
var hhsettings = hammerhead.get('./settings').get();

var testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
var COMMAND              = testCafeLegacyRunner.get('../test-run/command');
var Runner               = testCafeLegacyRunner.get('./runner');
var transport            = testCafeLegacyRunner.get('./transport');
var StepIterator         = testCafeLegacyRunner.get('./step-iterator');
var SETTINGS             = testCafeLegacyRunner.get('./settings').get();

var testRunner                    = null;
var savedTakeScreenshots          = null;
var savedTakeScreenshotsOnFails   = null;
var savedAsyncServiceMsg          = null;
var savedTransportFatalError      = null;
var savedTransportAssertionFailed = null;

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

asyncTest('T204773 - TestCafe - The assertion in last step with inIFrame wrapper works incorrect in IE browser', function () {
    hhsettings.serviceMsgUrl = '/ping/500';

    var assertionFailedMessageTime = null;

    transport.asyncServiceMsg = function (msg) {
        if (msg.cmd === COMMAND.assertionFailed)
            assertionFailedMessageTime = Date.now();

        if (msg.cmd === COMMAND.done)
            ok(Date.now() - assertionFailedMessageTime >= 500);

        savedAsyncServiceMsg.apply(transport, arguments);
    };

    testRunner._onAssertionFailed({ err: { message: 'err' } });

    testRunner._onTestComplete({
        callback: function () {
            start();
        }
    });
});

asyncTest('Test iterator should not call Transport.fail twice (without screenshots)', function () {
    var transportFailCount = 0;

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
    var transportFailCount = 0;

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
    var commandStorage = [];

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
