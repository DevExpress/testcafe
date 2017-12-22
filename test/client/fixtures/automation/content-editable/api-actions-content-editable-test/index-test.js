var hammerhead   = window.getTestCafeModule('hammerhead');
var browserUtils = hammerhead.utils.browser;

var testCafeAutomation   = window.getTestCafeModule('testCafeAutomation');
var ClickAutomation      = testCafeAutomation.Click;
var RClickAutomation     = testCafeAutomation.RClick;
var DblClickAutomation   = testCafeAutomation.DblClick;
var SelectTextAutomation = testCafeAutomation.SelectText;
var PressAutomation      = testCafeAutomation.Press;
var TypeAutomation       = testCafeAutomation.Type;
var ClickOptions         = testCafeAutomation.get('../../test-run/commands/options').ClickOptions;
var TypeOptions          = testCafeAutomation.get('../../test-run/commands/options').TypeOptions;

var testCafeCore      = window.getTestCafeModule('testCafeCore');
var domUtils          = testCafeCore.get('./utils/dom');
var textSelection     = testCafeCore.get('./utils/text-selection');
var parseKeySequence  = testCafeCore.get('./utils/parse-key-sequence');


testCafeCore.preventRealEvents();

$(document).ready(function () {
    // NOTE: https://github.com/DevExpress/testcafe/issues/2008
    // Remove this condition when the issue will be fixed.
    if (browserUtils.isSafari && browserUtils.version === 11)
        return;

    var $el     = null;
    var $parent = null;

    var firstElementInnerHTML   = null;
    var secondElementInnerHTML  = null;
    var thirdElementInnerHTML   = null;
    var fourthElementInnerHTML  = null;
    var fifthElementInnerHTML   = null;
    var sixthElementInnerHTML   = null;
    var seventhElementInnerHTML = null;

    var startNext = function () {
        window.setTimeout(start, 30);
    };

    var firstNotWhiteSpaceSymbolIndex = function (value) {
        var start = 0;

        for (var i = 0; i < value.length; i++) {
            if (value.charCodeAt(i) === 10 || value.charCodeAt(i) === 32) start++;
            else break;
        }
        return start;
    };

    var checkSelection = function ($element, startNode, startOffset, endNode, endOffset) {
        var curDocument = domUtils.findDocument($element[0]);
        var selection   = curDocument.getSelection();

        equal(domUtils.getActiveElement(), $element[0]);
        ok(domUtils.isTheSameNode(startNode, selection.anchorNode), 'startNode correct');
        equal(selection.anchorOffset, startOffset, 'startOffset correct');
        ok(domUtils.isTheSameNode(endNode, selection.focusNode), 'endNode correct');
        equal(selection.focusOffset, endOffset, 'endOffset correct');
    };

    var setInnerHTML = function ($element, innerHTML) {
        window.setProperty($element[0], 'innerHTML', innerHTML);
    };

    var selectByNodesAndOffsets = function (startNode, startOffset, endNode, endOffset) {
        var startPos = { node: startNode, offset: startOffset };
        var endPos   = { node: endNode, offset: endOffset };

        textSelection.selectByNodesAndOffsets(startPos, endPos, true);
    };

    var stateHelper = {
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
            var curActiveElement = domUtils.getActiveElement();
            var selection        = document.getSelection();

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
        }
    };

    $('<div></div>').css({ width: 1, height: 1500, position: 'absolute' }).appendTo('body');
    $('body').css('height', '1500px');

    //tests
    QUnit.testStart(function () {
        //before first test save page state
        if (!stateHelper.isStateSaved())
            stateHelper.saveState();
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
    });

    module('act.click');

    asyncTest('simple click', function () {
        var clicked = false;

        $parent = $('#1');
        $el     = $parent.find('p');

        $el[0].onclick = function () {
            clicked = true;
        };

        ok(!clicked);

        var click = new ClickAutomation($el[0], new ClickOptions({ caretPos: 10 }));

        click
            .run()
            .then(function () {
                ok(clicked, 'click raised');
                checkSelection($parent, $el[0].childNodes[0], 10, $el[0].childNodes[0], 10);

                startNext();
            });
    });

    asyncTest('click on deep child', function () {
        var clicked = false;

        $parent = $('#4');
        $el     = $parent.find(' > p:nth(1) > i:nth(1)');

        $el[0].onclick = function () {
            clicked = true;
        };

        ok(!clicked);

        var click = new ClickAutomation($el[0], new ClickOptions({ caretPos: 1, offsetX: 10, offsetY: 10 }));

        click
            .run()
            .then(function () {
                ok(clicked, 'click raised');
                checkSelection($parent, $parent[0].childNodes[5].childNodes[3].childNodes[0], 1, $parent[0].childNodes[5].childNodes[3].childNodes[0], 1);

                startNext();
            });
    });

    asyncTest('click on element with selection', function () {
        var clicked = false;

        $parent = $('#5');
        $el     = $parent.find(' > i:nth(0) > b:nth(0)');

        $el[0].onclick = function () {
            clicked = true;
        };

        ok(!clicked);
        selectByNodesAndOffsets($parent[0].childNodes[0], 3, $parent[0].childNodes[4], 7);

        var click = new ClickAutomation($el[0], new ClickOptions({ offsetX: 5, offsetY: 5, caretPos: 6 }));

        click
            .run()
            .then(function () {
                ok(clicked, 'click raised');
                checkSelection($parent, $el[0].childNodes[0], 6, $el[0].childNodes[0], 6);

                startNext();
            });
    });

    module('act.rclick');

    asyncTest('rclick (sets the correct position relative to the parent, not the item under the cursor)', function () {
        var clicked = false;

        $el = $('#4');

        $el.bind('contextmenu', function () {
            clicked = true;
        });

        ok(!clicked);

        var rclick = new RClickAutomation($el[0], new ClickOptions({ caretPos: 104 }));

        rclick
            .run()
            .then(function () {
                var selectedEl = $el.find('>p:first>i')[0];

                ok(clicked, 'click raised');
                checkSelection($el, selectedEl.childNodes[0], 1, selectedEl.childNodes[0], 1);

                startNext();
            });
    });

    module('act.dblclick');

    asyncTest('dblclick (sets the correct position relative to the parent, not the item under the cursor)', function () {
        var dblclicked = false;

        $el = $('#4');

        $el.bind('dblclick', function () {
            dblclicked = true;
        });

        ok(!dblclicked);

        var dblclick = new DblClickAutomation($el[0], new ClickOptions({ caretPos: 104 }));

        dblclick
            .run()
            .then(function () {
                var selectedEl = $el.find('>p:first>i')[0];

                ok(dblclicked, 'click raised');
                checkSelection($el, selectedEl.childNodes[0], 1, selectedEl.childNodes[0], 1);

                startNext();
            });
    });

    module('act.select');
    QUnit.config.testTimeout = 5000;
    asyncTest('simple select', function () {
        $parent = $('#1');
        $el     = $parent.find('p');

        var selectText = new SelectTextAutomation($el[0], 5, 30, {});

        selectText
            .run()
            .then(function () {
                checkSelection($parent, $el[0].childNodes[0], 5, $el[0].childNodes[0], 30);

                startNext();
            });
    });

    asyncTest('difficult select', function () {
        $el     = $('#4');
        $parent = $el;

        var selectText = new SelectTextAutomation($el[0], 15, 151, {});

        selectText
            .run()
            .then(function () {
                checkSelection($parent, $el[0].childNodes[1].childNodes[0], 10, $el[0].childNodes[5].childNodes[4].childNodes[0], 2);

                startNext();
            });
    });

    // NOTE: creation of inverse selections moved to functional tests

    asyncTest('select in simple nearest common ancestor', function () {
        $parent = $('#6');
        $el     = $parent.find('i:first');

        var selectText = new SelectTextAutomation($el[0], 18, 54, {});

        selectText
            .run()
            .then(function () {
                checkSelection($parent, $parent[0].childNodes[5].childNodes[1].childNodes[0], 14, $parent[0].childNodes[5].childNodes[4].childNodes[0], 3);

                startNext();
            });
    });

    module('act.select api');

    module('shortcuts');

    asyncTest('select all', function () {
        var oldInnerHTML = null;

        $el          = $('#4');
        oldInnerHTML = $el[0].innerHTML;
        $el.focus();

        var press = new PressAutomation(parseKeySequence('ctrl+a').combinations, {});

        press
            .run()
            .then(function () {
                checkSelection($el, $el[0].childNodes[1].childNodes[0], 9, $el[0].childNodes[10].childNodes[0], 4);
                equal($el[0].innerHTML, oldInnerHTML, 'text isn\'t change');

                startNext();
            });
    });

    asyncTest('select and delete', function () {
        var oldNodeValue = null;

        $el          = $('#4');
        oldNodeValue = $el[0].childNodes[1].childNodes[2].nodeValue;

        selectByNodesAndOffsets($el[0].childNodes[1].childNodes[2], 11, $el[0].childNodes[10].childNodes[0], 3);
        equal($el[0].childNodes[1].childNodes[2].nodeValue, oldNodeValue, 'nodeValue is correct');

        var press = new PressAutomation(parseKeySequence('delete').combinations, {});

        press
            .run()
            .then(function () {
                equal($el[0].childNodes[1].childNodes[2].nodeValue, oldNodeValue.substring(0, 11), 'nodeValue is correct');

                startNext();
            });
    });

    asyncTest('select and backspace', function () {
        var element        = null;
        var oldElementText = null;

        $parent        = $('#6');
        $el            = $parent.find('i:first');
        element        = $parent[0].childNodes[5].childNodes[1];
        oldElementText = $(element).text();

        selectByNodesAndOffsets($parent[0].childNodes[5].childNodes[1].childNodes[0], 0, $parent[0].childNodes[5].childNodes[1].childNodes[0], 17);

        window.setTimeout(function () {
            equal($(element).text(), oldElementText, 'nodeValue is correct');

            var press = new PressAutomation(parseKeySequence('backspace').combinations, {});

            press
                .run()
                .then(function () {
                    //we can't check selection position because it's different in different browsers
                    notEqual($(element).text(), oldElementText, 'oldValue isn\'t the same');
                    equal($.trim($(element).text()), 'b el', 'nodeValue is correct');

                    startNext();
                });
        }, 1000);
    });

    asyncTest('select and left', function () {
        var startNode   = null;
        var startOffset = null;
        var endNode     = null;
        var endOffset   = null;

        $el         = $('#4');
        startNode   = $el[0].childNodes[1].childNodes[2];
        startOffset = 11;
        endNode     = $el[0].childNodes[10].childNodes[0];
        endOffset   = 3;

        selectByNodesAndOffsets(startNode, startOffset, endNode, endOffset);
        checkSelection($el, startNode, startOffset, endNode, endOffset);

        var press = new PressAutomation(parseKeySequence('left').combinations, {});

        press
            .run()
            .then(function () {
                checkSelection($el, startNode, startOffset, startNode, startOffset);

                startNext();
            });
    });

    asyncTest('select and right', function () {
        var startNode   = null;
        var startOffset = null;
        var endNode     = null;
        var endOffset   = null;

        $el         = $('#4');
        startNode   = $el[0].childNodes[1].childNodes[2];
        startOffset = 11;
        endNode     = $el[0].childNodes[10].childNodes[0];
        endOffset   = 3;

        selectByNodesAndOffsets(startNode, startOffset, endNode, endOffset);
        checkSelection($el, startNode, startOffset, endNode, endOffset);

        var press = new PressAutomation(parseKeySequence('right').combinations, {});

        press
            .run()
            .then(function () {
                checkSelection($el, endNode, endOffset, endNode, endOffset);

                startNext();
            });
    });

    module('act.type');

    asyncTest('simple type', function () {
        var text                  = 'Test me all!';
        var fixedText             = 'Test' + String.fromCharCode(160) + 'me' + String.fromCharCode(160) + 'all!';
        var inputEventRaisedCount = 0;

        $el = $('#2');

        function onInput () {
            inputEventRaisedCount++;
        }

        $el.bind('input', onInput);

        var type = new TypeAutomation($el[0], text, new TypeOptions({ caretPos: 19 }));

        type
            .run()
            .then(function () {
                checkSelection($el, $el[0].childNodes[2], 4 + text.length, $el[0].childNodes[2], 4 + text.length);
                equal($.trim($el[0].childNodes[2].nodeValue), 'with' + fixedText + ' br');
                equal(inputEventRaisedCount, 12);
                $el.unbind('input', onInput);

                startNext();
            });
    });

    asyncTest('type in element node', function () {
        var text                  = 'Test';
        var inputEventRaisedCount = 0;

        $el = $('#8');

        function onInput () {
            inputEventRaisedCount++;
        }

        $el.bind('input', onInput);

        var type = new TypeAutomation($el[0], text, new TypeOptions());

        type
            .run()
            .then(function () {
                equal($.trim($el[0].textContent), text);
                equal(inputEventRaisedCount, 4);
                $el.unbind('input', onInput);

                startNext();
            });
    });

    asyncTest('simple type in deep child', function () {
        var text = 'ABC';

        $parent = $('#6');
        $el     = $parent.find(' > i:nth(0) > b:nth(1)');

        var type = new TypeAutomation($el[0], text, new TypeOptions({ caretPos: 2 }));

        type
            .run()
            .then(function () {
                checkSelection($parent, $el[0].childNodes[0], 2 + text.length, $el[0].childNodes[0], 2 + text.length);
                equal($.trim($el[0].childNodes[0].nodeValue), 'boABCld');

                startNext();
            });

    });

    asyncTest('type in element with simple selection', function () {
        var text      = 'Test me all!';
        var fixedText = 'Test' + String.fromCharCode(160) + 'me' + String.fromCharCode(160) + 'all!';

        $el = $('#2');

        selectByNodesAndOffsets($el[0].childNodes[0], 3, $el[0].childNodes[2], 7);

        var type = new TypeAutomation($el[0], text, new TypeOptions({ caretPos: 21 }));

        type
            .run()
            .then(function () {
                checkSelection($el, $el[0].childNodes[2], 6 + text.length, $el[0].childNodes[2], 6 + text.length);
                equal($.trim($el[0].childNodes[2].nodeValue), 'with b' + fixedText + 'r');

                startNext();
            });
    });

    asyncTest('type in element with big selection', function () {
        $parent = $('#4');
        $el     = $parent.find('p:nth(1)>i:nth(1)');

        var text            = 'Test me all!';
        var fixedText       = 'Test' + String.fromCharCode(160) + 'me' + String.fromCharCode(160) + 'all!';
        var olsElementValue = $el[0].childNodes[0].nodeValue;

        selectByNodesAndOffsets($parent[0].childNodes[1].childNodes[4], 11, $parent[0].childNodes[5].childNodes[6].childNodes[0], 2);

        var type = new TypeAutomation($el[0], text, new TypeOptions({ caretPos: 2 }));

        type
            .run()
            .then(function () {
                checkSelection($parent, $el[0].childNodes[0], 2 + text.length, $el[0].childNodes[0], 2 + text.length);
                equal($el[0].childNodes[0].nodeValue, olsElementValue + fixedText);

                startNext();
            });
    });

    asyncTest('type and replace text in simple element', function () {
        var text      = 'Test me all!';
        var fixedText = 'Test' + String.fromCharCode(160) + 'me' + String.fromCharCode(160) + 'all!';

        $el = $('#2');

        var type = new TypeAutomation($el[0], text, new TypeOptions({ replace: true }));

        type
            .run()
            .then(function () {
                checkSelection($el, $el[0].childNodes[0], text.length, $el[0].childNodes[0], text.length);
                equal($.trim($el.text()), fixedText);

                startNext();
            });
    });

    asyncTest('type and replace text in big element', function () {
        var text         = 'Test me all!';
        var fixedText    = 'Test' + String.fromCharCode(160) + 'me' + String.fromCharCode(160) + 'all!';
        var expectedNode = null;

        $el = $('#4');

        var type = new TypeAutomation($el[0], text, new TypeOptions({ replace: true }));

        type
            .run()
            .then(function () {
                expectedNode = browserUtils.isIE && browserUtils.version <
                                                    12 ? $el[0].childNodes[2].childNodes[0] : $el[0].childNodes[1].childNodes[0];
                checkSelection($el, expectedNode, expectedNode.length, expectedNode, expectedNode.length);
                equal($.trim($el.text()), fixedText);

                startNext();
            });
    });

    module('act.type in elements with invisible symbols');

    asyncTest('typing in invisible node', function () {
        $parent = $('#4');
        $el     = $parent.find('p:nth(1)');

        var text        = '123';
        var node        = $el[0].childNodes[5];
        var nodeValue   = node.nodeValue;
        var elementText = $el.text();

        var type = new TypeAutomation($el[0], text, new TypeOptions({ caretPos: 28 }));

        type
            .run()
            .then(function () {
                checkSelection($parent, node, nodeValue.length + text.length, node, nodeValue.length + text.length);
                equal($el[0].childNodes[5].nodeValue, nodeValue + text);
                equal($el.text(), elementText.substring(0, 36) + text + elementText.substring(36));

                startNext();
            });
    });

    asyncTest('caret position is first visible position (without invisible symbols in the start)', function () {
        $parent = $('#1');
        $el     = $parent.find('p');

        var text      = '123';
        var caretPos  = 0;
        var nodeValue = $parent[0].childNodes[1].childNodes[0].nodeValue;

        var type = new TypeAutomation($el[0], text, new TypeOptions({ caretPos: caretPos }));

        type
            .run()
            .then(function () {
                checkSelection($parent, $parent[0].childNodes[1].childNodes[0],
                    caretPos + text.length, $parent[0].childNodes[1].childNodes[0], caretPos + text.length);

                equal($parent[0].childNodes[1].childNodes[0].nodeValue,
                    nodeValue.substring(0, caretPos) + text + nodeValue.substring(caretPos));

                startNext();
            });
    });

    asyncTest('caret position is less than first visible position (with invisible symbols in the start)', function () {
        $parent = $('#6');
        $el     = $parent.find('i>code');

        var text        = '123';
        var caretPos    = 1;
        var nodeValue   = $parent[0].childNodes[5].childNodes[1].childNodes[0].nodeValue;
        var symbolIndex = null;

        var type = new TypeAutomation($el[0], text, new TypeOptions({ caretPos: caretPos }));

        type
            .run()
            .then(function () {
                symbolIndex = firstNotWhiteSpaceSymbolIndex(nodeValue);
                checkSelection($parent, $parent[0].childNodes[5].childNodes[1].childNodes[0],
                    symbolIndex + text.length, $parent[0].childNodes[5].childNodes[1].childNodes[0],
                    symbolIndex + text.length);

                equal($parent[0].childNodes[5].childNodes[1].childNodes[0].nodeValue,
                    nodeValue.substring(0, symbolIndex) + text + nodeValue.substring(symbolIndex));

                startNext();
            });
    });

    asyncTest('caret position equal 0 (with invisible symbols in the start)', function () {
        $parent = $('#6');
        $el     = $parent.find('i>code');

        var text      = '123';
        var caretPos  = 0;
        var nodeValue = $parent[0].childNodes[5].childNodes[1].childNodes[0].nodeValue;

        var type = new TypeAutomation($el[0], text, new TypeOptions({ caretPos: caretPos }));

        type
            .run()
            .then(function () {
                checkSelection($parent, $parent[0].childNodes[5].childNodes[1].childNodes[0],
                    caretPos + text.length, $parent[0].childNodes[5].childNodes[1].childNodes[0], caretPos + text.length);

                equal($parent[0].childNodes[5].childNodes[1].childNodes[0].nodeValue,
                    nodeValue.substring(0, caretPos) + text + nodeValue.substring(caretPos));

                startNext();
            });
    });

    asyncTest('caret position is first visible position (with invisible symbols in the start)', function () {
        $parent = $('#6');
        $el     = $parent.find('i>code');

        var text      = '123';
        var caretPos  = 9;
        var nodeValue = $parent[0].childNodes[5].childNodes[1].childNodes[0].nodeValue;

        var type = new TypeAutomation($el[0], text, new TypeOptions({ caretPos: caretPos }));

        type
            .run()
            .then(function () {
                checkSelection($parent,
                    $parent[0].childNodes[5].childNodes[1].childNodes[0],
                    caretPos + text.length, $parent[0].childNodes[5].childNodes[1].childNodes[0], caretPos + text.length);
                equal($parent[0].childNodes[5].childNodes[1].childNodes[0].nodeValue,
                    nodeValue.substring(0, caretPos) + text + nodeValue.substring(caretPos));

                startNext();
            });
    });

    asyncTest('caret position is last visible position (without invisible symbols in the start)', function () {
        $parent = $('#1');
        $el     = $parent.find('p');

        var text      = '123';
        var caretPos  = 31;
        var nodeValue = $parent[0].childNodes[1].childNodes[0].nodeValue;

        var type = new TypeAutomation($el[0], text, new TypeOptions({ caretPos: caretPos }));

        type
            .run()
            .then(function () {
                checkSelection($parent, $parent[0].childNodes[1].childNodes[0],
                    caretPos + text.length, $parent[0].childNodes[1].childNodes[0], caretPos + text.length);

                equal($parent[0].childNodes[1].childNodes[0].nodeValue,
                    nodeValue.substring(0, caretPos) + text + nodeValue.substring(caretPos));

                startNext();
            });
    });

    asyncTest('caret position is more than last visible position (with invisible symbols in the start)', function () {
        $parent = $('#6');
        $el     = $parent.find('i>code');

        var text      = '123';
        var caretPos  = 17;
        var nodeValue = $parent[0].childNodes[5].childNodes[1].childNodes[0].nodeValue;

        var type = new TypeAutomation($el[0], text, new TypeOptions({ caretPos: caretPos }));

        type
            .run()
            .then(function () {
                checkSelection($parent, $parent[0].childNodes[5].childNodes[1].childNodes[0],
                    nodeValue.length + text.length, $parent[0].childNodes[5].childNodes[1].childNodes[0],
                    nodeValue.length + text.length);

                equal($parent[0].childNodes[5].childNodes[1].childNodes[0].nodeValue, nodeValue + text);

                startNext();
            });
    });

    asyncTest('caret position equal nodeValue length (with invisible symbols in the start)', function () {
        $parent = $('#6');
        $el     = $parent.find('i>code');

        var text      = '123';
        var caretPos  = 25;
        var nodeValue = $parent[0].childNodes[5].childNodes[1].childNodes[0].nodeValue;

        var type = new TypeAutomation($el[0], text, new TypeOptions({ caretPos: caretPos }));

        type
            .run()
            .then(function () {
                checkSelection($parent, $parent[0].childNodes[5].childNodes[1].childNodes[0],
                    nodeValue.length + text.length, $parent[0].childNodes[5].childNodes[1].childNodes[0],
                    nodeValue.length + text.length);

                equal($parent[0].childNodes[5].childNodes[1].childNodes[0].nodeValue, nodeValue + text);

                startNext();
            });
    });

    asyncTest('caret position is last visible position (with invisible symbols in the start)', function () {
        $el = $('#6');

        var text      = '123';
        var caretPos  = 8;
        var nodeValue = $el[0].childNodes[8].nodeValue;

        var type = new TypeAutomation($el[0], text, new TypeOptions({ caretPos: 118 }));

        type
            .run()
            .then(function () {
                checkSelection($el, $el[0].childNodes[8], caretPos + text.length, $el[0].childNodes[8],
                    caretPos + text.length);

                equal($el[0].childNodes[8].nodeValue,
                    nodeValue.substring(0, caretPos) + text + nodeValue.substring(caretPos));

                startNext();
            });
    });
});
