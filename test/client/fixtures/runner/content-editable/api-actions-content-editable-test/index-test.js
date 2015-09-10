var hammerhead = window.getTestCafeModule('hammerhead');
var browser    = hammerhead.Util.Browser;

var testCafeCore  = window.getTestCafeModule('testCafeCore');
var ERROR_TYPE    = testCafeCore.ERROR_TYPE;
var DOM           = testCafeCore.get('./util/dom');
var textSelection = testCafeCore.get('./util/text-selection');
var position      = testCafeCore.get('./util/position');

var testCafeRunner = window.getTestCafeModule('testCafeRunner');
var automation     = testCafeRunner.get('./automation/automation');
var actionsAPI     = testCafeRunner.get('./api/actions');
var StepIterator   = testCafeRunner.get('./step-iterator');

var testCafeUI = window.getTestCafeModule('testCafeUI');
var cursor     = testCafeUI.get('./cursor');

actionsAPI.ELEMENT_AVAILABILITY_WAITING_TIMEOUT = 400;

var TEST_COMPLETE_WAITING_TIMEOUT = 3500;
var ERROR_WAITING_TIMEOUT         = actionsAPI.ELEMENT_AVAILABILITY_WAITING_TIMEOUT + 50;


var stepIterator = new StepIterator();
automation.init();
actionsAPI.init(stepIterator);
cursor.init();

var correctTestWaitingTime = function (time) {
    if (browser.isTouchDevice && browser.isMozilla)
        return time * 2;

    return time;
};


$(document).ready(function () {
    StepIterator.prototype.asyncActionSeries = function (items, runArgumentsIterator, action) {
        var seriesActionsRun = function (elements, callback) {
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
        currentErrorCode                 = err.code;

        if (err.element)
            currentErrorElement = err.element;
    });

    var $el                           = null,
        $parent                       = null,

        firstElementInnerHTML         = null,
        secondElementInnerHTML        = null,
        thirdElementInnerHTML         = null,
        fourthElementInnerHTML        = null,
        fifthElementInnerHTML         = null,
        sixthElementInnerHTML         = null,
        seventhElementInnerHTML       = null,

        currentErrorCode              = null,
        currentErrorElement           = null,
        //constants
        TEST_ELEMENT_CLASS            = 'testElement',

        //utils
        asyncActionCallback,

        runAsyncTest                  = function (actions, assertions, timeout) {
            var callbackFunction = function () {
                clearTimeout(timeoutId);
                assertions();
                startNext();
            };
            asyncActionCallback  = function () {
                callbackFunction();
            };
            actions();
            var timeoutId        = setTimeout(function () {
                callbackFunction = function () {
                };
                ok(false, 'Timeout is exceeded');
                startNext();
            }, timeout);
        },

        startNext                     = function () {
            if (browser.isIE) {
                removeTestElements();
                window.setTimeout(start, 30);
            }
            else
                start();
        },

        removeTestElements            = function () {
            $('.' + TEST_ELEMENT_CLASS).remove();
        },

        firstNotWhiteSpaceSymbolIndex = function (value) {
            var start = 0;
            for (var i = 0; i < value.length; i++) {
                if (value.charCodeAt(i) === 10 || value.charCodeAt(i) === 32) start++;
                else break;
            }
            return start;
        },

        checkSelection                = function ($el, startNode, startOffset, endNode, endOffset) {
            var curDocument = DOM.findDocument($el[0]),
                selection   = curDocument.getSelection();
            equal(DOM.getActiveElement(), $el[0]);
            ok(DOM.isTheSameNode(startNode, selection.anchorNode), 'startNode correct');
            equal(selection.anchorOffset, startOffset, 'startOffset correct');
            ok(DOM.isTheSameNode(endNode, selection.focusNode), 'endNode correct');
            equal(selection.focusOffset, endOffset, 'endOffset correct');
        },

        setInnerHTML                  = function ($el, innerHTML) {
            window.setProperty($el[0], 'innerHTML', innerHTML);
        },

        stateHelper                   = {
            isStateSaved: function () {
                return firstElementInnerHTML;
            },
            saveState:    function () {
                firstElementInnerHTML   = $('#1')[0].innerHTML;
                secondElementInnerHTML  = $('#2')[0].innerHTML;
                thirdElementInnerHTML   = $('#3')[0].innerHTML;
                fourthElementInnerHTML  = $('#4')[0].innerHTML;
                fifthElementInnerHTML   = $('#5')[0].innerHTML;
                sixthElementInnerHTML   = $('#6')[0].innerHTML;
                seventhElementInnerHTML = $('#7')[0].innerHTML;
            },
            restoreState: function () {
                var curActiveElement = DOM.getActiveElement(),
                    curDocument      = DOM.findDocument(curActiveElement),
                    selection        = curDocument.getSelection();
                if (firstElementInnerHTML) {
                    setInnerHTML($('#1'), firstElementInnerHTML);
                    setInnerHTML($('#2'), secondElementInnerHTML);
                    setInnerHTML($('#3'), thirdElementInnerHTML);
                    setInnerHTML($('#4'), fourthElementInnerHTML);
                    setInnerHTML($('#5'), fifthElementInnerHTML);
                    setInnerHTML($('#6'), sixthElementInnerHTML);
                    setInnerHTML($('#7'), seventhElementInnerHTML);
                }
                if (curActiveElement !== $(curDocument).find('body')) {
                    $(curDocument).find('body').focus();
                    $(curActiveElement).blur();
                    selection.removeAllRanges();
                }
            }
        };

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
        if (!browser.isIE)
            removeTestElements();
        currentErrorCode    = null;
        currentErrorElement = null;
    });

    module('act.click');

    asyncTest('simple click', function () {
        var clicked = false;

        $parent = $('#1');
        $el     = $parent.find("p");

        runAsyncTest(
            function () {
                $el[0].onclick     = function () {
                    clicked = true;
                };
                $el[0].onmousedown = function () {
                    deepEqual(cursor.getAbsolutePosition(), position.findCenter($el[0]), 'check cursor position');
                };
                ok(!clicked);
                actionsAPI.click($el[0], {
                    caretPos: 10
                });
            },
            function () {
                ok(clicked, 'click raised');
                checkSelection($parent, $el[0].childNodes[0], 10, $el[0].childNodes[0], 10);
                expect(8);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('click on deep child', function () {
        var clicked = false;

        $parent = $('#4');
        $el     = $parent.find(" > p:nth(1) > i:nth(1)");

        runAsyncTest(
            function () {
                $el[0].onclick     = function () {
                    clicked = true;
                };
                $el[0].onmousedown = function () {
                    deepEqual(cursor.getAbsolutePosition(), position.findCenter($el[0]), 'check cursor position');
                };
                ok(!clicked);
                actionsAPI.click($el[0], {
                    caretPos: 1
                });
            },
            function () {
                ok(clicked, 'click raised');
                checkSelection($parent, $parent[0].childNodes[5].childNodes[3].childNodes[0], 1, $parent[0].childNodes[5].childNodes[3].childNodes[0], 1);
                expect(8);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('click on element with selection', function () {
        var clicked = false;

        $parent = $('#5');
        $el     = $parent.find(" > i:nth(0) > b:nth(0)");

        runAsyncTest(
            function () {
                $el[0].onclick     = function () {
                    clicked = true;
                };
                $el[0].onmousedown = function () {
                    deepEqual(cursor.getAbsolutePosition(), position.findCenter($el[0]), 'check cursor position');
                };
                ok(!clicked);
                textSelection.selectByNodesAndOffsets($parent[0].childNodes[0], 3, $parent[0].childNodes[4], 7, true);
                actionsAPI.click($el[0], {
                    caretPos: 6
                });
            },
            function () {
                ok(clicked, 'click raised');
                checkSelection($parent, $el[0].childNodes[0], 6, $el[0].childNodes[0], 6);
                expect(8);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    module('act.rclick');

    asyncTest('rclick (sets the correct position relative to the parent, not the item under the cursor)', function () {
        var clicked = false;

        $el = $('#4');

        runAsyncTest(
            function () {
                $el.bind('contextmenu', function () {
                    clicked = true;
                });
                ok(!clicked);
                actionsAPI.rclick($el[0], {
                    caretPos: 104
                });
            },
            function () {
                var selectedEl = $el.find('>p:first>i')[0];
                ok(clicked, 'click raised');
                checkSelection($el, selectedEl.childNodes[0], 1, selectedEl.childNodes[0], 1);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    module('act.dblclick');

    asyncTest('dblclick (sets the correct position relative to the parent, not the item under the cursor)', function () {
        var dblclicked = false;

        $el = $('#4');

        runAsyncTest(
            function () {
                $el.bind('dblclick', function () {
                    dblclicked = true;
                });
                ok(!dblclicked);
                actionsAPI.dblclick($el[0], {
                    caretPos: 104
                });
            },
            function () {
                var selectedEl = $el.find('>p:first>i')[0];
                ok(dblclicked, 'click raised');
                checkSelection($el, selectedEl.childNodes[0], 1, selectedEl.childNodes[0], 1);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    module('act.select');

    asyncTest('simple select', function () {
        $parent = $('#1');
        $el     = $parent.find("p");


        runAsyncTest(
            function () {
                actionsAPI.select($el[0], 5, 30);
            },
            function () {
                checkSelection($parent, $el[0].childNodes[0], 5, $el[0].childNodes[0], 30);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('difficult select', function () {
        $el     = $("#4");
        $parent = $el;

        runAsyncTest(
            function () {
                actionsAPI.select($el[0], 15, 151);
            },
            function () {
                checkSelection($parent, $el[0].childNodes[1].childNodes[0], 10, $el[0].childNodes[5].childNodes[4].childNodes[0], 2);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('simple inverse select', function () {
        $el = $("#2");

        runAsyncTest(
            function () {
                window.i = true;
                actionsAPI.select($el[0], 21, 4);
            },
            function () {
                if (browser.isIE)
                    checkSelection($el, $el[0].childNodes[0], 4, $el[0].childNodes[2], 6);
                else {
                    checkSelection($el, $el[0].childNodes[2], 6, $el[0].childNodes[0], 4);
                    equal(textSelection.hasInverseSelection($el[0]), true, 'selection direction correct');
                }
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('difficult inverse select', function () {
        $el = $("#6");

        runAsyncTest(
            function () {
                actionsAPI.select($el[0], 141, 4);
            },
            function () {
                if (browser.isIE)
                    checkSelection($el, $el[0].childNodes[0], 4, $el[0].childNodes[10], 1);
                else {
                    checkSelection($el, $el[0].childNodes[10], 1, $el[0].childNodes[0], 4);
                    equal(textSelection.hasInverseSelection($el[0]), true, 'selection direction correct');
                }
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('select in simple nearest common ancestor', function () {
        $parent = $('#6');
        $el     = $parent.find('i:first');

        runAsyncTest(
            function () {
                actionsAPI.select($el[0], 18, 54);
            },
            function () {
                checkSelection($parent, $parent[0].childNodes[5].childNodes[1].childNodes[0], 14, $parent[0].childNodes[5].childNodes[4].childNodes[0], 3);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    module('act.select api');

    asyncTest('without args', function () {
        $el = $("#2");

        runAsyncTest(
            function () {
                actionsAPI.select($el[0]);
            },
            function () {
                checkSelection($el, $el[0].childNodes[0], 0, $el[0].childNodes[2], browser.isMozilla ||
                                                                                   browser.isIE ? 8 : 7);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('positive offset', function () {
        $el = $("#2");

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
        $el = $("#2");

        runAsyncTest(
            function () {
                actionsAPI.select($el[0], -11);
            },
            function () {
                if (browser.isIE)
                    checkSelection($el, $el[0].childNodes[0], 12, $el[0].childNodes[2], 8);
                else {
                    checkSelection($el, $el[0].childNodes[2], browser.isMozilla ? 8 : 7, $el[0].childNodes[0], 12);
                    equal(textSelection.hasInverseSelection($el[0]), true, 'selection direction correct');
                }
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('zero offset', function () {
        $el = $("#2");

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
        $el = $("#4");

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
        $parent = $("#6");
        $el     = $parent.find("div:first");

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
        $parent   = $("#2");
        var node1 = $parent[0].childNodes[0],
            node2 = $parent[0].childNodes[2];

        runAsyncTest(
            function () {
                actionsAPI.select(node1, node2);
            },
            function () {
                checkSelection($parent, node1, 0, node2, browser.isIE || browser.isMozilla ? 8 : 7);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('startNode equal endNode', function () {
        $parent  = $("#2");
        var node = $parent[0].childNodes[0];

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
        $parent = $("#4");
        var el1 = $parent[0].childNodes[3],
            el2 = $parent[0].childNodes[5];

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
        $parent  = $("#4");
        var node = $parent[0].childNodes[5].childNodes[0],
            el   = $parent[0].childNodes[5].childNodes[4];

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
        $parent  = $("#6");
        var el   = $parent[0].childNodes[1],
            node = $parent[0].childNodes[8];

        runAsyncTest(
            function () {
                actionsAPI.select(el, node);
            },
            function () {
                checkSelection($parent, $parent[0].childNodes[1].childNodes[0], 0, $parent[0].childNodes[8], browser.isIE ||
                                                                                                             browser.isMozilla ? 13 : 9);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('inverse startNode and endElement', function () {
        $parent  = $("#6");
        var el   = $parent[0].childNodes[1],
            node = $parent[0].childNodes[8];

        runAsyncTest(
            function () {
                actionsAPI.select(node, el);
            },
            function () {
                if (browser.isIE)
                    checkSelection($parent, $parent[0].childNodes[1].childNodes[0], 0, $parent[0].childNodes[8], browser.isIE ||
                                                                                                                 browser.isMozilla ? 13 : 9);
                else {
                    checkSelection($parent, $parent[0].childNodes[8], browser.isIE ||
                                                                      browser.isMozilla ? 13 : 9, $parent[0].childNodes[1].childNodes[0], 0);
                    equal(textSelection.hasInverseSelection($parent[0]), true, 'selection direction correct');
                }
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('startNode and $endElement', function () {
        $parent  = $("#5");
        var node = $parent[0].childNodes[2],
            $el  = $parent.find('i');

        runAsyncTest(
            function () {
                actionsAPI.select(node, $el);
            },
            function () {
                checkSelection($parent, $parent[0].childNodes[2], 0, $parent[0].childNodes[3].childNodes[1].childNodes[0], 9);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('startElement and $endElement', function () {
        $parent = $("#7");
        var el1 = $parent.find('div')[3],
            $el = $parent.find('div').eq(4);

        runAsyncTest(
            function () {
                actionsAPI.select(el1, $el);
            },
            function () {
                checkSelection($parent, $parent.find('div')[3].childNodes[0], 0, $parent.find('div')[4].childNodes[0], 3);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('$startElement and $endElement', function () {
        $parent  = $("#7");
        var $el1 = $parent.find('del:first'),
            $el2 = $parent.find('a:last');

        runAsyncTest(
            function () {
                actionsAPI.select($el1, $el2);
            },
            function () {
                checkSelection($parent, $parent.find('del')[0].childNodes[0], browser.isIE ||
                                                                              browser.isMozilla ? 0 : 9, $parent.find('a')[1].childNodes[0], 4);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('inverse $startElement and $endElement', function () {
        $parent  = $("#7");
        var $el1 = $parent.find('a:last'),
            $el2 = $parent.find('del:first');

        runAsyncTest(
            function () {
                actionsAPI.select($el1, $el2);
            },
            function () {
                if (browser.isIE)
                    checkSelection($parent, $parent.find('del')[0].childNodes[0], browser.isIE ||
                                                                                  browser.isMozilla ? 0 : 9, $parent.find('a')[1].childNodes[0], 4);
                else {
                    checkSelection($parent, $parent.find('a')[1].childNodes[0], 4, $parent.find('del')[0].childNodes[0], browser.isIE ||
                                                                                                                         browser.isMozilla ? 0 : 9);
                    equal(textSelection.hasInverseSelection($parent[0]), true, 'selection direction correct');
                }
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    module('shortcuts');

    asyncTest('select all', function () {
        var oldInnerHTML = null;
        runAsyncTest(
            function () {
                $el          = $('#4');
                oldInnerHTML = $el[0].innerHTML;
                $el.focus();
                actionsAPI.press('ctrl+a');
            },
            function () {
                checkSelection($el, $el[0].childNodes[1].childNodes[0], 9, $el[0].childNodes[10].childNodes[0], 4);
                equal($el[0].innerHTML, oldInnerHTML, 'text isn\'t change');
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('select and delete', function () {
        var oldNodeValue = null;
        runAsyncTest(
            function () {
                $el          = $('#4');
                oldNodeValue = $el[0].childNodes[1].childNodes[2].nodeValue;
                textSelection.selectByNodesAndOffsets($el[0].childNodes[1].childNodes[2], 11, $el[0].childNodes[10].childNodes[0], 3, true);
                equal($el[0].childNodes[1].childNodes[2].nodeValue, oldNodeValue, 'nodeValue is correct');
                actionsAPI.press('delete');
            },
            function () {
                //we can't check selection position because it's different in different browsers
                equal($el[0].childNodes[1].childNodes[2].nodeValue, oldNodeValue.substring(0, 11), 'nodeValue is correct');
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('select and backspace', function () {
        var element        = null,
            oldElementText = null;
        runAsyncTest(
            function () {
                $parent        = $('#6');
                $el            = $parent.find('i:first');
                element        = $parent[0].childNodes[5].childNodes[1];
                oldElementText = $(element).text();
                textSelection.selectByNodesAndOffsets($parent[0].childNodes[5].childNodes[1].childNodes[0], 0, $parent[0].childNodes[5].childNodes[1].childNodes[0], 17, true);
                window.setTimeout(function () {
                    equal($(element).text(), oldElementText, 'nodeValue is correct');
                    actionsAPI.press('backspace');
                }, 1000)
            },
            function () {
                //we can't check selection position because it's different in different browsers
                notEqual($(element).text(), oldElementText, 'oldValue isn\'t the same');
                equal($.trim($(element).text()), 'b el', 'nodeValue is correct');
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('select and left', function () {
        var startNode   = null,
            startOffset = null,
            endNode     = null,
            endOffset   = null;
        runAsyncTest(
            function () {
                $el         = $('#4');
                startNode   = $el[0].childNodes[1].childNodes[2];
                startOffset = 11;
                endNode     = $el[0].childNodes[10].childNodes[0];
                endOffset   = 3;
                textSelection.selectByNodesAndOffsets(startNode, startOffset, endNode, endOffset, true);
                checkSelection($el, startNode, startOffset, endNode, endOffset);
                actionsAPI.press('left');
            },
            function () {
                checkSelection($el, startNode, startOffset, startNode, startOffset);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('select and right', function () {
        var startNode   = null,
            startOffset = null,
            endNode     = null,
            endOffset   = null;
        runAsyncTest(
            function () {
                $el         = $('#4');
                startNode   = $el[0].childNodes[1].childNodes[2];
                startOffset = 11;
                endNode     = $el[0].childNodes[10].childNodes[0];
                endOffset   = 3;
                textSelection.selectByNodesAndOffsets(startNode, startOffset, endNode, endOffset, true);
                checkSelection($el, startNode, startOffset, endNode, endOffset);
                actionsAPI.press('right');
            },
            function () {
                checkSelection($el, endNode, endOffset, endNode, endOffset);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    module('act.type');

    asyncTest('simple type', function () {
        var text      = "Test me all!",
            fixedText = "Test" + String.fromCharCode(160) + "me" + String.fromCharCode(160) + "all!";

        $el = $("#2");

        runAsyncTest(
            function () {
                actionsAPI.type($el[0], text, {
                    caretPos: 19
                });
            },
            function () {
                checkSelection($el, $el[0].childNodes[2], 4 + text.length, $el[0].childNodes[2], 4 + text.length);
                equal($.trim($el[0].childNodes[2].nodeValue), "with" + fixedText + " br");
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('simple type in deep child', function () {
        var text = "ABC";

        $parent = $("#6");
        $el     = $parent.find(" > i:nth(0) > b:nth(1)");

        runAsyncTest(
            function () {
                actionsAPI.type($el[0], text, {
                    caretPos: 2
                });
            },
            function () {
                checkSelection($parent, $el[0].childNodes[0], 2 + text.length, $el[0].childNodes[0], 2 + text.length);
                equal($.trim($el[0].childNodes[0].nodeValue), "boABCld");
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('type in element with simple selection', function () {
        var text      = "Test me all!",
            fixedText = "Test" + String.fromCharCode(160) + "me" + String.fromCharCode(160) + "all!";

        $el = $("#2");

        runAsyncTest(
            function () {
                textSelection.selectByNodesAndOffsets($el[0].childNodes[0], 3, $el[0].childNodes[2], 7);
                actionsAPI.type($el[0], text, {
                    caretPos: 21
                });
            },
            function () {
                checkSelection($el, $el[0].childNodes[2], 6 + text.length, $el[0].childNodes[2], 6 + text.length);
                equal($.trim($el[0].childNodes[2].nodeValue), "with b" + fixedText + "r");
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('type in element with big selection', function () {
        $parent = $("#4");
        $el     = $parent.find("p:nth(1)>i:nth(1)");

        var text            = "Test me all!",
            fixedText       = "Test" + String.fromCharCode(160) + "me" + String.fromCharCode(160) + "all!",
            olsElementValue = $el[0].childNodes[0].nodeValue;

        runAsyncTest(
            function () {
                textSelection.selectByNodesAndOffsets($parent[0].childNodes[1].childNodes[4], 11, $parent[0].childNodes[5].childNodes[6].childNodes[0], 2);
                actionsAPI.type($el[0], text, {
                    caretPos: 2
                });
            },
            function () {
                checkSelection($parent, $el[0].childNodes[0], 2 + text.length, $el[0].childNodes[0], 2 + text.length);
                equal($el[0].childNodes[0].nodeValue, olsElementValue + fixedText);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('type and replace text in simple element', function () {
        var text      = "Test me all!",
            fixedText = "Test" + String.fromCharCode(160) + "me" + String.fromCharCode(160) + "all!";

        $el = $("#2");

        runAsyncTest(
            function () {
                actionsAPI.type($el[0], text, {
                    replace: true
                });
            },
            function () {
                checkSelection($el, $el[0].childNodes[0], text.length, $el[0].childNodes[0], text.length);
                equal($.trim($el.text()), fixedText);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('type and replace text in big element', function () {
        var text         = "Test me all!",
            fixedText    = "Test" + String.fromCharCode(160) + "me" + String.fromCharCode(160) + "all!",
            expectedNode = null;

        $el = $("#4");

        runAsyncTest(
            function () {
                actionsAPI.type($el[0], text, {
                    replace: true
                });
            },
            function () {
                expectedNode = browser.isIE && browser.version <
                                               12 ? $el[0].childNodes[2].childNodes[0] : $el[0].childNodes[1].childNodes[0];
                checkSelection($el, expectedNode, expectedNode.length, expectedNode, expectedNode.length);
                equal($.trim($el.text()), fixedText);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    module('act.type in elements with invisible symbols');

    asyncTest('typing in invisible node', function () {
        $parent = $('#4');
        $el     = $parent.find('p:nth(1)');

        var text        = "123",
            node        = $el[0].childNodes[5],
            nodeValue   = node.nodeValue,
            elementText = $el.text();

        runAsyncTest(
            function () {
                actionsAPI.type($el[0], text, {
                    caretPos: 28
                });
            },
            function () {
                checkSelection($parent, node, nodeValue.length + text.length, node, nodeValue.length + text.length);
                equal($el[0].childNodes[5].nodeValue, nodeValue + text);
                equal($el.text(), elementText.substring(0, 36) + text + elementText.substring(36));
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('caret position is first visible position (without invisible symbols in the start)', function () {
        $parent = $('#1');
        $el     = $parent.find("p");

        var text      = "123",
            caretPos  = 0,
            nodeValue = $parent[0].childNodes[1].childNodes[0].nodeValue;

        runAsyncTest(
            function () {
                actionsAPI.type($el[0], text, {
                    caretPos: caretPos
                });
            },
            function () {
                checkSelection($parent, $parent[0].childNodes[1].childNodes[0], caretPos +
                                                                                text.length, $parent[0].childNodes[1].childNodes[0], caretPos +
                                                                                                                                     text.length);
                equal($parent[0].childNodes[1].childNodes[0].nodeValue, nodeValue.substring(0, caretPos) + text +
                                                                        nodeValue.substring(caretPos));
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('caret position is less than first visible position (with invisible symbols in the start)', function () {
        $parent = $('#6');
        $el     = $parent.find('i>code');

        var text        = "123",
            caretPos    = 1,
            nodeValue   = $parent[0].childNodes[5].childNodes[1].childNodes[0].nodeValue,
            symbolIndex = null;

        runAsyncTest(
            function () {
                actionsAPI.type($el[0], text, {
                    caretPos: caretPos
                });
            },
            function () {
                symbolIndex = firstNotWhiteSpaceSymbolIndex(nodeValue);
                checkSelection($parent, $parent[0].childNodes[5].childNodes[1].childNodes[0], symbolIndex +
                                                                                              text.length, $parent[0].childNodes[5].childNodes[1].childNodes[0], symbolIndex +
                                                                                                                                                                 text.length);
                equal($parent[0].childNodes[5].childNodes[1].childNodes[0].nodeValue, nodeValue.substring(0, symbolIndex) +
                                                                                      text +
                                                                                      nodeValue.substring(symbolIndex));
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('caret position equal 0 (with invisible symbols in the start)', function () {
        $parent = $('#6');
        $el     = $parent.find('i>code');

        var text      = "123",
            caretPos  = 0,
            nodeValue = $parent[0].childNodes[5].childNodes[1].childNodes[0].nodeValue;

        runAsyncTest(
            function () {
                actionsAPI.type($el[0], text, {
                    caretPos: caretPos
                });
            },
            function () {
                checkSelection($parent, $parent[0].childNodes[5].childNodes[1].childNodes[0], caretPos +
                                                                                              text.length, $parent[0].childNodes[5].childNodes[1].childNodes[0], caretPos +
                                                                                                                                                                 text.length);
                equal($parent[0].childNodes[5].childNodes[1].childNodes[0].nodeValue, nodeValue.substring(0, caretPos) +
                                                                                      text +
                                                                                      nodeValue.substring(caretPos));
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('caret position is first visible position (with invisible symbols in the start)', function () {
        $parent = $('#6');
        $el     = $parent.find('i>code');

        var text      = "123",
            caretPos  = 9,
            nodeValue = $parent[0].childNodes[5].childNodes[1].childNodes[0].nodeValue;

        runAsyncTest(
            function () {
                actionsAPI.type($el[0], text, {
                    caretPos: caretPos
                });
            },
            function () {
                checkSelection($parent, $parent[0].childNodes[5].childNodes[1].childNodes[0], caretPos +
                                                                                              text.length, $parent[0].childNodes[5].childNodes[1].childNodes[0], caretPos +
                                                                                                                                                                 text.length);
                equal($parent[0].childNodes[5].childNodes[1].childNodes[0].nodeValue, nodeValue.substring(0, caretPos) +
                                                                                      text +
                                                                                      nodeValue.substring(caretPos));
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('caret position is last visible position (without invisible symbols in the start)', function () {
        $parent = $('#1');
        $el     = $parent.find('p');

        var text      = "123",
            caretPos  = 31,
            nodeValue = $parent[0].childNodes[1].childNodes[0].nodeValue;

        runAsyncTest(
            function () {
                actionsAPI.type($el[0], text, {
                    caretPos: caretPos
                });
            },
            function () {
                checkSelection($parent, $parent[0].childNodes[1].childNodes[0], caretPos +
                                                                                text.length, $parent[0].childNodes[1].childNodes[0], caretPos +
                                                                                                                                     text.length);
                equal($parent[0].childNodes[1].childNodes[0].nodeValue, nodeValue.substring(0, caretPos) + text +
                                                                        nodeValue.substring(caretPos));
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('caret position is more than last visible position (with invisible symbols in the start)', function () {
        $parent = $('#6');
        $el     = $parent.find('i>code');

        var text      = "123",
            caretPos  = 17,
            nodeValue = $parent[0].childNodes[5].childNodes[1].childNodes[0].nodeValue;

        runAsyncTest(
            function () {
                actionsAPI.type($el[0], text, {
                    caretPos: caretPos
                });
            },
            function () {
                checkSelection($parent, $parent[0].childNodes[5].childNodes[1].childNodes[0], nodeValue.length +
                                                                                              text.length, $parent[0].childNodes[5].childNodes[1].childNodes[0], nodeValue.length +
                                                                                                                                                                 text.length);
                equal($parent[0].childNodes[5].childNodes[1].childNodes[0].nodeValue, nodeValue + text);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('caret position equal nodeValue length (with invisible symbols in the start)', function () {
        $parent = $('#6');
        $el     = $parent.find('i>code');

        var text      = "123",
            caretPos  = 25,
            nodeValue = $parent[0].childNodes[5].childNodes[1].childNodes[0].nodeValue;

        runAsyncTest(
            function () {
                actionsAPI.type($el[0], text, {
                    caretPos: caretPos
                });
            },
            function () {
                checkSelection($parent, $parent[0].childNodes[5].childNodes[1].childNodes[0], nodeValue.length +
                                                                                              text.length, $parent[0].childNodes[5].childNodes[1].childNodes[0], nodeValue.length +
                                                                                                                                                                 text.length);
                equal($parent[0].childNodes[5].childNodes[1].childNodes[0].nodeValue, nodeValue + text);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('caret position is last visible position (with invisible symbols in the start)', function () {
        $el = $('#6');

        var text      = "123",
            caretPos  = 8,
            nodeValue = $el[0].childNodes[8].nodeValue;

        runAsyncTest(
            function () {
                actionsAPI.type($el[0], text, {
                    caretPos: 118
                });
            },
            function () {
                checkSelection($el, $el[0].childNodes[8], caretPos + text.length, $el[0].childNodes[8], caretPos +
                                                                                                        text.length);
                equal($el[0].childNodes[8].nodeValue, nodeValue.substring(0, caretPos) + text +
                                                      nodeValue.substring(caretPos));
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    module('errors');

    asyncTest('invisible second element raise error', function () {
        asyncActionCallback = function () {
        };
        var $el1            = $('#4>p').first(),
            $el2            = $('#4>p').last();

        $el2.css('display', 'none');

        actionsAPI.select($el1[0], $el2[0]);
        window.setTimeout(function () {
            equal(currentErrorCode, ERROR_TYPE.incorrectSelectActionArguments, 'correct error code sent');
            start();
        }, correctTestWaitingTime(ERROR_WAITING_TIMEOUT));
    });

    asyncTest('element isn\'t content editable raise error', function () {
        asyncActionCallback = function () {
        };
        var $parent         = $('#4'),
            $el1            = $('#4>p').first(),
            $el2            = $('#4>p').last();

        $parent[0].removeAttribute('contenteditable');

        actionsAPI.select($el1[0], $el2[0]);
        window.setTimeout(function () {
            equal(currentErrorCode, ERROR_TYPE.incorrectSelectActionArguments, 'correct error code sent');
            start();
        }, correctTestWaitingTime(ERROR_WAITING_TIMEOUT));
    });

    asyncTest('elements, which don\'t have common ancestor raise error', function () {
        asyncActionCallback = function () {
        };
        var $el1            = $('#1>p'),
            $el2            = $('#4>p').last();

        actionsAPI.select($el1[0], $el2[0]);
        window.setTimeout(function () {
            equal(currentErrorCode, ERROR_TYPE.incorrectSelectActionArguments, 'correct error code sent');
            start();
        }, correctTestWaitingTime(ERROR_WAITING_TIMEOUT));
    });

    asyncTest('for all action except select we cann\'t send text node like the first parameter', function () {
        asyncActionCallback = function () {
        };

        var node = $("#2")[0].childNodes[0],
            text = 'test';

        actionsAPI.type(node, text, {
            caretPos: 1
        });
        window.setTimeout(function () {
            equal(currentErrorCode, ERROR_TYPE.emptyFirstArgument, 'correct error code sent');
            start();
        }, correctTestWaitingTime(ERROR_WAITING_TIMEOUT));
    });
});
