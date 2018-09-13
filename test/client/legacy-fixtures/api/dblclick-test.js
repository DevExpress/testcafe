const hammerhead       = window.getTestCafeModule('hammerhead');
const browserUtils     = hammerhead.utils.browser;
const featureDetection = hammerhead.utils.featureDetection;

const testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
const ERROR_TYPE           = testCafeLegacyRunner.get('../test-run-error/type');
const SETTINGS             = testCafeLegacyRunner.get('./settings').get();
const actionsAPI           = testCafeLegacyRunner.get('./api/actions');
const StepIterator         = testCafeLegacyRunner.get('./step-iterator');
const initAutomation       = testCafeLegacyRunner.get('./init-automation');

initAutomation();

const stepIterator = new StepIterator();

actionsAPI.init(stepIterator);

const correctTestWaitingTime = function (time) {
    if (featureDetection.isTouchDevice && browserUtils.isFirefox)
        return time * 2;

    return time;
};

const ELEMENT_WAITING_TIMEOUT = 400;

actionsAPI.setElementAvailabilityWaitingTimeout(ELEMENT_WAITING_TIMEOUT);

$(document).ready(function () {
    let actionTargetWaitingCounter = 0;
    let actionRunCounter           = 0;

    let $el;
    let currentErrorType   = null;
    let currentSourceIndex = null;

    //constants
    const TEST_ELEMENT_CLASS = 'testElement';

    //utils
    let asyncActionCallback;

    const addInputElement = function (type, id, x, y) {
        const elementString = ['<input type="', type, '" id="', id, '" value="', id, '" />'].join('');

        return $(elementString)
            .css({
                position:   'absolute',
                marginLeft: x + 'px',
                marginTop:  y + 'px'
            })
            .addClass(type)
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo('body');
    };

    const runAsyncTest = function (actions, assertions, timeout) {
        let timeoutId = null;

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

    //tests
    QUnit.testStart(function () {
        $el                 = addInputElement('button', 'button1', Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100));
        asyncActionCallback = function () {
        };

        actionTargetWaitingCounter = 0;
        actionRunCounter           = 0;
    });

    QUnit.testDone(function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
        currentErrorType             = null;
        currentSourceIndex           = null;
        SETTINGS.ENABLE_SOURCE_INDEX = false;
    });

    module('different arguments tests');

    asyncTest('dom element as a parameter', function () {
        let dblclicked = false;

        runAsyncTest(
            function () {
                $el.dblclick(function () {
                    dblclicked = true;
                });
                actionsAPI.dblclick($el[0]);
            },
            function () {
                ok(dblclicked, 'dblclick raised');
                equal(actionTargetWaitingCounter, 1);
                equal(actionRunCounter, 1);
            },
            correctTestWaitingTime(5500)
        );
    });

    asyncTest('jQuery object with two elements as a parameter', function () {
        let dblclicksCount = 0;

        runAsyncTest(
            function () {
                addInputElement('button', 'button2', 150, 150);
                const $elements = $('.button').dblclick(function () {
                    dblclicksCount++;
                });

                actionsAPI.dblclick($elements);
            },
            function () {
                equal(dblclicksCount, 2, 'both elements click events were raised');
                equal(actionTargetWaitingCounter, 1);
                equal(actionRunCounter, 1);
            },
            correctTestWaitingTime(5500)
        );
    });

    asyncTest('empty first argument raises error', function () {
        SETTINGS.ENABLE_SOURCE_INDEX = true;
        actionsAPI.dblclick($('#nonExistentElement'), '#0');
        setTimeout(function () {
            equal(currentErrorType, ERROR_TYPE.emptyFirstArgument);
            equal(currentSourceIndex, 0);
            start();
        }, correctTestWaitingTime(ELEMENT_WAITING_TIMEOUT + 100));
    });

    asyncTest('dblclick with options keys', function () {
        let focused = false;
        let alt     = false;
        let shift   = false;
        let ctrl    = false;
        let meta    = false;

        runAsyncTest(
            function () {
                $el.css({ display: 'none' });
                const $input = addInputElement('text', 'input', 150, 150);

                $input.focus(function () {
                    focused = true;
                });
                $input.dblclick(function (e) {
                    alt   = e.altKey;
                    ctrl  = e.ctrlKey;
                    shift = e.shiftKey;
                    meta  = e.metaKey;
                });
                actionsAPI.dblclick($input[0], {
                    alt:   true,
                    ctrl:  true,
                    shift: true,
                    meta:  true
                });
            },
            function () {
                ok(focused, 'clicked element focused');
                ok(alt, 'alt key is pressed');
                ok(shift, 'shift key is pressed');
                ok(ctrl, 'ctrl key is pressed');
                ok(meta, 'meta key is pressed');
            },
            correctTestWaitingTime(5500)
        );
    });
});
