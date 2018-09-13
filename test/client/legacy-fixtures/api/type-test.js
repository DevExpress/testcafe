const testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
const ERROR_TYPE           = testCafeLegacyRunner.get('../test-run-error/type');
const SETTINGS             = testCafeLegacyRunner.get('./settings').get();
const actionsAPI           = testCafeLegacyRunner.get('./api/actions');
const StepIterator         = testCafeLegacyRunner.get('./step-iterator');


const stepIterator   = new StepIterator();
const initAutomation = testCafeLegacyRunner.get('./init-automation');

initAutomation();
actionsAPI.init(stepIterator);

const ELEMENT_WAITING_TIMEOUT = 400;

actionsAPI.setElementAvailabilityWaitingTimeout(ELEMENT_WAITING_TIMEOUT);

$(document).ready(function () {
    let asyncActionCallback;
    let currentErrorType   = null;
    let currentSourceIndex = null;
    let $input;

    //constants
    const TEST_ELEMENT_CLASS = 'testElement';

    //utils
    const runAsyncTest = function (actions, assertions, timeout) {
        let timeoutId        = null;
        let callbackFunction = function () {
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
        const seriesActionsRun = function (elements, callback) {
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
        const newText     = 'new text';
        const oldText     = 'old text';

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
