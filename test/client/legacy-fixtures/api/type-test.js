var testCafeCore = window.getTestCafeModule('testCafeCore');

var testCafeAutomation = window.getTestCafeModule('testCafeAutomation');
var TypeAutomation     = testCafeAutomation.Type;
var TypeOptions        = testCafeAutomation.get('../../test-run/commands/options').TypeOptions;

var hammerhead   = window.getTestCafeModule('hammerhead');
var browserUtils = hammerhead.utils.browser;

var ERROR_TYPE = testCafeCore.ERROR_TYPE;

var testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
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
    var actionTargetWaitingCounter = 0,
        actionRunCounter           = 0;

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
        actionTargetWaitingCounter++;
    };

    StepIterator.prototype.onActionRun = function () {
        actionRunCounter++;
    };

    stepIterator.on(StepIterator.ERROR_EVENT, function (err) {
        stepIterator.state.stoppedOnFail = false;
        currentErrorType                 = err.type;
        currentSourceIndex               = err.__sourceIndex;
    });

    var asyncActionCallback,
        currentErrorType   = null,
        currentSourceIndex = null,
        $input,

        //constants
        TEST_ELEMENT_CLASS = 'testElement',

        //utils
        runAsyncTest       = function (actions, assertions, timeout) {
            var callbackFunction = function () {
                clearTimeout(timeoutId);
                assertions();
                start();
            };
            asyncActionCallback  = function () {
                callbackFunction();
            };
            actions();
            var timeoutId = setTimeout(function () {
                callbackFunction = function () {
                };
                ok(false, 'Timeout is exceeded');
                start();
            }, timeout);
        };


    //tests
    QUnit.testStart(function () {
        $input                     = $('<input type="text" id="input" class="input"/>').addClass(TEST_ELEMENT_CLASS).appendTo($('body'));
        actionTargetWaitingCounter = 0;
        actionRunCounter           = 0;
    });

    QUnit.testDone(function () {
        $('body').focus();

        $('.' + TEST_ELEMENT_CLASS).remove();
        currentErrorType             = null;
        currentSourceIndex           = null;
        SETTINGS.ENABLE_SOURCE_INDEX = false;
    });

    asyncTest('by default type command concats new text with the old one', function () {
        var newText     = 'new text',
            oldText     = 'old text';
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
