const hammerhead       = window.getTestCafeModule('hammerhead');
const browserUtils     = hammerhead.utils.browser;
const featureDetection = hammerhead.utils.featureDetection;

const testCafeCore  = window.getTestCafeModule('testCafeCore');
const domUtils      = testCafeCore.get('./utils/dom');
const textSelection = testCafeCore.get('./utils/text-selection');

const testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
const ERROR_TYPE           = testCafeLegacyRunner.get('../test-run-error/type');
const actionsAPI           = testCafeLegacyRunner.get('./api/actions');
const StepIterator         = testCafeLegacyRunner.get('./step-iterator');
const initAutomation       = testCafeLegacyRunner.get('./init-automation');

actionsAPI.ELEMENT_AVAILABILITY_WAITING_TIMEOUT = 400;

const WAITING_TIMEOUT               = 3500;
const TEST_COMPLETE_WAITING_TIMEOUT = featureDetection.isTouchDevice ? WAITING_TIMEOUT * 2 : WAITING_TIMEOUT;
const ERROR_WAITING_TIMEOUT         = actionsAPI.ELEMENT_AVAILABILITY_WAITING_TIMEOUT + 50;

const stepIterator = new StepIterator();

initAutomation();
actionsAPI.init(stepIterator);

const correctTestWaitingTime = function (time) {
    if (featureDetection.isTouchDevice && browserUtils.isFirefox)
        return time * 2;

    return time;
};


$(document).ready(function () {
    let $el     = null;
    let $parent = null;

    let firstElementInnerHTML   = null;
    let secondElementInnerHTML  = null;
    let thirdElementInnerHTML   = null;
    let fourthElementInnerHTML  = null;
    let fifthElementInnerHTML   = null;
    let sixthElementInnerHTML   = null;
    let seventhElementInnerHTML = null;

    let currentErrorType = null;

    //utils
    let asyncActionCallback;

    const startNext = function () {
        window.setTimeout(start, 30);
    };

    const runAsyncTest = function (actions, assertions, timeout) {
        let timeoutId        = null;
        let callbackFunction = function () {
            clearTimeout(timeoutId);
            assertions();
            startNext();
        };

        asyncActionCallback = function () {
            callbackFunction();
        };
        actions();

        timeoutId = setTimeout(function () {
            callbackFunction = function () {
            };
            ok(false, 'Timeout is exceeded');
            startNext();
        }, timeout);
    };

    function checkOffsetsArray (actualOffset, offsets) {
        for (let i = 0; i < offsets.length; i++) {
            if (actualOffset === offsets[i])
                return true;
        }

        return false;
    }

    const checkSelection = function ($element, startNode, startOffsets, endNode, endOffsets) {
        const curDocument = domUtils.findDocument($element[0]);
        const selection   = curDocument.getSelection();

        equal(domUtils.getActiveElement(), $element[0]);
        ok(domUtils.isTheSameNode(startNode, selection.anchorNode), 'startNode correct');

        if (startOffsets.length)
            ok(checkOffsetsArray(selection.anchorOffset, startOffsets), 'startOffset correct');
        else
            equal(selection.anchorOffset, startOffsets, 'startOffset correct');

        ok(domUtils.isTheSameNode(endNode, selection.focusNode), 'endNode correct');

        if (endOffsets.length)
            ok(checkOffsetsArray(selection.focusOffset, endOffsets), 'endOffset correct');
        else
            equal(selection.focusOffset, endOffsets, 'endOffset correct');
    };

    const setInnerHTML = function ($element, innerHTML) {
        window.setProperty($element[0], 'innerHTML', innerHTML);
    };

    const stateHelper = {
        isStateSaved: function () {
            return firstElementInnerHTML;
        },

        saveState: function () {
            firstElementInnerHTML   = $('#1')[0].innerHTML;
            secondElementInnerHTML  = $('#2')[0].innerHTML;
            thirdElementInnerHTML   = $('#3')[0].innerHTML;
            fourthElementInnerHTML  = $('#4')[0].innerHTML;
            fifthElementInnerHTML   = $('#5')[0].innerHTML;
            sixthElementInnerHTML   = $('#6')[0].innerHTML;
            seventhElementInnerHTML = $('#7')[0].innerHTML;
        },

        restoreState: function () {
            const curActiveElement = domUtils.getActiveElement();
            const selection        = document.getSelection();

            if (firstElementInnerHTML) {
                setInnerHTML($('#1'), firstElementInnerHTML);
                setInnerHTML($('#2'), secondElementInnerHTML);
                setInnerHTML($('#3'), thirdElementInnerHTML);
                setInnerHTML($('#4'), fourthElementInnerHTML);
                setInnerHTML($('#5'), fifthElementInnerHTML);
                setInnerHTML($('#6'), sixthElementInnerHTML);
                setInnerHTML($('#7'), seventhElementInnerHTML);
            }
            if (curActiveElement !== document.body) {
                $(curActiveElement).blur();
                selection.removeAllRanges();
                document.body.focus();
            }
        },
    };

    StepIterator.prototype.asyncActionSeries = function (items, runArgumentsIterator, action) {
        const seriesActionsRun = function (elements, callback) {
            async.forEachSeries(
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

    stepIterator.on(StepIterator.ERROR_EVENT, function (err) {
        stepIterator.state.stoppedOnFail = false;
        currentErrorType                 = err.type;
    });


    $('<div></div>').css({ width: 1, height: 1500, position: 'absolute' }).appendTo('body');
    $('body').css('height', '1500px');

    //tests
    QUnit.testStart(function () {
        //before first test save page state
        if (!stateHelper.isStateSaved())
            stateHelper.saveState();
        asyncActionCallback = function () {
        };
    });

    QUnit.testDone(function () {
        if ($el) {
            $el[0].onmousedown = function () {
            };
            $el[0].onclick     = function () {
            };
        }
        $el     = null;
        $parent = null;
        stateHelper.restoreState();
        currentErrorType = null;
    });

    module('act.select api');

    asyncTest('without args', function () {
        $el = $('#2');

        runAsyncTest(
            function () {
                actionsAPI.select($el[0]);
            },
            function () {
                checkSelection($el, $el[0].childNodes[0], 0, $el[0].childNodes[2], [8, 7]);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT * 2)
        );
    });

    asyncTest('positive offset', function () {
        $el = $('#2');

        runAsyncTest(
            function () {
                actionsAPI.select($el[0], 19);
            },
            function () {
                checkSelection($el, $el[0].childNodes[0], 0, $el[0].childNodes[2], 4);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('negative offset', function () {
        $el = $('#2');

        runAsyncTest(
            function () {
                actionsAPI.select($el[0], -11);
            },
            function () {
                checkSelection($el, $el[0].childNodes[2], [8, 7], $el[0].childNodes[0], 12);
                equal(textSelection.hasInverseSelection($el[0]), true, 'selection direction correct');
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('zero offset', function () {
        $el = $('#3');

        runAsyncTest(
            function () {
                actionsAPI.select($el[0], 0);
            },
            function () {
                checkSelection($el, $el[0].childNodes[0], 0, $el[0].childNodes[0], 0);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    //startPos less than endPos as a parameters ===  simple select
    //startPos more than endPos as a parameters === simple inverse select

    asyncTest('startPos, endPos, startLine and endLine', function () {
        $el = $('#4');

        runAsyncTest(
            function () {
                actionsAPI.select($el[0], 15, 210, 16, 45);
            },
            function () {
                checkSelection($el, $el[0].childNodes[1].childNodes[0], 10, $el[0].childNodes[10].childNodes[0], 4);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('selection from first to last symbol in element', function () {
        $parent = $('#6');
        $el     = $parent.find('div:first');

        runAsyncTest(
            function () {
                actionsAPI.select($el[0], 0, 1);
            },
            function () {
                checkSelection($parent, $parent[0].childNodes[1].childNodes[0], 0, $parent[0].childNodes[1].childNodes[0], 1);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT + 5000000000)
        );
    });

    asyncTest('startNode and endNode', function () {
        $parent   = $('#2');
        const node1 = $parent[0].childNodes[0];
        const node2 = $parent[0].childNodes[2];

        runAsyncTest(
            function () {
                actionsAPI.select(node1, node2);
            },
            function () {
                checkSelection($parent, node1, 0, node2, [8, 7]);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('startNode equal endNode', function () {
        $parent  = $('#2');
        const node = $parent[0].childNodes[0];

        runAsyncTest(
            function () {
                actionsAPI.select(node, node);
            },
            function () {
                checkSelection($parent, node, 0, node, node.length);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('startElement and endElement', function () {
        $parent = $('#4');
        const el1 = $parent[0].childNodes[3];
        const el2 = $parent[0].childNodes[5];

        runAsyncTest(
            function () {
                actionsAPI.select(el1, el2);
            },
            function () {
                checkSelection($parent, $parent[0].childNodes[3].childNodes[0], 0, $parent[0].childNodes[5].childNodes[6].childNodes[0], 4);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('startNode and endElement', function () {
        $parent  = $('#4');
        const node = $parent[0].childNodes[5].childNodes[0];
        const el   = $parent[0].childNodes[5].childNodes[4];

        runAsyncTest(
            function () {
                actionsAPI.select(node, el);
            },
            function () {
                checkSelection($parent, $parent[0].childNodes[5].childNodes[0], 0, $parent[0].childNodes[5].childNodes[4].childNodes[0], 3);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('startElement and endNode', function () {
        $parent  = $('#6');
        const el   = $parent[0].childNodes[1];
        const node = $parent[0].childNodes[8];

        runAsyncTest(
            function () {
                actionsAPI.select(el, node);
            },
            function () {
                checkSelection($parent, $parent[0].childNodes[1].childNodes[0], 0, $parent[0].childNodes[8], [13, 9]);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('inverse startNode and endElement', function () {
        $parent  = $('#6');
        const el   = $parent[0].childNodes[1];
        const node = $parent[0].childNodes[8];

        runAsyncTest(
            function () {
                actionsAPI.select(node, el);
            },
            function () {
                checkSelection($parent, $parent[0].childNodes[8], [13, 9], $parent[0].childNodes[1].childNodes[0], 0);
                equal(textSelection.hasInverseSelection($parent[0]), true, 'selection direction correct');
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('startNode and $endElement', function () {
        $parent  = $('#5');
        const node = $parent[0].childNodes[2];

        runAsyncTest(
            function () {
                actionsAPI.select(node, $parent.find('i'));
            },
            function () {
                checkSelection($parent, $parent[0].childNodes[2], 0, $parent[0].childNodes[3].childNodes[1].childNodes[0], 9);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('startElement and $endElement', function () {
        $parent  = $('#7');
        const el1  = $parent.find('div')[3];
        const $el2 = $parent.find('div').eq(4);

        runAsyncTest(
            function () {
                actionsAPI.select(el1, $el2);
            },
            function () {
                checkSelection($parent, $parent.find('div')[3].childNodes[0], 0, $parent.find('div')[4].childNodes[0], 3);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('$startElement and $endElement', function () {
        $parent  = $('#7');
        const $el1 = $parent.find('del:first');
        const $el2 = $parent.find('a:last');

        runAsyncTest(
            function () {
                actionsAPI.select($el1, $el2);
            },
            function () {
                checkSelection($parent, $parent.find('del')[0].childNodes[0], [0, 9], $parent.find('a')[1].childNodes[0], 4);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('inverse $startElement and $endElement', function () {
        $parent  = $('#7');
        const $el1 = $parent.find('a:last');
        const $el2 = $parent.find('del:first');

        runAsyncTest(
            function () {
                actionsAPI.select($el1, $el2);
            },
            function () {
                checkSelection($parent, $parent.find('a')[1].childNodes[0], 4, $parent.find('del')[0].childNodes[0], [0, 9]);
                equal(textSelection.hasInverseSelection($parent[0]), true, 'selection direction correct');
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    module('shortcuts');

    asyncTest('invisible second element raise error', function () {
        asyncActionCallback = function () {
        };

        const $el1 = $('#4>p').first();
        const $el2 = $('#4>p').last();

        $el2.css('display', 'none');

        actionsAPI.select($el1[0], $el2[0]);
        window.setTimeout(function () {
            equal(currentErrorType, ERROR_TYPE.incorrectSelectActionArguments, 'correct error type sent');
            start();
        }, correctTestWaitingTime(ERROR_WAITING_TIMEOUT));
    });

    asyncTest('element isn\'t content editable raise error', function () {
        asyncActionCallback = function () {
        };
        $parent             = $('#4');
        const $el1            = $('#4>p').first();
        const $el2            = $('#4>p').last();

        $parent[0].removeAttribute('contenteditable');

        actionsAPI.select($el1[0], $el2[0]);
        window.setTimeout(function () {
            equal(currentErrorType, ERROR_TYPE.incorrectSelectActionArguments, 'correct error type sent');
            start();
        }, correctTestWaitingTime(ERROR_WAITING_TIMEOUT));
    });

    asyncTest('elements, which don\'t have common ancestor raise error', function () {
        asyncActionCallback = function () {
        };
        const $el1            = $('#1>p');
        const $el2            = $('#4>p').last();

        actionsAPI.select($el1[0], $el2[0]);
        window.setTimeout(function () {
            equal(currentErrorType, ERROR_TYPE.incorrectSelectActionArguments, 'correct error type sent');
            start();
        }, correctTestWaitingTime(ERROR_WAITING_TIMEOUT));
    });

    asyncTest('for all action except select we cann\'t send text node like the first parameter', function () {
        asyncActionCallback = function () {
        };

        const node = $('#2')[0].childNodes[0];
        const text = 'test';

        actionsAPI.type(node, text, {
            caretPos: 1,
        });
        window.setTimeout(function () {
            equal(currentErrorType, ERROR_TYPE.emptyFirstArgument, 'correct error type sent');
            start();
        }, correctTestWaitingTime(ERROR_WAITING_TIMEOUT));
    });
});
