const hammerhead   = window.getTestCafeModule('hammerhead');
const hhsettings   = hammerhead.settings.get();
const browserUtils = hammerhead.utils.browser;

const testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
const RunnerBase           = testCafeLegacyRunner.get('./runner-base');

hhsettings.serviceMsgUrl = '/ping/10';

// HACK: we shouldn't override native dialogs methods, while testing on the
// android simulator, because this results in an unexpected window.alert call.
// https://github.com/DevExpress/testcafe/issues/471#issuecomment-220386269.
if (browserUtils.isAndroid) {
    RunnerBase.prototype._initNativeDialogs = function () {
    };
}

asyncTest('run test', function () {
    const $iframe = $('<iframe>');

    $iframe[0].src = window.getCrossDomainPageUrl('../../data/runner/iframe.html');
    $iframe.appendTo('body');

    const runner          = new RunnerBase();
    const inIFrame        = runner.inIFrame;
    const eq              = runner.eq;

    let stepCount       = 0;
    let iframeStepCount = 0;
    let errorRaised     = false;
    let assertionFailed = false;
    let sharedData      = {};

    const stepNames       = ['1', '2', '3', '4'];
    const steps           = [
        function () {
            this.testValue = 1;
        },
        inIFrame(function () {
            return $iframe[0];
        }, function () {
            eq(this.testValue, 1);
            this.testValue = 2;
        }),
        function () {
            eq(this.testValue, 2);
            this.testValue = 3;
        },
        inIFrame(function () {
            return $iframe[0];
        }, function () {
            eq(this.testValue, 3);
        })
    ];

    const storedIFrameStepExecuted = runner._onIFrameStepExecuted;

    runner._onIFrameStepExecuted = function () {
        iframeStepCount++;
        storedIFrameStepExecuted.call(runner);
    };

    runner._onFatalError = function () {
        errorRaised = true;
    };

    runner._onAssertionFailed = function () {
        assertionFailed = true;
    };

    runner._onNextStepStarted = function (e) {
        stepCount++;
        e.callback();
    };

    runner._onSetStepsSharedData = function (e) {
        sharedData = e.stepsSharedData;
        e.callback();
    };

    runner._onGetStepsSharedData = function (e) {
        e.callback(sharedData);
    };

    runner._prepareStepsExecuting = function (callback) {
        callback();
    };

    runner.on(runner.TEST_COMPLETED_EVENT, function () {
        equal(stepCount, 4);
        equal(iframeStepCount, 2);
        ok(!errorRaised);
        ok(!assertionFailed);
        $iframe.remove();
        start();
    });

    runner.nextStep = 0;
    runner.act._start(stepNames, steps);
});
