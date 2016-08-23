var hammerhead   = window.getTestCafeModule('hammerhead');
var hhsettings   = hammerhead.get('./settings').get();
var browserUtils = hammerhead.utils.browser;

var testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
var RunnerBase           = testCafeLegacyRunner.get('./runner-base');

hhsettings.serviceMsgUrl = '/ping/10';

// HACK: we shouldn't override native dialogs methods, while testing on the
// android simulator, because this results in an unexpected window.alert call.
// https://github.com/DevExpress/testcafe/issues/471#issuecomment-220386269.
if (browserUtils.isAndroid) {
    RunnerBase.prototype._initNativeDialogs = function () {
    };
}

asyncTest('run steps in iframe', function () {
    var $iframe = $('<iframe>');

    $iframe[0].src = window.getCrossDomainPageUrl('../../data/runner/iframe.html');
    $iframe.appendTo('body');

    var testRunner      = new RunnerBase();
    var count           = 0;
    var errorRaised     = false;
    var assertionFailed = false;
    var clickRaised     = false;
    var steps           = [
        {
            stepName: '1.Click',
            step:     function () {
                /*eslint-disable no-undef*/
                act.click('#button');
                /*eslint-enable no-undef*/
            },

            stepNum: 0
        },
        {
            stepName: '2.Assert',
            step:     function () {
                ok(true);
            },

            stepNum: 1
        }
    ];

    testRunner.stepIterator.runNext = function () {
    };

    var storedIFrameStepExecuted = testRunner._onIFrameStepExecuted;

    testRunner._onIFrameStepExecuted = function () {
        storedIFrameStepExecuted.call(testRunner);
        count++;

        if (count === 1) {
            testRunner._runInIFrame($iframe[0], steps[1].stepName, steps[1].step, steps[1].stepNum);
            return;
        }

        if (count === 2) {
            ok(!errorRaised);
            ok(!assertionFailed);
            ok(clickRaised);

            $iframe.remove();
            testRunner._destroyIFrameBehavior();

            start();
        }
    };

    testRunner._onFatalError = function () {
        errorRaised = true;
    };

    testRunner._onAssertionFailed = function () {
        assertionFailed = true;
    };

    window.onmessage = function (e) {
        var data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;

        if (data.type === 'clickRaised')
            clickRaised = true;
    };


    $iframe.load(function () {
        testRunner._runInIFrame($iframe[0], steps[0].stepName, steps[0].step, steps[0].stepNum);
    });
});

asyncTest('element error', function () {
    var $iframe = $('<iframe>');

    $iframe[0].src = window.getCrossDomainPageUrl('../../data/runner/iframe.html');
    $iframe.appendTo('body');

    var testRunner  = new RunnerBase();
    var errorRaised = false;
    var steps       = [
        {
            stepName: '1.Failed element',
            step:     function () {
                var el = $('#failed');

                /*eslint-disable no-undef*/
                act.click(el);
                /*eslint-enable no-undef*/
            },

            stepNum: 0
        }
    ];

    testRunner._onFatalError = function () {
        errorRaised = true;
    };

    $iframe.load(function () {
        testRunner._runInIFrame($iframe[0], steps[0].stepName, steps[0].step, steps[0].stepNum);

        window.setTimeout(function () {
            ok(errorRaised);

            $iframe.remove();
            testRunner._destroyIFrameBehavior();

            start();
        }, 1000);
    });
});

asyncTest('failed assertion', function () {
    var $iframe = $('<iframe>');

    $iframe[0].src = window.getCrossDomainPageUrl('../../data/runner/iframe.html');
    $iframe.appendTo('body');

    var testRunner      = new RunnerBase();
    var assertionFailed = false;
    var steps           = [
        {
            stepName: '1.Failed assertion',
            step:     function () {
                /*eslint-disable no-undef*/
                eq(true, false);
                /*eslint-enable no-undef*/
            },

            stepNum: 0
        }
    ];

    testRunner._onAssertionFailed = function (e) {
        assertionFailed = true;

        if (e && e.callback)
            e.callback();
    };

    testRunner.stepIterator.runNext = function () {
    };

    var storedIFrameStepExecuted = testRunner._onIFrameStepExecuted;

    testRunner._onIFrameStepExecuted = function () {
        storedIFrameStepExecuted.call(testRunner);
        ok(assertionFailed);
        $iframe.remove();
        testRunner._destroyIFrameBehavior();

        start();
    };

    $iframe.load(function () {
        testRunner._runInIFrame($iframe[0], steps[0].stepName, steps[0].step, steps[0].stepNum);
    });
});

asyncTest('shared data', function () {
    var $iframe = $('<iframe>');

    $iframe[0].src = window.getCrossDomainPageUrl('../../data/runner/iframe.html');
    $iframe.appendTo('body');

    var testRunner      = new RunnerBase();
    var count           = 0;
    var assertionFailed = false;
    var errorRaised     = false;
    var sharedData      = {};
    var steps           = [
        {
            stepName: '1.Set data',
            step:     function () {
                this.testValue = true;
            },

            stepNum: 0
        },
        {
            stepName: '2.Check and change data',
            step:     function () {
                ok(this.testValue);
                this.testValue = false;
            },

            stepNum: 1
        },
        {
            stepName: '3.Check data',
            step:     function () {
                ok(!this.testValue);
            },

            stepNum: 2
        }
    ];

    testRunner._onAssertionFailed = function () {
        assertionFailed = true;
    };

    testRunner._onFatalError = function () {
        errorRaised = true;
    };

    testRunner._onSetStepsSharedData = function (e) {
        sharedData = e.stepsSharedData;
        e.callback();
    };

    testRunner._onGetStepsSharedData = function (e) {
        e.callback(sharedData);
    };

    testRunner._prepareStepsExecuting = function (callback) {
        callback();
    };

    testRunner._onTestComplete = function () {
        stepDone();
    };

    testRunner.stepIterator.runNext = function () {
    };

    var storedIFrameStepExecuted = testRunner._onIFrameStepExecuted;

    testRunner._onIFrameStepExecuted = function () {
        storedIFrameStepExecuted.call(testRunner);
        stepDone();
    };

    testRunner.nextStep = steps[0].stepNum;
    testRunner.act._start([steps[0].stepName], [steps[0].step]);

    function stepDone () {
        count++;

        if (count === 1) {
            testRunner._runInIFrame($iframe[0], steps[1].stepName, steps[1].step, steps[1].stepNum);
            return;
        }

        if (count === 2) {
            testRunner.run([steps[0].stepName, steps[1].stepName, steps[2].stepName], [steps[0].step, steps[1].step, steps[2].step], steps[2].stepNum);
            return;
        }

        if (count === 3) {
            ok(!assertionFailed);
            ok(!errorRaised);

            testRunner._destroyIFrameBehavior();
            $iframe.remove();

            start();
        }
    }
});

asyncTest('xhrBarrier', function () {
    var $iframe = $('<iframe>');

    $iframe[0].src = window.getCrossDomainPageUrl('../../data/runner/iframe.html');
    $iframe.appendTo('body');

    var testRunner      = new RunnerBase();
    var assertionFailed = false;
    var count           = 0;
    var steps           = [
        {
            stepName: '1.Click button',
            step:     function () {
                ok(!window.xhrCompleted);
                /*eslint-disable no-undef*/
                act.click('#xhrButton');
                /*eslint-enable no-undef*/
            },

            stepNum: 0
        },
        {
            stepName: '2.Check xhr is completed',
            step:     function () {
                ok(window.xhrCompleted);
            },

            stepNum: 1
        }
    ];

    testRunner._onAssertionFailed = function () {
        assertionFailed = true;
    };

    testRunner.stepIterator.runNext = function () {
    };

    var storedIFrameStepExecuted = testRunner._onIFrameStepExecuted;

    testRunner._onIFrameStepExecuted = function () {
        storedIFrameStepExecuted.call(testRunner);
        count++;

        if (count === 1)
            testRunner._runInIFrame($iframe[0], steps[1].stepName, steps[1].step, steps[1].stepNum);
        else {
            ok(!assertionFailed);

            testRunner._destroyIFrameBehavior();
            $iframe.remove();

            start();
        }
    };

    $iframe.load(function () {
        testRunner._runInIFrame($iframe[0], steps[0].stepName, steps[0].step, steps[0].stepNum);
    });
});

asyncTest('waiting for postback', function () {
    var $iframe = $('<iframe>');

    $iframe[0].src = window.getCrossDomainPageUrl('../../data/runner/iframe.html');
    $iframe.appendTo('body');

    var testRunner      = new RunnerBase();
    var assertionFailed = false;
    var errorRaised     = false;
    var count           = 0;
    var steps           = [
        {
            stepName: '1.Click link',
            step:     function () {
                ok(window.loadedTime);
                this.firstLoadingTime = window.loadedTime;
                /*eslint-disable no-undef*/
                act.click('#link');
                /*eslint-enable no-undef*/
            },

            stepNum: 0
        },
        {
            stepName: '2.Check the page is loaded for the second time',
            step:     function () {
                ok(window.loadedTime);
                /*eslint-disable no-undef*/
                notEq(this.firstLoadingTime, window.loadedTime);
                /*eslint-enable no-undef*/
            },

            stepNum: 1
        }
    ];

    testRunner._onAssertionFailed = function () {
        assertionFailed = true;
    };

    testRunner._onFatalError = function () {
        errorRaised = true;
    };

    testRunner.stepIterator.runNext = function () {
    };

    var storedIFrameStepExecuted = testRunner._onIFrameStepExecuted;

    testRunner._onIFrameStepExecuted = function () {
        storedIFrameStepExecuted.call(testRunner);
        count++;

        if (count === 1)
            testRunner._runInIFrame($iframe[0], steps[1].stepName, steps[1].step, steps[1].stepNum);
        else {
            ok(!assertionFailed);
            ok(!errorRaised);

            testRunner._destroyIFrameBehavior();
            $iframe.remove();

            start();
        }
    };

    function onFirstIframeLoad () {
        $iframe.off('load', onFirstIframeLoad);
        testRunner._runInIFrame($iframe[0], steps[0].stepName, steps[0].step, steps[0].stepNum);
    }

    $iframe.on('load', onFirstIframeLoad);
});
