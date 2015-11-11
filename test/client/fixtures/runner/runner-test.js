var hammerhead = window.getTestCafeModule('hammerhead');
var hhsettings = hammerhead.get('./settings').get();

var testCafeCore = window.getTestCafeModule('testCafeCore');
var COMMAND      = testCafeCore.COMMAND;
var SETTINGS     = testCafeCore.get('./settings').get();
var transport    = testCafeCore.get('./transport');
var ERROR_TYPE   = testCafeCore.ERROR_TYPE;

var testCafeRunner = window.getTestCafeModule('testCafeRunner');
var actionBarrier  = testCafeRunner.get('./action-barrier/action-barrier');
var Runner         = testCafeRunner.get('./runner');


var testRunner                    = null;
var savedTakeScreenshotsOnFails   = null;
var savedAsyncServiceMsg          = null;
var savedTransportFatalError      = null;
var savedTransportAssertionFailed = null;

transport.batchUpdate = function (callback) {
    callback();
};

actionBarrier.waitPageInitialization = function (callback) {
    callback();
};

$.fn.load = function (callback) {
    callback();
};

Runner.checkStatus = function () {
};

QUnit.testStart(function () {
    testRunner                    = new Runner();
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
    SETTINGS.TAKE_SCREENSHOTS_ON_FAILS = savedTakeScreenshotsOnFails;
    transport.asyncServiceMsg          = savedAsyncServiceMsg;
    transport.fatalError               = savedTransportFatalError;
    transport.assertionFailed          = savedTransportAssertionFailed;
});

module('Regression');

asyncTest('T204773 - TestCafe - The assertion in last step with inIFrame wrapper works incorrect in IE browser', function () {
    hhsettings.serviceMsgUrl = '/ping/500';

    var assertionFailedMessageTime = null;

    transport.asyncServiceMsg = function (msg, callback) {
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

asyncTest('Step name is escaped before it is sent to server (error in step)', function () {
    var stepNames = ['1.Step <with markup> name'];
    var testSteps = [function () {
        throw 'Any type of error';
    }];

    transport.fatalError = function (err) {
        equal(err.type, ERROR_TYPE.uncaughtJSErrorInTestCodeStep);
        equal(err.stepName, '1.Step &lt;with markup&gt; name');

        start();
    };

    testRunner.act._start(stepNames, testSteps, 0);
});

asyncTest('Step name is escaped before it is sent to server (failed assertion)', function () {
    var stepNames = ['1.Assertion in element <input>'];
    var eq        = testRunner.eq;
    var testSteps = [function () {
        eq(1, 0);
    }];

    transport.assertionFailed = function (err) {
        equal(err.type, ERROR_TYPE.eqAssertion);
        equal(err.stepName, '1.Assertion in element &lt;input&gt;');

        start();
    };

    testRunner.act._start(stepNames, testSteps, 0);
});
