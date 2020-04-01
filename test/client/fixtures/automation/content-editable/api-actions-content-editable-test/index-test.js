const hammerhead   = window.getTestCafeModule('hammerhead');
const browserUtils = hammerhead.utils.browser;

const testCafeAutomation   = window.getTestCafeModule('testCafeAutomation');
const ClickAutomation      = testCafeAutomation.Click;
const RClickAutomation     = testCafeAutomation.RClick;
const DblClickAutomation   = testCafeAutomation.DblClick;
const SelectTextAutomation = testCafeAutomation.SelectText;
const PressAutomation      = testCafeAutomation.Press;
const TypeAutomation       = testCafeAutomation.Type;
const ClickOptions         = testCafeAutomation.ClickOptions;
const TypeOptions          = testCafeAutomation.TypeOptions;

const testCafeCore      = window.getTestCafeModule('testCafeCore');
const domUtils          = testCafeCore.domUtils;
const textSelection     = testCafeCore.textSelection;
const parseKeySequence  = testCafeCore.parseKeySequence;


testCafeCore.preventRealEvents();

$(document).ready(function () {
    // NOTE: https://github.com/DevExpress/testcafe/issues/2008
    // Remove this condition when the issue will be fixed.
    if (browserUtils.isSafari && browserUtils.version === 11)
        return;

    let $el     = null;
    let $parent = null;

    let firstElementInnerHTML   = null;
    let secondElementInnerHTML  = null;
    let thirdElementInnerHTML   = null;
    let fourthElementInnerHTML  = null;
    let fifthElementInnerHTML   = null;
    let sixthElementInnerHTML   = null;
    let seventhElementInnerHTML = null;

    const startNext = function () {
        window.setTimeout(start, 30);
    };

    const firstNotWhiteSpaceSymbolIndex = function (value) {
        let start = 0;

        for (let i = 0; i < value.length; i++) {
            if (value.charCodeAt(i) === 10 || value.charCodeAt(i) === 32) start++;
            else break;
        }
        return start;
    };

    const checkSelection = function ($element, startNode, startOffset, endNode, endOffset) {
        const curDocument = domUtils.findDocument($element[0]);
        const selection   = curDocument.getSelection();

        equal(domUtils.getActiveElement(), $element[0]);
        ok(domUtils.isTheSameNode(startNode, selection.anchorNode), 'startNode correct');
        equal(selection.anchorOffset, startOffset, 'startOffset correct');
        ok(domUtils.isTheSameNode(endNode, selection.focusNode), 'endNode correct');
        equal(selection.focusOffset, endOffset, 'endOffset correct');
    };

    const setInnerHTML = function ($element, innerHTML) {
        $element[0].innerHTML = innerHTML;
    };

    const selectByNodesAndOffsets = function (startNode, startOffset, endNode, endOffset) {
        const startPos = { node: startNode, offset: startOffset };
        const endPos   = { node: endNode, offset: endOffset };

        textSelection.selectByNodesAndOffsets(startPos, endPos, true);
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
        let clicked = false;

        $parent = $('#1');
        $el     = $parent.find('p');

        $el[0].onclick = function () {
            clicked = true;
        };

        ok(!clicked);

        const click = new ClickAutomation($el[0], new ClickOptions({ caretPos: 10 }));

        click
            .run()
            .then(function () {
                ok(clicked, 'click raised');
                checkSelection($parent, $el[0].childNodes[0], 10, $el[0].childNodes[0], 10);

                startNext();
            });
    });

    asyncTest('click on deep child', function () {
        let clicked = false;

        $parent = $('#4');
        $el     = $parent.find(' > p:nth(1) > i:nth(1)');

        $el[0].onclick = function () {
            clicked = true;
        };

        ok(!clicked);

        const click = new ClickAutomation($el[0], new ClickOptions({ caretPos: 1, offsetX: 10, offsetY: 10 }));

        click
            .run()
            .then(function () {
                ok(clicked, 'click raised');
                checkSelection($parent, $parent[0].childNodes[5].childNodes[3].childNodes[0], 1, $parent[0].childNodes[5].childNodes[3].childNodes[0], 1);

                startNext();
            });
    });

    asyncTest('click on element with selection', function () {
        let clicked = false;

        $parent = $('#5');
        $el     = $parent.find(' > i:nth(0) > b:nth(0)');

        $el[0].onclick = function () {
            clicked = true;
        };

        ok(!clicked);
        selectByNodesAndOffsets($parent[0].childNodes[0], 3, $parent[0].childNodes[4], 7);

        const click = new ClickAutomation($el[0], new ClickOptions({ offsetX: 5, offsetY: 5, caretPos: 6 }));

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
        let clicked = false;

        $el = $('#4');

        $el.bind('contextmenu', function () {
            clicked = true;
        });

        ok(!clicked);

        const rclick = new RClickAutomation($el[0], new ClickOptions({ caretPos: 104 }));

        rclick
            .run()
            .then(function () {
                const selectedEl = $el.find('>p:first>i')[0];

                ok(clicked, 'click raised');
                checkSelection($el, selectedEl.childNodes[0], 1, selectedEl.childNodes[0], 1);

                startNext();
            });
    });

    module('act.dblclick');

    asyncTest('dblclick (sets the correct position relative to the parent, not the item under the cursor)', function () {
        let dblclicked = false;

        $el = $('#4');

        $el.bind('dblclick', function () {
            dblclicked = true;
        });

        ok(!dblclicked);

        const dblclick = new DblClickAutomation($el[0], new ClickOptions({ caretPos: 104 }));

        dblclick
            .run()
            .then(function () {
                const selectedEl = $el.find('>p:first>i')[0];

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

        const selectText = new SelectTextAutomation($el[0], 5, 30, {});

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

        const selectText = new SelectTextAutomation($el[0], 15, 151, {});

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

        const selectText = new SelectTextAutomation($el[0], 18, 54, {});

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
        let oldInnerHTML = null;

        $el          = $('#4');
        oldInnerHTML = $el[0].innerHTML;
        $el.focus();

        const press = new PressAutomation(parseKeySequence('ctrl+a').combinations, {});

        press
            .run()
            .then(function () {
                checkSelection($el, $el[0].childNodes[1].childNodes[0], 9, $el[0].childNodes[10].childNodes[0], 4);
                equal($el[0].innerHTML, oldInnerHTML, 'text isn\'t change');

                startNext();
            });
    });

    asyncTest('select and delete', function () {
        let oldNodeValue = null;

        $el          = $('#4');
        oldNodeValue = $el[0].childNodes[1].childNodes[2].nodeValue;

        selectByNodesAndOffsets($el[0].childNodes[1].childNodes[2], 11, $el[0].childNodes[10].childNodes[0], 3);
        equal($el[0].childNodes[1].childNodes[2].nodeValue, oldNodeValue, 'nodeValue is correct');

        const press = new PressAutomation(parseKeySequence('delete').combinations, {});

        press
            .run()
            .then(function () {
                equal($el[0].childNodes[1].childNodes[2].nodeValue, oldNodeValue.substring(0, 11), 'nodeValue is correct');

                startNext();
            });
    });

    asyncTest('select and backspace', function () {
        let element        = null;
        let oldElementText = null;

        $parent        = $('#6');
        $el            = $parent.find('i:first');
        element        = $parent[0].childNodes[5].childNodes[1];
        oldElementText = $(element).text();

        selectByNodesAndOffsets($parent[0].childNodes[5].childNodes[1].childNodes[0], 0, $parent[0].childNodes[5].childNodes[1].childNodes[0], 17);

        window.setTimeout(function () {
            equal($(element).text(), oldElementText, 'nodeValue is correct');

            const press = new PressAutomation(parseKeySequence('backspace').combinations, {});

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
        let startNode   = null;
        let startOffset = null;
        let endNode     = null;
        let endOffset   = null;

        $el         = $('#4');
        startNode   = $el[0].childNodes[1].childNodes[2];
        startOffset = 11;
        endNode     = $el[0].childNodes[10].childNodes[0];
        endOffset   = 3;

        selectByNodesAndOffsets(startNode, startOffset, endNode, endOffset);
        checkSelection($el, startNode, startOffset, endNode, endOffset);

        const press = new PressAutomation(parseKeySequence('left').combinations, {});

        press
            .run()
            .then(function () {
                checkSelection($el, startNode, startOffset, startNode, startOffset);

                startNext();
            });
    });

    asyncTest('select and right', function () {
        let startNode   = null;
        let startOffset = null;
        let endNode     = null;
        let endOffset   = null;

        $el         = $('#4');
        startNode   = $el[0].childNodes[1].childNodes[2];
        startOffset = 11;
        endNode     = $el[0].childNodes[10].childNodes[0];
        endOffset   = 3;

        selectByNodesAndOffsets(startNode, startOffset, endNode, endOffset);
        checkSelection($el, startNode, startOffset, endNode, endOffset);

        const press = new PressAutomation(parseKeySequence('right').combinations, {});

        press
            .run()
            .then(function () {
                checkSelection($el, endNode, endOffset, endNode, endOffset);

                startNext();
            });
    });

    module('act.type');

    asyncTest('simple type', function () {
        const text      = 'Test me all!';
        const fixedText = 'Test' + String.fromCharCode(160) + 'me' + String.fromCharCode(160) + 'all!';

        let inputEventRaisedCount = 0;

        // NOTE IE11 does not raise input event on contenteditable element
        const expectedInputEventRaisedCount = browserUtils.isIE11 ? 0 : 12;

        $el = $('#2');

        function onInput () {
            inputEventRaisedCount++;
        }

        $el.bind('input', onInput);

        const type = new TypeAutomation($el[0], text, new TypeOptions({ caretPos: 19 }));

        type
            .run()
            .then(function () {
                checkSelection($el, $el[0].childNodes[2], 4 + text.length, $el[0].childNodes[2], 4 + text.length);
                equal($.trim($el[0].childNodes[2].nodeValue), 'with' + fixedText + ' br');
                equal(inputEventRaisedCount, expectedInputEventRaisedCount);
                $el.unbind('input', onInput);

                startNext();
            });
    });

    asyncTest('type in element node', function () {
        const text = 'Test';

        let inputEventRaisedCount = 0;

        // NOTE IE11 does not raise input event on contenteditable element
        const expectedInputEventRaisedCount = !browserUtils.isIE11 ? 4 : 0;

        $el = $('#8');

        function onInput () {
            inputEventRaisedCount++;
        }

        $el.bind('input', onInput);

        const type = new TypeAutomation($el[0], text, new TypeOptions());

        type
            .run()
            .then(function () {
                equal($.trim($el[0].textContent), text);
                equal(inputEventRaisedCount, expectedInputEventRaisedCount);
                $el.unbind('input', onInput);

                startNext();
            });
    });

    asyncTest('simple type in deep child', function () {
        const text = 'ABC';

        $parent = $('#6');
        $el     = $parent.find(' > i:nth(0) > b:nth(1)');

        const type = new TypeAutomation($el[0], text, new TypeOptions({ caretPos: 2 }));

        type
            .run()
            .then(function () {
                checkSelection($parent, $el[0].childNodes[0], 2 + text.length, $el[0].childNodes[0], 2 + text.length);
                equal($.trim($el[0].childNodes[0].nodeValue), 'boABCld');

                startNext();
            });

    });

    asyncTest('type in element with simple selection', function () {
        const text      = 'Test me all!';
        const fixedText = 'Test' + String.fromCharCode(160) + 'me' + String.fromCharCode(160) + 'all!';

        $el = $('#2');

        selectByNodesAndOffsets($el[0].childNodes[0], 3, $el[0].childNodes[2], 7);

        const type = new TypeAutomation($el[0], text, new TypeOptions({ caretPos: 21 }));

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

        const text            = 'Test me all!';
        const fixedText       = 'Test' + String.fromCharCode(160) + 'me' + String.fromCharCode(160) + 'all!';
        const olsElementValue = $el[0].childNodes[0].nodeValue;

        selectByNodesAndOffsets($parent[0].childNodes[1].childNodes[4], 11, $parent[0].childNodes[5].childNodes[6].childNodes[0], 2);

        const type = new TypeAutomation($el[0], text, new TypeOptions({ caretPos: 2 }));

        type
            .run()
            .then(function () {
                checkSelection($parent, $el[0].childNodes[0], 2 + text.length, $el[0].childNodes[0], 2 + text.length);
                equal($el[0].childNodes[0].nodeValue, olsElementValue + fixedText);

                startNext();
            });
    });

    asyncTest('type and replace text in simple element', function () {
        const text      = 'Test me all!';
        const fixedText = 'Test' + String.fromCharCode(160) + 'me' + String.fromCharCode(160) + 'all!';

        $el = $('#2');

        const type = new TypeAutomation($el[0], text, new TypeOptions({ replace: true }));

        type
            .run()
            .then(function () {
                checkSelection($el, $el[0].childNodes[0], text.length, $el[0].childNodes[0], text.length);
                equal($.trim($el.text()), fixedText);

                startNext();
            });
    });

    asyncTest('type and replace text in big element', function () {
        const text      = 'Test me all!';
        const fixedText = 'Test' + String.fromCharCode(160) + 'me' + String.fromCharCode(160) + 'all!';

        let expectedNode = null;

        $el = $('#4');

        const type = new TypeAutomation($el[0], text, new TypeOptions({ replace: true }));

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

        const text        = '123';
        const node        = $el[0].childNodes[5];
        const nodeValue   = node.nodeValue;
        const elementText = $el.text();

        const type = new TypeAutomation($el[0], text, new TypeOptions({ caretPos: 28 }));

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

        const text      = '123';
        const caretPos  = 0;
        const nodeValue = $parent[0].childNodes[1].childNodes[0].nodeValue;

        const type = new TypeAutomation($el[0], text, new TypeOptions({ caretPos: caretPos }));

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

        const text      = '123';
        const caretPos  = 1;
        const nodeValue = $parent[0].childNodes[5].childNodes[1].childNodes[0].nodeValue;

        let symbolIndex = null;

        const type = new TypeAutomation($el[0], text, new TypeOptions({ caretPos: caretPos }));

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

        const text      = '123';
        const caretPos  = 0;
        const nodeValue = $parent[0].childNodes[5].childNodes[1].childNodes[0].nodeValue;

        const type = new TypeAutomation($el[0], text, new TypeOptions({ caretPos: caretPos }));

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

        const text      = '123';
        const caretPos  = 9;
        const nodeValue = $parent[0].childNodes[5].childNodes[1].childNodes[0].nodeValue;

        const type = new TypeAutomation($el[0], text, new TypeOptions({ caretPos: caretPos }));

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

        const text      = '123';
        const caretPos  = 31;
        const nodeValue = $parent[0].childNodes[1].childNodes[0].nodeValue;

        const type = new TypeAutomation($el[0], text, new TypeOptions({ caretPos: caretPos }));

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

        const text      = '123';
        const caretPos  = 17;
        const nodeValue = $parent[0].childNodes[5].childNodes[1].childNodes[0].nodeValue;

        const type = new TypeAutomation($el[0], text, new TypeOptions({ caretPos: caretPos }));

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

        const text      = '123';
        const caretPos  = 25;
        const nodeValue = $parent[0].childNodes[5].childNodes[1].childNodes[0].nodeValue;

        const type = new TypeAutomation($el[0], text, new TypeOptions({ caretPos: caretPos }));

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

        const text      = '123';
        const caretPos  = 8;
        const nodeValue = $el[0].childNodes[8].nodeValue;

        const type = new TypeAutomation($el[0], text, new TypeOptions({ caretPos: 118 }));

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
