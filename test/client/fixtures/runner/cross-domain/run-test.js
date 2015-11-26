var hammerhead  = window.getTestCafeModule('hammerhead');
var hhsettings = hammerhead.get('./settings').get();

var testCafeRunner = window.getTestCafeModule('testCafeRunner');
var RunnerBase     = testCafeRunner.get('./runner-base');

hhsettings.serviceMsgUrl = '/ping/10';

asyncTest('run test', function () {
    var $iframe    = $('<iframe>');
    var iframeSrc  = window.QUnitGlobals.getResourceUrl();
    $iframe[0].src = window.getCrossDomainPageUrl('../../../data/runner/iframe.html');
    $iframe.appendTo('body');

    var runner          = new RunnerBase(),
        inIFrame        = runner.inIFrame,
        eq              = runner.eq,
        stepCount       = 0,
        iframeStepCount = 0,
        errorRaised     = false,
        assertionFailed = false,
        sharedData      = {},
        stepNames       = ['1', '2', '3', '4'],
        steps           = [
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

    var storedIFrameStepExecuted = runner._onIFrameStepExecuted;
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

    runner.act._start(stepNames, steps, 0);
});
