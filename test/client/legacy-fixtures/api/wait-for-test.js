var testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
var ERROR_TYPE           = testCafeLegacyRunner.get('../test-run-error/type');
var SETTINGS             = testCafeLegacyRunner.get('./settings').get();
var actionsAPI           = testCafeLegacyRunner.get('./api/actions');
var StepIterator         = testCafeLegacyRunner.get('./step-iterator');
var initAutomation       = testCafeLegacyRunner.get('./init-automation');

initAutomation();

var actionTargetWaitingCounter = 0;
var actionRunCounter           = 0;

StepIterator.prototype.onActionTargetWaitingStarted = function () {
    actionTargetWaitingCounter++;
};

StepIterator.prototype.onActionRun = function () {
    actionRunCounter++;
};

var stepIterator = null;

$(document).ready(function () {
    var currentErrorType   = null;
    var currentSourceIndex = null;
    var asyncActionCallback;

    var runAsyncTest = function (actions, assertions, timeout) {
        var timeoutId        = null;
        var callbackFunction = function () {
            clearTimeout(timeoutId);
            assertions();
            start();
        };

        asyncActionCallback = function () {
            callbackFunction();
        };

        stepIterator.callWithSharedDataContext(actions);

        timeoutId = setTimeout(function () {
            callbackFunction = function () {
            };

            ok(false, 'Timeout is exceeded');
            start();
        }, timeout);
    };

    QUnit.testStart(function () {
        actionTargetWaitingCounter = 0;
        actionRunCounter           = 0;

        stepIterator = new StepIterator();

        actionsAPI.init(stepIterator);

        stepIterator.on(StepIterator.ERROR_EVENT, function (err) {
            stepIterator.state.stoppedOnFail = false;
            currentErrorType                 = err.type;
            currentSourceIndex               = err.__sourceIndex;
        });

        stepIterator.asyncAction = function (action) {
            action(asyncActionCallback);
        };
    });

    QUnit.testDone(function () {
        currentErrorType   = null;
        currentSourceIndex = null;

        SETTINGS.ENABLE_SOURCE_INDEX = false;
    });

    asyncTest('wait event', function () {
        var requestComplete = false;

        runAsyncTest(
            function () {
                this.contextCheck = true;

                actionsAPI.waitFor(function (callback) {
                    ok(this.contextCheck, 'event should have access to shared data');

                    $.get('/xhr-test/200', function () {
                        requestComplete = true;
                        callback();
                    });
                }, 1000);
            },
            function () {
                ok(requestComplete, 'action don\'t accomplished waiting for event');
                ok(!currentErrorType, 'action raised error');
                equal(actionTargetWaitingCounter, 1);
                equal(actionRunCounter, 1);
            },
            2000
        );
    });

    asyncTest('event timeout', function () {
        SETTINGS.ENABLE_SOURCE_INDEX = true;

        function delay300s (callback) {
            window.setTimeout(callback, 300);
        }

        actionsAPI.waitFor(delay300s, 20, '#508');

        window.setTimeout(function () {
            strictEqual(currentErrorType, ERROR_TYPE.waitForActionTimeoutExceeded);
            strictEqual(currentSourceIndex, 508);
            equal(actionTargetWaitingCounter, 1);
            equal(actionRunCounter, 0);

            window.setTimeout(start, 300);
        }, 100);
    });

    asyncTest('incorrect "event" argument', function () {
        expect(2);

        SETTINGS.ENABLE_SOURCE_INDEX = true;
        asyncActionCallback          = function () {
        };

        actionsAPI.waitFor(123, 20, '#808');

        window.setTimeout(function () {
            strictEqual(currentErrorType, ERROR_TYPE.incorrectWaitForActionEventArgument);
            strictEqual(currentSourceIndex, 808);
            start();
        });
    });

    asyncTest('incorrect "timeout" argument', function () {
        expect(2);

        SETTINGS.ENABLE_SOURCE_INDEX = true;
        asyncActionCallback          = function () {
        };

        actionsAPI.waitFor(function () {
        }, 'test', '#313');

        window.setTimeout(function () {
            strictEqual(currentErrorType, ERROR_TYPE.incorrectWaitForActionTimeoutArgument);
            strictEqual(currentSourceIndex, 313);
            start();
        });
    });

    module('Wait for elements');
    asyncTest('wait for an element success', function () {
        expect(3);
        SETTINGS.ENABLE_SOURCE_INDEX = true;

        var $element = $('<div></div>').attr('id', 'testDivElement');

        asyncActionCallback = function () {
            equal(currentErrorType, null);
            $element.remove();
            equal(actionTargetWaitingCounter, 1);
            equal(actionRunCounter, 1);
            start();
        };

        actionsAPI.waitFor('#testDivElement', '#101');
        window.setTimeout(function () {
            $element.appendTo('body');
        }, 250);
    });

    asyncTest('wait for an element timeout exceed', function () {
        expect(5);
        SETTINGS.ENABLE_SOURCE_INDEX = true;

        var asyncActionCallbackRaised = false;

        asyncActionCallback = function () {
            asyncActionCallbackRaised = true;
        };

        actionsAPI.waitFor('#testDivElement', 250, '#102');

        window.setTimeout(function () {
            strictEqual(currentErrorType, ERROR_TYPE.waitForActionTimeoutExceeded);
            strictEqual(currentSourceIndex, 102);
            equal(asyncActionCallbackRaised, false);
            equal(actionTargetWaitingCounter, 1);
            equal(actionRunCounter, 0);

            start();
        }, 500);
    });

    asyncTest('wait for several elements success', function () {
        expect(3);
        SETTINGS.ENABLE_SOURCE_INDEX = true;

        var $element1 = $('<div></div>').attr('id', 'testDivElement1');
        var $element2 = $('<div></div>').attr('id', 'testDivElement2');

        asyncActionCallback = function () {
            equal(currentErrorType, null);
            $element1.remove();
            $element2.remove();
            equal(actionTargetWaitingCounter, 1);
            equal(actionRunCounter, 1);
            start();
        };

        actionsAPI.waitFor(['#testDivElement1', '#testDivElement2'], '#103');

        window.setTimeout(function () {
            $element1.appendTo('body');

            window.setTimeout(function () {
                $element2.appendTo('body');
            }, 200);
        }, 200);
    });

    asyncTest('wait for several elements timeout exceed', function () {
        expect(5);
        SETTINGS.ENABLE_SOURCE_INDEX = true;

        var $element                  = $('<div></div>').attr('id', 'testDivElement1').appendTo('body');
        var asyncActionCallbackRaised = false;

        asyncActionCallback = function () {
            asyncActionCallbackRaised = true;
        };

        actionsAPI.waitFor(['#testDivElement1', '#testDivElement2'], 150, '#104');

        window.setTimeout(function () {
            strictEqual(currentErrorType, ERROR_TYPE.waitForActionTimeoutExceeded);
            strictEqual(currentSourceIndex, 104);
            equal(asyncActionCallbackRaised, false);
            equal(actionTargetWaitingCounter, 1);
            equal(actionRunCounter, 0);

            $element.remove();
            start();
        }, 300);
    });

    asyncTest('Empty array as the first argument argument', function () {
        expect(2);

        SETTINGS.ENABLE_SOURCE_INDEX = true;
        asyncActionCallback          = function () {
        };

        actionsAPI.waitFor([], '#105');

        window.setTimeout(function () {
            strictEqual(currentErrorType, ERROR_TYPE.incorrectWaitForActionEventArgument);
            strictEqual(currentSourceIndex, 105);
            start();
        });
    });
});
