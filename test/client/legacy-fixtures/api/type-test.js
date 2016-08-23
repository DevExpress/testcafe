var testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
var ERROR_TYPE           = testCafeLegacyRunner.get('../test-run-error/type');
var SETTINGS             = testCafeLegacyRunner.get('./settings').get();
var actionsAPI           = testCafeLegacyRunner.get('./api/actions');
var StepIterator         = testCafeLegacyRunner.get('./step-iterator');


var stepIterator   = new StepIterator();
var initAutomation = testCafeLegacyRunner.get('./init-automation');

initAutomation();
actionsAPI.init(stepIterator);

var ELEMENT_WAITING_TIMEOUT = 400;

actionsAPI.setElementAvailabilityWaitingTimeout(ELEMENT_WAITING_TIMEOUT);

$(document).ready(function () {
    var asyncActionCallback;
    var currentErrorType   = null;
    var currentSourceIndex = null;
    var $input;

    //constants
    var TEST_ELEMENT_CLASS = 'testElement';

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
        actions();
        timeoutId = setTimeout(function () {
            callbackFunction = function () {
            };
            ok(false, 'Timeout is exceeded');
            start();
        }, timeout);
    };

    StepIterator.prototype.asyncActionSeries = function (items, runArgumentsIterator, action) {
        var seriesActionsRun = function (elements, callback) {
            window.async.forEachSeries(
                elements,
                function (element, seriaCallback) {
                    action(element, seriaCallback);
                },
                function () {
                    callback();
                });
        };

        runArgumentsIterator(items, seriesActionsRun, asyncActionCallback);
    };

    StepIterator.prototype.onActionTargetWaitingStarted = function () {
    };

    StepIterator.prototype.onActionRun = function () {
    };

    stepIterator.on(StepIterator.ERROR_EVENT, function (err) {
        stepIterator.state.stoppedOnFail = false;
        currentErrorType                 = err.type;
        currentSourceIndex               = err.__sourceIndex;
    });

    //tests
    QUnit.testStart(function () {
        $input = $('<input type="text" id="input" class="input"/>').addClass(TEST_ELEMENT_CLASS).appendTo($('body'));
    });

    QUnit.testDone(function () {
        $('body').focus();

        $('.' + TEST_ELEMENT_CLASS).remove();
        currentErrorType             = null;
        currentSourceIndex           = null;
        SETTINGS.ENABLE_SOURCE_INDEX = false;
    });

    asyncTest('by default type command concats new text with the old one', function () {
        var newText     = 'new text';
        var oldText     = 'old text';

        $input[0].value = oldText;
        runAsyncTest(
            function () {
                actionsAPI.type($input, newText);
            },
            function () {
                equal($input[0].value, oldText.concat(newText), 'new text concated with the old one');
            },
            2000
        );
    });

    asyncTest('empty first argument raises error', function () {
        SETTINGS.ENABLE_SOURCE_INDEX = true;
        asyncActionCallback          = function () {
        };
        actionsAPI.type($('#nonExistentElement'), 'text', '#213');
        setTimeout(function () {
            equal(currentErrorType, ERROR_TYPE.emptyFirstArgument, 'correct error type is sent');
            equal(currentSourceIndex, 213);
            start();
        }, ELEMENT_WAITING_TIMEOUT + 100);
    });

    asyncTest('empty "text" argument raises error', function () {
        SETTINGS.ENABLE_SOURCE_INDEX = true;
        asyncActionCallback          = function () {
        };

        actionsAPI.type($input, '', '#218');

        setTimeout(function () {
            equal(currentErrorType, ERROR_TYPE.emptyTypeActionArgument, 'correct error type is sent');
            equal(currentSourceIndex, 218);
            start();
        }, 500);
    });
});
