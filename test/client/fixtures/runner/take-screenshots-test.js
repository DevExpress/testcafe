var testCafeCore = window.getTestCafeModule('testCafeCore');
var transport    = testCafeCore.get('./transport');
var ERROR_TYPE   = testCafeCore.ERROR_TYPE;
var SETTINGS     = testCafeCore.get('./settings').get();

var testCafeRunner = window.getTestCafeModule('testCafeRunner');
var Runner         = testCafeRunner.get('./runner');
var actionsAPI     = testCafeRunner.get('./api/actions');
var actionBarrier  = testCafeRunner.get('./action-barrier/action-barrier');


var runner                  = null,
    lastError               = null,
    lastIsFailedStep        = false,
    screenShotRequestCount  = false,
    expectedError           = null,
    expectedScreenshotCount = 0;

transport.batchUpdate        = function (callback) {
    callback();
};
transport.switchToWorkerIdle = function () {
};
transport.fail               = function (err) {
    ok(err.code === expectedError);
    ok(screenShotRequestCount === expectedScreenshotCount);

    runner._destroyIFrameBehavior();
    $('iframe').remove();
    start();
};
transport.asyncServiceMsg    = function (msg, callback) {
    if (msg.cmd === 'CMD_TAKE_SCREENSHOT') {    //TODO: fix
        screenShotRequestCount++;
        ok(msg.isFailedStep);
    }

    if (callback)
        callback();
};
transport.assertionFailed    = function () {
};

actionBarrier.waitPageInitialization = function (callback) {
    callback();
};
$.fn.load                            = function (callback) {
    callback();
};


QUnit.testStart(function () {
    runner                  = new Runner();
    screenShotRequestCount  = 0;
    expectedError           = null;
    expectedScreenshotCount = 0;
    lastIsFailedStep        = false;
});

asyncTest('Uncaught error in test script', function () {
    var errorText = 'Test error',
        stepNames = ['1.Step name'],
        testSteps = [function () {
            throw errorText;
        }];

    SETTINGS.TAKE_SCREENSHOT_ON_FAILS = true;
    expectedError                     = ERROR_TYPE.uncaughtJSErrorInTestCodeStep;
    expectedScreenshotCount           = 1;

    runner.act._start(stepNames, testSteps, 0);
});

asyncTest('Invisible element', function () {
    var stepNames = ['1.Step name'],
        testSteps = [function () {
            actionsAPI.click('body1');
        }];

    SETTINGS.TAKE_SCREENSHOT_ON_FAILS = true;
    expectedError                     = ERROR_TYPE.emptyFirstArgument;
    expectedScreenshotCount           = 1;

    runner.act._start(stepNames, testSteps, 0);
});

asyncTest('Failed assertion in step with action', function () {
    var stepNames = ['1.Step name'],
        eq        = runner.eq,
        ok        = runner.ok,
        testSteps = [function () {
            ok(0);
            eq(0, 1);
            actionsAPI.wait('body1');
        }];

    SETTINGS.TAKE_SCREENSHOT_ON_FAILS = true;
    expectedError                     = ERROR_TYPE.incorrectWaitActionMillisecondsArgument;
    expectedScreenshotCount           = 1;

    runner.act._start(stepNames, testSteps, 0);
});

asyncTest('Failed assertion in step without action', function () {
    var stepNames = ['1.Step name'],
        eq        = runner.eq,
        ok        = runner.ok,
        testSteps = [
            function () {
                ok(0);
                eq(0, 1);
            },
            function () {
                actionsAPI.wait('#thowError');
            }
        ];

    SETTINGS.TAKE_SCREENSHOT_ON_FAILS = true;
    expectedError                     = ERROR_TYPE.incorrectWaitActionMillisecondsArgument;
    expectedScreenshotCount           = 2;

    runner.act._start(stepNames, testSteps, 0);
});

asyncTest('Failed assertion and error: without "Take scr" flag', function () {
    var stepNames = ['1.Step name'],
        eq        = runner.eq,
        ok        = runner.ok,
        testSteps = [
            function () {
                ok(0);
                eq(0, 1);
            },
            function () {
                actionsAPI.wait('#thowError');
            }
        ];

    SETTINGS.TAKE_SCREENSHOT_ON_FAILS = false;
    expectedError                     = ERROR_TYPE.incorrectWaitActionMillisecondsArgument;
    expectedScreenshotCount           = 0;

    runner.act._start(stepNames, testSteps, 0);
});

module('in IFrame');

asyncTest('Uncaught error in test script', function () {
    var $iframe = $('<iframe>');

    $iframe[0].src = window.getCrossDomainPageUrl('../../data/runner/iframe.html');
    $iframe.appendTo('body');

    var steps = [
        {
            stepName: '1.',
            step:     function () {
                throw 'error';
            },
            stepNum:  0
        }
    ];

    SETTINGS.TAKE_SCREENSHOT_ON_FAILS = true;
    expectedError                     = ERROR_TYPE.uncaughtJSErrorInTestCodeStep;
    expectedScreenshotCount           = 1;
    runner._runInIFrame($iframe[0], steps[0].stepName, steps[0].step, steps[0].stepNum);
});

asyncTest('Invisible element', function () {
    var $iframe = $('<iframe>');

    $iframe[0].src = window.getCrossDomainPageUrl('../../data/runner/iframe.html');
    $iframe.appendTo('body');

    var steps = [
        {
            stepName: '1.',
            step:     function () {
                act.click("body1");
            },
            stepNum:  0
        }
    ];

    SETTINGS.TAKE_SCREENSHOT_ON_FAILS = true;
    expectedError                     = ERROR_TYPE.emptyFirstArgument;
    expectedScreenshotCount           = 1;

    runner._runInIFrame($iframe[0], steps[0].stepName, steps[0].step, steps[0].stepNum);
});

asyncTest('Error in api iframe argument', function () {
    var $iframe = $('<iframe>');

    $iframe[0].src = window.getCrossDomainPageUrl('../../data/runner/iframe.html');
    $iframe.appendTo('body');

    var inIFrame  = runner.inIFrame,
        stepNames = ['1'],
        steps     = [
            inIFrame(function () {
                return $('body');
            }, function () {
                wait(100);
            })
        ];

    SETTINGS.TAKE_SCREENSHOT_ON_FAILS = true;
    expectedError                     = ERROR_TYPE.iframeArgumentIsNotIFrame;
    expectedScreenshotCount           = 1;

    runner.act._start(stepNames, steps, 0);
});

asyncTest('Failed assertion in step with action', function () {
    var $iframe = $('<iframe>');

    $iframe[0].src = window.getCrossDomainPageUrl('../../data/runner/iframe.html');
    $iframe.appendTo('body');

    var steps = [
        {
            stepName: '1.',
            step:     function () {
                ok(0);
                eq(0, 1);
                act.wait('body1');
            },
            stepNum:  0
        }
    ];

    SETTINGS.TAKE_SCREENSHOT_ON_FAILS = true;
    expectedError                     = ERROR_TYPE.incorrectWaitActionMillisecondsArgument;
    expectedScreenshotCount           = 1;

    runner._runInIFrame($iframe[0], steps[0].stepName, steps[0].step, steps[0].stepNum);
});
