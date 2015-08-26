var hammerhead    = window.getTestCafeModule('hammerhead');
var HH_SETTINGS = hammerhead.get('./settings').get();
var iframeSandbox = hammerhead.get('./sandboxes/iframe');

var testCafeCore = window.getTestCafeModule('testCafeCore');
var ERRORS       = testCafeCore.get('./errors');
var transport    = testCafeCore.get('./transport');

var testCafeRunner = window.getTestCafeModule('testCafeRunner');
var Runner         = testCafeRunner.get('./runner');
var RunnerBase     = testCafeRunner.get('./runner-base');
var actionBarrier  = testCafeRunner.get('./action-barrier/action-barrier');


QUnit.begin(function () {
    HH_SETTINGS.SERVICE_MSG_URL = '/ping/10';

    hammerhead.on(hammerhead.IFRAME_READY_TO_INIT, window.initIFrameTestHandler);
    hammerhead.off(hammerhead.IFRAME_READY_TO_INIT, iframeSandbox.iframeReadyToInitHandler);

    $('<iframe id="test-iframe"></iframe>').appendTo('body');
});

QUnit.done(function () {
    hammerhead.off(hammerhead.IFRAME_READY_TO_INIT, window.initIFrameTestHandler);
});

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

var lastError = null;

RunnerBase.prototype._onError = function (err) {
    lastError = err;
};

Runner.prototype._onError = function (err) {
    lastError = err;
};


QUnit.testStart(function () {
    lastError = null;
});


asyncTest('init API', function () {
    var testRunner  = new RunnerBase(),
        testStarted = false;

    ok(testRunner.act);
    ok(testRunner.act._start);
    ok(testRunner.act._onJSError);
    ok(testRunner.ok);
    ok(testRunner.notOk);
    ok(testRunner.eq);
    ok(testRunner.notEq);
    ok(testRunner.handleAlert);
    ok(testRunner.handleConfirm);
    ok(testRunner.handlePrompt);
    ok(testRunner.handleBeforeUnload);

    testRunner.act._start([], [], 0);

    testRunner.on(testRunner.TEST_STARTED_EVENT, function () {
        testStarted = true;
        ok(!testRunner.act._start);
        ok(!testRunner.act._onJSError);
    });

    testRunner.on(testRunner.TEST_COMPLETED_EVENT, function () {
        ok(testStarted);
        start();
    });
});

asyncTest('Inactivity monitor', function () {
    var storedStartInactivityMonitor = transport.startInactivityMonitor;
    transport.startInactivityMonitor = function (callback) {
        window.setTimeout(callback, 0);
    };

    var testRunner = new Runner();

    window.setTimeout(function () {
        ok(lastError);
        equal(lastError.code, ERRORS.TEST_INACTIVITY);

        transport.startInactivityMonitor = storedStartInactivityMonitor;
        start();
    }, 100);
});

asyncTest('Uncaught error in test script', function () {
    var errorText = 'Test error',
        stepNames = ['1.Step name'],
        testSteps = [function () {
            throw errorText;
        }];

    var testRunner = new RunnerBase();

    testRunner.on(testRunner.TEST_STARTED_EVENT, function () {
        window.setTimeout(function () {
            ok(lastError);
            ok(lastError.code === ERRORS.UNCAUGHT_JS_ERROR_IN_TEST_CODE_STEP);
            equal(lastError.scriptErr, errorText);

            start();
        }, 0);
    });

    testRunner.act._start(stepNames, testSteps, 0);
});

module('inIFrame arguments');
function wrapIFrameArgument (arg) {
    return function () {
        return arg;
    };
}

test('DOM element', function () {
    var arg                 = null,
        testRunner          = new RunnerBase();

    testRunner._initApi();
    testRunner._runInIFrame = function (iFrame) {
        arg = iFrame;
    };

    var iFrame = $('#test-iframe')[0];
    testRunner.inIFrame(wrapIFrameArgument(iFrame), 0)();

    equal(arg, iFrame);
});

test('jQuery object', function () {
    var arg                 = null,
        testRunner          = new RunnerBase();

    testRunner._initApi();
    testRunner._runInIFrame = function (iFrame) {
        arg = iFrame;
    };

    var $iFrame = $('#test-iframe');
    testRunner.inIFrame(wrapIFrameArgument($iFrame), 0)();

    equal(arg, $iFrame[0]);
});

test('string selector', function () {
    var arg                 = null,
        testRunner          = new RunnerBase();

    testRunner._initApi();
    testRunner._runInIFrame = function (iFrame) {
        arg = iFrame;
    };

    var $iFrame = $('#test-iframe');
    testRunner.inIFrame(wrapIFrameArgument('#test-iframe'), 0)();

    equal(arg, $iFrame[0]);
});

test('function', function () {
    var arg                 = null,
        testRunner          = new RunnerBase();

    testRunner._initApi();
    testRunner._runInIFrame = function (iFrame) {
        arg = iFrame;
    };

    var iFrameGetter = function () {
        return $('#test-iframe')[0];
    };

    testRunner.inIFrame(wrapIFrameArgument(iFrameGetter), 0)();

    equal(arg, iFrameGetter());
});

test('empty argument error', function () {
    var testRunner = new RunnerBase();

    testRunner._initApi();
    testRunner.inIFrame(wrapIFrameArgument(null), 0)();

    equal(lastError.code, ERRORS.API_EMPTY_IFRAME_ARGUMENT);
    lastError      = null;

    testRunner.inIFrame(wrapIFrameArgument('#notExistingIFrame'), 0)();
    equal(lastError.code, ERRORS.API_EMPTY_IFRAME_ARGUMENT);
});

test('not iFrame error', function () {
    var testRunner = new RunnerBase(),
        $div       = $('<div></div>').appendTo('body');

    testRunner._initApi();
    testRunner.inIFrame(wrapIFrameArgument($div), 0)();

    equal(lastError.code, ERRORS.API_IFRAME_ARGUMENT_IS_NOT_IFRAME);
    $div.remove();
});

test('multiple argument error', function () {
    var testRunner = new RunnerBase(),
        $iFrame    = $('<iframe id="test-iframe-2"></iframe>').appendTo('body');

    testRunner._initApi();
    testRunner.inIFrame(wrapIFrameArgument('iframe'), 0)();

    equal(lastError.code, ERRORS.API_MULTIPLE_IFRAME_ARGUMENT);
    $iFrame.remove();
});

test('incorrect argument error', function () {
    var testRunner = new RunnerBase();

    testRunner._initApi();

    testRunner.inIFrame(wrapIFrameArgument(['#iframe']), 0)();
    equal(lastError.code, ERRORS.API_INCORRECT_IFRAME_ARGUMENT);
    lastError      = null;

    testRunner.inIFrame(wrapIFrameArgument({ iFrame: $('#iframe') }), 0)();
    equal(lastError.code, ERRORS.API_INCORRECT_IFRAME_ARGUMENT);
    lastError      = null;
});
