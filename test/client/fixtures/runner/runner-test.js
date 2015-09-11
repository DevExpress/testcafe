var hammerhead  = window.getTestCafeModule('hammerhead');
var HH_SETTINGS = hammerhead.get('./settings').get();

var testCafeCore = window.getTestCafeModule('testCafeCore');
var COMMAND      = testCafeCore.COMMAND;
var transport    = testCafeCore.get('./transport');

var testCafeRunner = window.getTestCafeModule('testCafeRunner');
var actionBarrier  = testCafeRunner.get('./action-barrier/action-barrier');
var Runner         = testCafeRunner.get('./runner');


transport.batchUpdate                = function (callback) {
    callback();
};
transport.startInactivityMonitor     = function () {
};
transport.stopInactivityMonitor      = function () {
};
actionBarrier.waitPageInitialization = function (callback) {
    callback();
};
$.fn.load                            = function (callback) {
    callback();
};

module('Regression');
asyncTest('T204773 - TestCafe - The assertion in last step with inIFrame wrapper works incorrect in IE browser', function () {
    HH_SETTINGS.SERVICE_MSG_URL = '/ping/500';

    var savedAsyncServiceMsg       = transport.asyncServiceMsg,
        assertionFailedMessageTime = null;

    transport.asyncServiceMsg = function (msg, callback) {
        if (msg.cmd === COMMAND.assertionFailed)
            assertionFailedMessageTime = Date.now();

        if (msg.cmd === COMMAND.done)
            ok(Date.now() - assertionFailedMessageTime >= 500);

        savedAsyncServiceMsg.apply(transport, arguments);
    };

    transport.switchToWorkerIdle = function () {
    };

    var testRunner = new Runner();

    testRunner._onAssertionFailed({ err: 'err' });

    testRunner._onTestComplete({
        callback: function () {
            start();
        }
    });


});

test('Test iterator should not call Transport.fail twice (without screenshots)', function () {
    var savedTakeScreenshotOnFails = HH_SETTINGS.TAKE_SCREENSHOT_ON_FAILS,
        savedTransportFail         = transport.fail;

    var transportFailCount = 0;

    transport.fail                       = function () {
        transportFailCount++;
    };
    HH_SETTINGS.TAKE_SCREENSHOT_ON_FAILS = false;

    var testRunner = new Runner();
    testRunner._onError();
    testRunner._onError();

    equal(transportFailCount, 1);

    HH_SETTINGS.TAKE_SCREENSHOT_ON_FAILS = savedTakeScreenshotOnFails;
    transport.fail                       = savedTransportFail;
});

test('Test iterator should not call Transport.fail twice (with screenshots)', function () {
    var savedTakeScreenshotOnFails = HH_SETTINGS.TAKE_SCREENSHOT_ON_FAILS,
        savedTransportFail         = transport.fail;

    var transportFailCount = 0;

    transport.fail                       = function () {
        transportFailCount++;
    };
    HH_SETTINGS.TAKE_SCREENSHOT_ON_FAILS = true;

    var testRunner = new Runner();
    testRunner._onError();
    testRunner._onError();

    equal(transportFailCount, 1);

    HH_SETTINGS.TAKE_SCREENSHOT_ON_FAILS = savedTakeScreenshotOnFails;
    transport.fail                       = savedTransportFail;
});
