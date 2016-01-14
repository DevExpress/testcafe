var hammerhead    = window.getTestCafeModule('hammerhead');
var HH_SETTINGS   = hammerhead.get('./settings').get();
var iframeSandbox = hammerhead.sandbox.iframe;

var testCafeCore = window.getTestCafeModule('testCafeCore');
var ERROR_TYPE   = testCafeCore.ERROR_TYPE;
var transport    = testCafeCore.get('./transport');

var testCafeRunner = window.getTestCafeModule('testCafeRunner');
var Runner         = testCafeRunner.get('./runner');
var RunnerBase     = testCafeRunner.get('./runner-base');
var actionBarrier  = testCafeRunner.get('./action-barrier/action-barrier');


QUnit.begin(function () {
    HH_SETTINGS.serviceMsgUrl = '/ping/10';

    hammerhead.on(hammerhead.EVENTS.iframeReadyToInit, window.initIFrameTestHandler);
    hammerhead.off(hammerhead.EVENTS.iframeReadyToInit, iframeSandbox.iframeReadyToInitHandler);

    $('<iframe id="test-iframe"></iframe>').appendTo('body');
});

QUnit.done(function () {
    hammerhead.off(hammerhead.EVENTS.iframeReadyToInit, window.initIFrameTestHandler);
});

transport.batchUpdate                = function (callback) {
    callback();
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

Runner.checkStatus = function () {
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
            ok(lastError.code === ERROR_TYPE.uncaughtJSErrorInTestCodeStep);
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

    equal(lastError.code, ERROR_TYPE.emptyIFrameArgument);
    lastError      = null;

    testRunner.inIFrame(wrapIFrameArgument('#notExistingIFrame'), 0)();
    equal(lastError.code, ERROR_TYPE.emptyIFrameArgument);
});

test('not iFrame error', function () {
    var testRunner = new RunnerBase(),
        $div       = $('<div></div>').appendTo('body');

    testRunner._initApi();
    testRunner.inIFrame(wrapIFrameArgument($div), 0)();

    equal(lastError.code, ERROR_TYPE.iframeArgumentIsNotIFrame);
    $div.remove();
});

test('multiple argument error', function () {
    var testRunner = new RunnerBase(),
        $iFrame    = $('<iframe id="test-iframe-2"></iframe>').appendTo('body');

    testRunner._initApi();
    testRunner.inIFrame(wrapIFrameArgument('iframe'), 0)();

    equal(lastError.code, ERROR_TYPE.multipleIFrameArgument);
    $iFrame.remove();
});

test('incorrect argument error', function () {
    var testRunner = new RunnerBase();

    testRunner._initApi();

    testRunner.inIFrame(wrapIFrameArgument(['#iframe']), 0)();
    equal(lastError.code, ERROR_TYPE.incorrectIFrameArgument);
    lastError      = null;

    testRunner.inIFrame(wrapIFrameArgument({ iFrame: $('#iframe') }), 0)();
    equal(lastError.code, ERROR_TYPE.incorrectIFrameArgument);
    lastError      = null;
});
