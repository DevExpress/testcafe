const hammerhead       = window.getTestCafeModule('hammerhead');
const browserUtils     = hammerhead.utils.browser;
const featureDetection = hammerhead.utils.featureDetection;

const testCafeCore  = window.getTestCafeModule('testCafeCore');
const domUtils      = testCafeCore.get('./utils/dom');
const textSelection = testCafeCore.get('./utils/text-selection');

const testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
const ERROR_TYPE           = testCafeLegacyRunner.get('../test-run-error/type');
const SETTINGS             = testCafeLegacyRunner.get('./settings').get();
const actionsAPI           = testCafeLegacyRunner.get('./api/actions');
const StepIterator         = testCafeLegacyRunner.get('./step-iterator');

const stepIterator = new StepIterator();

actionsAPI.init(stepIterator);

const initAutomation = testCafeLegacyRunner.get('./init-automation');

initAutomation();

const correctTestWaitingTime = function (time) {
    if (featureDetection.isTouchDevice || featureDetection.hasTouchPoints)
        return time * 2;

    return time;
};

$(document).ready(function () {
    let asyncActionCallback;
    let actionTargetWaitingCounter = 0;
    let actionRunCounter           = 0;
    let currentErrorType           = null;
    let currentSourceIndex         = null;

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

    //constants
    const TEXTAREA_SELECTOR    = '#textarea';
    const INPUT_SELECTOR       = '#input';
    const DIV_ELEMENT_SELECTOR = '#div';

    const INPUT_INITIAL_VALUE = '123456789';

    const startSelectEvent = featureDetection.isTouchDevice ? 'ontouchstart' : 'onmousedown';
    const endSelectEvent   = featureDetection.isTouchDevice ? 'ontouchend' : 'onmouseup';

    let mousedownOnInput    = false;
    let mouseupOnInput      = false;
    let mousedownOnTextarea = false;
    let mouseupOnTextarea   = false;

    //utils
    function setValueToTextarea (value) {
        const textarea = $(TEXTAREA_SELECTOR)[0];

        textarea.value       = value;
        textarea.textContent = value;

        $(textarea).text(value);

        restorePageState();
    }

    function setValueToInput (value) {
        const input = $(INPUT_SELECTOR)[0];

        input.value = value;

        restorePageState();
    }

    function setSelection ($el, start, end, inverse) {
        start = start || 0;

        //NOTE: set to start position
        const el            = $el[0];
        const startPosition = inverse ? end : start;

        if (el.setSelectionRange)
            el.setSelectionRange(startPosition, startPosition);
        else {
            el.selectionStart = startPosition;
            el.selectionEnd   = startPosition;
        }

        //NOTE: select
        if (el.setSelectionRange)
            el.setSelectionRange(start, end, inverse ? 'backward' : 'forward');
        else {
            el.selectionStart = start;
            el.selectionEnd   = end;
        }
    }

    function checkSelection (el, start, end, inverse) {
        equal(domUtils.getActiveElement(), el, 'selected element is active');
        equal(textSelection.getSelectionStart(el), start, 'start selection correct');
        equal(textSelection.getSelectionEnd(el), end, 'end selection correct');
        equal(textSelection.hasInverseSelection(el), inverse || false, 'selection direction correct');
    }

    function restorePageState () {
        const $input    = $(INPUT_SELECTOR);
        const $textarea = $(TEXTAREA_SELECTOR);

        $textarea.css({
            width:  '250px',
            height: '150px'
        });

        setSelection($input, 0, 0);
        setSelection($textarea, 0, 0);

        $input[0].scrollLeft   = 0;
        $textarea[0].scrollTop = 0;

        document.body.focus();
    }

    function bindHandlers () {
        const input    = $(INPUT_SELECTOR)[0];
        const textarea = $(TEXTAREA_SELECTOR)[0];

        input[startSelectEvent] = function () {
            mousedownOnInput = true;
        };

        input[endSelectEvent] = function () {
            mouseupOnInput = true;
        };

        textarea[startSelectEvent] = function () {
            mousedownOnTextarea = true;
        };

        textarea[endSelectEvent] = function () {
            mouseupOnTextarea = true;
        };
    }

    function unbindHandlers () {
        const input    = $(INPUT_SELECTOR)[0];
        const textarea = $(TEXTAREA_SELECTOR)[0];

        mousedownOnInput    = false;
        mouseupOnInput      = false;
        mousedownOnTextarea = false;
        mouseupOnTextarea   = false;

        input[startSelectEvent] = function () {
        };

        input[endSelectEvent] = function () {
        };

        textarea[startSelectEvent] = function () {
        };

        textarea[endSelectEvent] = function () {
        };
    }

    function runAsyncTest (actions, assertions, timeout) {
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
        }, timeout + 5000);
    }

    $('body').css('height', '1500px');

    //NOTE: problem with window.top bodyMargin in IE9 if test 'runAll'
    //because we can't determine that element is in qunit test iframe
    if (browserUtils.isIE9)
        $(window.top.document).find('body').css('marginTop', '0px');

    //tests
    QUnit.testStart(function () {
        asyncActionCallback = function () {
        };

        actionTargetWaitingCounter = 0;
        actionRunCounter           = 0;

        restorePageState();
        bindHandlers();
    });

    QUnit.testDone(function () {
        currentErrorType   = null;
        currentSourceIndex = null;

        SETTINGS.ENABLE_SOURCE_INDEX = false;

        setValueToInput(INPUT_INITIAL_VALUE);
        setValueToTextarea('');

        unbindHandlers();
    });

    asyncTest('different arguments. not texteditable and contexteditable element', function () {
        const $div = $(DIV_ELEMENT_SELECTOR);

        let mousedown = false;
        let mouseup   = false;

        runAsyncTest(
            function () {
                $div[0][startSelectEvent] = function () {
                    mousedown = true;
                };

                $div[0][endSelectEvent] = function () {
                    mouseup = true;
                };

                actionsAPI.select($div, 1, 2, 3, 4);
            },
            function () {
                ok(mousedown, 'select started from div element');
                ok(mouseup, 'select ended on div element');

                deepEqual(document.activeElement, $div[0]);

                $div.remove();
            },
            correctTestWaitingTime(4000)
        );
    });

    module('different arguments tests. element is input');

    asyncTest('only dom element as a parameter', function () {
        const $input = $(INPUT_SELECTOR);

        runAsyncTest(
            function () {
                actionsAPI.select($input);
            },
            function () {
                ok(mousedownOnInput, 'select started from input');
                ok(mouseupOnInput, 'select ended on input');

                checkSelection($input[0], 0, $input[0].value.length);

                equal(actionTargetWaitingCounter, 1);
                equal(actionRunCounter, 1);
            },
            correctTestWaitingTime(4000)
        );
    });

    asyncTest('positive offset as a parameters', function () {
        const $input = $(INPUT_SELECTOR);

        runAsyncTest(
            function () {
                actionsAPI.select($input, 5);
            },
            function () {
                ok(mousedownOnInput, 'select started from input');
                ok(mouseupOnInput, 'select ended on input');

                checkSelection($input[0], 0, 5);
            },
            correctTestWaitingTime(2000)
        );
    });

    asyncTest('and negative offset as a parameters', function () {
        const $input      = $(INPUT_SELECTOR);
        const valueLength = $input[0].value.length;

        runAsyncTest(
            function () {
                actionsAPI.select($input, -5);
            },
            function () {
                ok(mousedownOnInput, 'select started from input');
                ok(mouseupOnInput, 'select ended on input');

                checkSelection($input[0], valueLength - 5, valueLength, true);
            },
            correctTestWaitingTime(2000)
        );
    });

    asyncTest('zero offset as a parameters', function () {
        const $input = $(INPUT_SELECTOR);

        runAsyncTest(
            function () {
                actionsAPI.select($input, 0);
            },
            function () {
                ok(mousedownOnInput, 'select started from input');
                ok(mouseupOnInput, 'select ended on input');

                checkSelection($input[0], 0, 0);
            },
            correctTestWaitingTime(2000)
        );
    });

    asyncTest('startPos less than endPos as a parameters', function () {
        const $input = $(INPUT_SELECTOR);

        runAsyncTest(
            function () {
                actionsAPI.select($input, 2, 4);
            },
            function () {
                ok(mousedownOnInput, 'select started from input');
                ok(mouseupOnInput, 'select ended on input');

                checkSelection($input[0], 2, 4);
            },
            correctTestWaitingTime(2000)
        );
    });

    asyncTest('startPos more than endPos as a parameters', function () {
        const $input = $(INPUT_SELECTOR);

        runAsyncTest(
            function () {
                actionsAPI.select($input, 4, 2);
            },
            function () {
                ok(mousedownOnInput, 'select started from input');
                ok(mouseupOnInput, 'select ended on input');

                checkSelection($input[0], 2, 4, true);
            },
            correctTestWaitingTime(4000)
        );
    });

    asyncTest('startLine, startPos, endLine, endPos as a parameters', function () {
        const $input = $(INPUT_SELECTOR);

        runAsyncTest(
            function () {
                actionsAPI.select($input, 2, 15, 7, 15);
            },
            function () {
                ok(mousedownOnInput, 'select started from input');
                ok(mouseupOnInput, 'select ended on input');

                checkSelection($input[0], 2, $input[0].value.length);
            },
            correctTestWaitingTime(2000)
        );
    });

    module('different arguments tests. element is textarea');

    asyncTest('only dom element as a parameter', function () {
        const $textarea = $(TEXTAREA_SELECTOR);

        runAsyncTest(
            function () {
                setValueToTextarea('123456789abcd\nefjtybllsjaLJS');

                actionsAPI.select($textarea);
            },
            function () {
                ok(mousedownOnTextarea, 'select started from textarea');
                ok(mouseupOnTextarea, 'select ended on textarea');

                checkSelection($textarea[0], 0, $textarea[0].value.length);
            },
            correctTestWaitingTime(2000)
        );
    });

    asyncTest('positive offset as a parameters', function () {
        const $textarea = $(TEXTAREA_SELECTOR);

        runAsyncTest(
            function () {
                setValueToTextarea('123456789abcd\nefjtybllsjaLJS');

                actionsAPI.select($textarea, 5);
            },
            function () {
                ok(mousedownOnTextarea, 'select started from textarea');
                ok(mouseupOnTextarea, 'select ended on textarea');

                checkSelection($textarea[0], 0, 5);
            },
            correctTestWaitingTime(2000)
        );
    });

    asyncTest('negative offset as a parameters', function () {
        const $textarea = $(TEXTAREA_SELECTOR);

        let valueLength = null;

        runAsyncTest(
            function () {
                setValueToTextarea('123456789abcd\nefjtybllsjaLJS');

                valueLength = $textarea[0].value.length;

                actionsAPI.select($textarea, -5);
            },
            function () {
                ok(mousedownOnTextarea, 'select started from textarea');
                ok(mouseupOnTextarea, 'select ended on textarea');

                checkSelection($textarea[0], valueLength - 5, valueLength, true);
            },
            correctTestWaitingTime(2000)
        );
    });

    asyncTest('startPos less than endPos as a parameters', function () {
        const $textarea = $(TEXTAREA_SELECTOR);

        runAsyncTest(
            function () {
                setValueToTextarea('123456789abcd\nefjtybllsjaLJS\nqwerty test cafe');

                actionsAPI.select($textarea, 3, 20);
            },
            function () {
                ok(mousedownOnTextarea, 'select started from textarea');
                ok(mouseupOnTextarea, 'select ended on textarea');

                checkSelection($textarea[0], 3, 20);
            },
            correctTestWaitingTime(2000)
        );
    });

    asyncTest('startPos more than endPos as a parameters', function () {
        const $textarea = $(TEXTAREA_SELECTOR);

        runAsyncTest(
            function () {
                setValueToTextarea('123456789abcd\nefjtybllsjaLJS\nqwerty test cafe');

                actionsAPI.select($textarea, 20, 3);
            },
            function () {
                ok(mousedownOnTextarea, 'select started from textarea');
                ok(mouseupOnTextarea, 'select ended on textarea');

                checkSelection($textarea[0], 3, 20, true);
            },
            correctTestWaitingTime(4000)
        );
    });

    asyncTest('startLine, startPos less than endLine, endPos as a parameters', function () {
        const $textarea = $(TEXTAREA_SELECTOR);

        let startPosition = null;
        let endPosition   = null;

        runAsyncTest(
            function () {
                setValueToTextarea('123456789abcd\nefjtybllsjaLJS\nqwerty test cafe');

                actionsAPI.select($textarea, 0, 3, 2, 7);
            },
            function () {
                ok(mousedownOnTextarea, 'select started from textarea');
                ok(mouseupOnTextarea, 'select ended on textarea');

                startPosition = domUtils.getTextareaPositionByLineAndOffset($textarea[0], 0, 3);
                endPosition   = domUtils.getTextareaPositionByLineAndOffset($textarea[0], 2, 7);

                checkSelection($textarea[0], startPosition, endPosition);
            },
            correctTestWaitingTime(2000)
        );
    });

    asyncTest('startLine, startPos more than endLine, endPos as a parameters', function () {
        const $textarea = $(TEXTAREA_SELECTOR);

        let startPosition = null;
        let endPosition   = null;

        runAsyncTest(
            function () {
                setValueToTextarea('123456789abcd\nefjtybllsjaLJS\nqwerty test cafe');

                actionsAPI.select($textarea, 2, 7, 0, 3);
            },
            function () {
                ok(mousedownOnTextarea, 'select started from textarea');
                ok(mouseupOnTextarea, 'select ended on textarea');

                startPosition = domUtils.getTextareaPositionByLineAndOffset($textarea[0], 0, 3);
                endPosition   = domUtils.getTextareaPositionByLineAndOffset($textarea[0], 2, 7);

                checkSelection($textarea[0], startPosition, endPosition, true);
            },
            correctTestWaitingTime(2000)
        );
    });

    asyncTest('startLine, startPos equal endLine, endPos as a parameters', function () {
        const $textarea = $(TEXTAREA_SELECTOR);

        let selectPosition = null;

        runAsyncTest(
            function () {
                setValueToTextarea('123456789abcd\nefjtybllsjaLJS\nqwerty test cafe');

                actionsAPI.select($textarea, 2, 7, 2, 7);
            },
            function () {
                ok(mousedownOnTextarea, 'select started from textarea');
                ok(mouseupOnTextarea, 'select ended on textarea');

                selectPosition = domUtils.getTextareaPositionByLineAndOffset($textarea[0], 2, 7);

                checkSelection($textarea[0], selectPosition, selectPosition);
            },
            correctTestWaitingTime(2000)
        );
    });

    asyncTest('startLine, startPos and endLine as a parameters', function () {
        const $textarea     = $(TEXTAREA_SELECTOR);
        const textareaValue = '123456789abcd\nefj\nqwerty test cafe';

        let startPosition = null;

        runAsyncTest(
            function () {
                setValueToTextarea(textareaValue);

                actionsAPI.select($textarea, 1, 8, 2);
            },
            function () {
                ok(mousedownOnTextarea, 'select started from textarea');
                ok(mouseupOnTextarea, 'select ended on textarea');

                startPosition = domUtils.getTextareaPositionByLineAndOffset($textarea[0], 1, Math.min(8, textareaValue.split('\n')[1].length));

                checkSelection($textarea[0], startPosition, textareaValue.length);
            },
            correctTestWaitingTime(2000)
        );
    });

    module('incorrect parameters');

    asyncTest('not a number offset raise error', function () {
        const $input = $(INPUT_SELECTOR);

        SETTINGS.ENABLE_SOURCE_INDEX = true;

        actionsAPI.select($input, 'abc', '#34');

        window.setTimeout(function () {
            equal(currentErrorType, ERROR_TYPE.incorrectSelectActionArguments, 'correct error type sent');
            equal(currentSourceIndex, 34);

            start();
        }, correctTestWaitingTime(500));
    });

    asyncTest('negative endPos raise error', function () {
        const $input = $(INPUT_SELECTOR);

        SETTINGS.ENABLE_SOURCE_INDEX = true;

        actionsAPI.select($input, 2, -4, '#12');

        window.setTimeout(function () {
            equal(currentErrorType, ERROR_TYPE.incorrectSelectActionArguments, 'correct error type sent');
            equal(currentSourceIndex, 12);

            start();
        }, correctTestWaitingTime(500));
    });

    asyncTest('negative endLine raise error', function () {
        const $textarea = $(TEXTAREA_SELECTOR);

        SETTINGS.ENABLE_SOURCE_INDEX = true;

        actionsAPI.select($textarea, 2, 4, -2, 5, '#56');

        window.setTimeout(function () {
            equal(currentErrorType, ERROR_TYPE.incorrectSelectActionArguments, 'correct error type sent');
            equal(currentSourceIndex, 56);

            start();
        }, correctTestWaitingTime(500));
    });
});
