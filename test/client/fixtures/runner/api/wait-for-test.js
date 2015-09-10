var testCafeCore = window.getTestCafeModule('testCafeCore');
var SETTINGS     = testCafeCore.get('./settings').get();
var ERROR_TYPE   = testCafeCore.ERROR_TYPE;

var testCafeRunner = window.getTestCafeModule('testCafeRunner');
var actionsAPI     = testCafeRunner.get('./api/actions');
var automation     = testCafeRunner.get('./automation/automation');
var StepIterator   = testCafeRunner.get('./step-iterator');

var testCafeUI = window.getTestCafeModule('testCafeUI');
var cursor     = testCafeUI.get('./cursor');


automation.init();
cursor.init();

var actionTargetWaitingCounter = 0,
    actionRunCounter           = 0;

StepIterator.prototype.onActionTargetWaitingStarted = function () {
    actionTargetWaitingCounter++;
};

StepIterator.prototype.onActionRun = function () {
    actionRunCounter++;
};

var stepIterator = null;

$(document).ready(function () {
        var currentErrorCode   = null,
            currentSourceIndex = null,
            asyncActionCallback,

            runAsyncTest       = function (actions, assertions, timeout) {
                var callbackFunction = function () {
                    clearTimeout(timeoutId);
                    assertions();
                    start();
                };

                asyncActionCallback = function () {
                    callbackFunction();
                };

                stepIterator.callWithSharedDataContext(actions);

                var timeoutId = setTimeout(function () {
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
                currentErrorCode                 = err.code;
                currentSourceIndex               = err.__sourceIndex;
            });

            stepIterator.asyncAction = function (action) {
                action(asyncActionCallback);
            };

            stepIterator.expectInactivity = function (duration, callback) {
                callback();
            };
        });

        QUnit.testDone(function () {
            currentErrorCode   = null;
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
                    ok(!currentErrorCode, 'action raised error');
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
                strictEqual(currentErrorCode, ERROR_TYPE.waitForActionTimeoutExceeded);
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
                strictEqual(currentErrorCode, ERROR_TYPE.incorrectWaitForActionEventArgument);
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
                strictEqual(currentErrorCode, ERROR_TYPE.incorrectWaitForActionTimeoutArgument);
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
                equal(currentErrorCode, null);
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
                strictEqual(currentErrorCode, ERROR_TYPE.waitForActionTimeoutExceeded);
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

            var $element1 = $('<div></div>').attr('id', 'testDivElement1'),
                $element2 = $('<div></div>').attr('id', 'testDivElement2');

            asyncActionCallback = function () {
                equal(currentErrorCode, null);
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

            var $element                  = $('<div></div>').attr('id', 'testDivElement1').appendTo('body'),
                asyncActionCallbackRaised = false;

            asyncActionCallback = function () {
                asyncActionCallbackRaised = true;
            };

            actionsAPI.waitFor(['#testDivElement1', '#testDivElement2'], 150, '#104');

            window.setTimeout(function () {
                strictEqual(currentErrorCode, ERROR_TYPE.waitForActionTimeoutExceeded);
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
                strictEqual(currentErrorCode, ERROR_TYPE.incorrectWaitForActionEventArgument);
                strictEqual(currentSourceIndex, 105);
                start();
            });
        });
    }
);
