var testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
var ERROR_TYPE           = testCafeLegacyRunner.get('../test-run-error/type');
var SETTINGS             = testCafeLegacyRunner.get('./settings').get();
var actionsAPI           = testCafeLegacyRunner.get('./api/actions');
var StepIterator         = testCafeLegacyRunner.get('./step-iterator');
var initAutomation       = testCafeLegacyRunner.get('./init-automation');

initAutomation();

var stepIterator = new StepIterator();

actionsAPI.init(stepIterator);

$(document).ready(function () {
    var asyncActionCallback;
    var pageShortTimeoutDelay   = 500;
    var pageShortTimeoutExpired = false;
    var pageShortTimeoutId      = null;

    var pageLongTimeoutDelay   = 1000;
    var pageLongTimeoutExpired = false;
    var pageLongTimeoutId      = null;

    var currentErrorType   = null;
    var currentSourceIndex = null;
    //constants
    var SHORT_DELAY        = 10;
    var LONG_DELAY         = 1050;

    //utils
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

    StepIterator.prototype.asyncAction = function (action) {
        action(asyncActionCallback);
    };

    stepIterator.on(StepIterator.ERROR_EVENT, function (err) {
        stepIterator.state.stoppedOnFail = false;
        currentErrorType                 = err.type;
        currentSourceIndex               = err.__sourceIndex;
    });

    //tests
    QUnit.testStart(function () {
        asyncActionCallback = function () {
        };
        //set page timeouts
        pageShortTimeoutId  = window.setTimeout(function () {
            pageShortTimeoutExpired = true;
        }, pageShortTimeoutDelay);

        pageLongTimeoutId = window.setTimeout(function () {
            pageLongTimeoutExpired = true;
        }, pageLongTimeoutDelay);
    });

    QUnit.testDone(function () {
        currentErrorType   = null;
        currentSourceIndex = null;

        SETTINGS.ENABLE_SOURCE_INDEX = false;

        pageShortTimeoutExpired = false;
        window.clearTimeout(pageShortTimeoutId);
        pageShortTimeoutId = null;

        pageLongTimeoutExpired = false;
        window.clearTimeout(pageLongTimeoutId);
        pageLongTimeoutId = null;
    });

    asyncTest('wait with short ms parameter', function () {
        runAsyncTest(
            function () {
                actionsAPI.wait(SHORT_DELAY);
            },
            function () {
                ok(!pageShortTimeoutExpired, 'page short timeout doesn\'t over during wait action');
                ok(!pageLongTimeoutExpired, 'page short timeout doesn\'t over during wait action');
            },
            2000
        );
    });

    asyncTest('wait with long ms parameter', function () {
        runAsyncTest(
            function () {
                actionsAPI.wait(LONG_DELAY);
            },
            function () {
                ok(pageLongTimeoutExpired, 'page short timeout was over during wait action');
                ok(pageLongTimeoutExpired, 'page long timeout was over during wait action');
            },
            2000
        );
    });

    asyncTest('wait with feasible condition and long ms parameter', function () {
        runAsyncTest(
            function () {
                var i         = 0;
                var condition = function () {
                    ok(this.contextCheck, 'condition context is wrong');
                    if (i !== 10) {
                        i++;
                        return false;
                    }
                    return true;
                };

                this.contextCheck = true;

                actionsAPI.wait(LONG_DELAY, condition);
            },
            function () {
                ok(pageShortTimeoutExpired, 'page short timeout was over during wait action');
                ok(!pageLongTimeoutExpired, 'page timeout doesn\'t over during wait action');
            },
            2000
        );
    });

    asyncTest('wait with not feasible condition and long ms parameter', function () {
        runAsyncTest(
            function () {
                var condition = function () {
                    return false;
                };

                actionsAPI.wait(LONG_DELAY, condition);
            },
            function () {
                ok(pageShortTimeoutExpired, 'page short timeout was over during wait action');
                ok(pageLongTimeoutExpired, 'page timeout over over during wait action');
            },
            2000
        );
    });

    module('regression tests');

    asyncTest('not a number ms parameter raise error', function () {
        SETTINGS.ENABLE_SOURCE_INDEX = true;
        asyncActionCallback          = function () {
        };
        actionsAPI.wait('abc', '#567');
        window.setTimeout(function () {
            equal(currentErrorType, ERROR_TYPE.incorrectWaitActionMillisecondsArgument, 'correct error type sent');
            equal(currentSourceIndex, 567);
            start();
        }, 500);
    });

    asyncTest('not a function second parameter not raise error', function () {
        runAsyncTest(
            function () {
                actionsAPI.wait(SHORT_DELAY, 'abc');
            },
            function () {
                ok(!pageShortTimeoutExpired, 'page short timeout doesn\'t over during wait action');
                ok(!pageLongTimeoutExpired, 'page short timeout doesn\'t over during wait action');
            },
            2000
        );
    });

    asyncTest('mixed up settings raise error', function () {
        SETTINGS.ENABLE_SOURCE_INDEX = true;
        asyncActionCallback          = function () {
        };
        var i                        = 0;
        var condition                = function () {
            if (i !== 10) {
                i++;
                return false;
            }
            return true;
        };

        actionsAPI.wait(condition, SHORT_DELAY, '#90');
        window.setTimeout(function () {
            equal(currentErrorType, ERROR_TYPE.incorrectWaitActionMillisecondsArgument, 'correct error type sent');
            equal(currentSourceIndex, 90);
            start();
        }, 500);
    });
});
