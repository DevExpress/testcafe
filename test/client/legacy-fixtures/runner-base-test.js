const hammerhead    = window.getTestCafeModule('hammerhead');
const hhsettings    = hammerhead.settings.get();
const iframeSandbox = hammerhead.sandbox.iframe;

const testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
const ERROR_TYPE           = testCafeLegacyRunner.get('../test-run-error/type');
const Runner               = testCafeLegacyRunner.get('./runner');
const RunnerBase           = testCafeLegacyRunner.get('./runner-base');
const transport            = testCafeLegacyRunner.get('./transport');


QUnit.begin(function () {
    hhsettings.serviceMsgUrl = '/ping/10';

    iframeSandbox.on(iframeSandbox.RUN_TASK_SCRIPT_EVENT, window.initIFrameTestHandler);
    iframeSandbox.off(iframeSandbox.RUN_TASK_SCRIPT_EVENT, iframeSandbox.iframeReadyToInitHandler);

    $('<iframe id="test-iframe"></iframe>').appendTo('body');
});

QUnit.done(function () {
    iframeSandbox.off(iframeSandbox.RUN_TASK_SCRIPT_EVENT, window.initIFrameTestHandler);
});

transport.batchUpdate = function (callback) {
    callback();
};

$.fn.load = function (callback) {
    callback();
};

let lastError = null;

RunnerBase.prototype._onFatalError = function (err) {
    lastError = err;
};

Runner.prototype._onFatalError = function (err) {
    lastError = err;
};

Runner.checkStatus = function () {
};


QUnit.testStart(function () {
    lastError = null;
});


asyncTest('init API', function () {
    const testRunner = new RunnerBase();

    let testStarted = false;

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

    testRunner.nextStep = 0;
    testRunner.act._start([], []);

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
    const errorText = 'Test error';
    const stepNames = ['1.Step name'];
    const testSteps = [function () {
        throw errorText;
    }];

    const testRunner = new RunnerBase();

    testRunner.on(testRunner.TEST_STARTED_EVENT, function () {
        window.setTimeout(function () {
            ok(lastError);
            ok(lastError.type === ERROR_TYPE.uncaughtJSErrorInTestCodeStep);
            equal(lastError.scriptErr, errorText);

            start();
        }, 0);
    });

    testRunner.nextStep = 0;
    testRunner.act._start(stepNames, testSteps);
});

module('inIFrame arguments');
function wrapIFrameArgument (arg) {
    return function () {
        return arg;
    };
}

test('DOM element', function () {
    const testRunner = new RunnerBase();

    let arg = null;

    testRunner._initApi();
    testRunner._runInIFrame = function (iFrame) {
        arg = iFrame;
    };

    const iFrame = $('#test-iframe')[0];

    testRunner.inIFrame(wrapIFrameArgument(iFrame), 0)();

    equal(arg, iFrame);
});

test('jQuery object', function () {
    const testRunner = new RunnerBase();

    let arg = null;

    testRunner._initApi();
    testRunner._runInIFrame = function (iFrame) {
        arg = iFrame;
    };

    const $iFrame = $('#test-iframe');

    testRunner.inIFrame(wrapIFrameArgument($iFrame), 0)();

    equal(arg, $iFrame[0]);
});

test('string selector', function () {
    const testRunner = new RunnerBase();

    let arg = null;

    testRunner._initApi();
    testRunner._runInIFrame = function (iFrame) {
        arg = iFrame;
    };

    const $iFrame = $('#test-iframe');

    testRunner.inIFrame(wrapIFrameArgument('#test-iframe'), 0)();

    equal(arg, $iFrame[0]);
});

test('function', function () {
    const testRunner = new RunnerBase();

    let arg        = null;

    testRunner._initApi();
    testRunner._runInIFrame = function (iFrame) {
        arg = iFrame;
    };

    const iFrameGetter = function () {
        return $('#test-iframe')[0];
    };

    testRunner.inIFrame(wrapIFrameArgument(iFrameGetter), 0)();

    equal(arg, iFrameGetter());
});

test('empty argument error', function () {
    const testRunner = new RunnerBase();

    testRunner._initApi();
    testRunner.inIFrame(wrapIFrameArgument(null), 0)();

    equal(lastError.type, ERROR_TYPE.emptyIFrameArgument);
    lastError = null;

    testRunner.inIFrame(wrapIFrameArgument('#notExistingIFrame'), 0)();
    equal(lastError.type, ERROR_TYPE.emptyIFrameArgument);
});

test('not iFrame error', function () {
    const testRunner = new RunnerBase();
    const $div       = $('<div></div>').appendTo('body');

    testRunner._initApi();
    testRunner.inIFrame(wrapIFrameArgument($div), 0)();

    equal(lastError.type, ERROR_TYPE.iframeArgumentIsNotIFrame);
    $div.remove();
});

test('multiple argument error', function () {
    const testRunner = new RunnerBase();
    const $iFrame    = $('<iframe id="test-iframe-2"></iframe>').appendTo('body');

    testRunner._initApi();
    testRunner.inIFrame(wrapIFrameArgument('iframe'), 0)();

    equal(lastError.type, ERROR_TYPE.multipleIFrameArgument);
    $iFrame.remove();
});

test('incorrect argument error', function () {
    const testRunner = new RunnerBase();

    testRunner._initApi();

    testRunner.inIFrame(wrapIFrameArgument(['#iframe']), 0)();
    equal(lastError.type, ERROR_TYPE.incorrectIFrameArgument);
    lastError = null;

    testRunner.inIFrame(wrapIFrameArgument({ iFrame: $('#iframe') }), 0)();
    equal(lastError.type, ERROR_TYPE.incorrectIFrameArgument);
    lastError = null;
});
