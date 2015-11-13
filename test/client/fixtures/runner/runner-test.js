var hammerhead  = window.getTestCafeModule('hammerhead');
var hhsettings = hammerhead.get('./settings').get();

var testCafeCore = window.getTestCafeModule('testCafeCore');
var COMMAND      = testCafeCore.COMMAND;
var SETTINGS     = testCafeCore.get('./settings').get();
var transport    = testCafeCore.get('./transport');

var testCafeRunner = window.getTestCafeModule('testCafeRunner');
var actionBarrier  = testCafeRunner.get('./action-barrier/action-barrier');
var Runner         = testCafeRunner.get('./runner');


transport.batchUpdate                = function (callback) {
    callback();
};
actionBarrier.waitPageInitialization = function (callback) {
    callback();
};
$.fn.load                            = function (callback) {
    callback();
};

Runner.checkStatus = function () {
};

module('Regression');

asyncTest('T204773 - TestCafe - The assertion in last step with inIFrame wrapper works incorrect in IE browser', function () {
    hhsettings.serviceMsgUrl = '/ping/500';

    var savedAsyncServiceMsg       = transport.asyncServiceMsg;
    var assertionFailedMessageTime = null;

    transport.asyncServiceMsg = function (msg, callback) {
        if (msg.cmd === COMMAND.assertionFailed)
            assertionFailedMessageTime = Date.now();

        if (msg.cmd === COMMAND.done)
            ok(Date.now() - assertionFailedMessageTime >= 500);

        savedAsyncServiceMsg.apply(transport, arguments);
    };

    var testRunner = new Runner();

    testRunner._onAssertionFailed({ err: { message: 'err' } });

    testRunner._onTestComplete({
        callback: function () {
            start();
        }
    });
});

asyncTest('Test iterator should not call Transport.fail twice (without screenshots)', function () {
    var savedTakeScreenshotOnFails = SETTINGS.TAKE_SCREENSHOTS_ON_FAILS;
    var savedTransportFatalError   = transport.fatalError;
    var transportFailCount         = 0;

    transport.fatalError = function () {
        transportFailCount++;
    };

    SETTINGS.TAKE_SCREENSHOTS_ON_FAILS = false;

    var testRunner = new Runner();

    testRunner._onFatalError({ message: 'err1' });
    testRunner._onFatalError({ message: 'err2' });

    window.setTimeout(function () {
        equal(transportFailCount, 1);

        SETTINGS.TAKE_SCREENSHOTS_ON_FAILS = savedTakeScreenshotOnFails;
        transport.fatalError               = savedTransportFatalError;

        start();
    }, 100);
});

asyncTest('Test iterator should not call Transport.fail twice (with screenshots)', function () {
    var savedTakeScreenshotOnFails = SETTINGS.TAKE_SCREENSHOTS_ON_FAILS;
    var savedTransportFatalError   = transport.fatalError;
    var transportFailCount         = 0;

    transport.fatalError               = function () {
        transportFailCount++;
    };
    SETTINGS.TAKE_SCREENSHOTS_ON_FAILS = true;

    var testRunner = new Runner();

    testRunner._onFatalError({ message: 'err1' });
    testRunner._onFatalError({ message: 'err2' });

    window.setTimeout(function () {
        equal(transportFailCount, 1);

        SETTINGS.TAKE_SCREENSHOTS_ON_FAILS = savedTakeScreenshotOnFails;
        transport.fatalError               = savedTransportFatalError;

        start();
    }, 100);
});
