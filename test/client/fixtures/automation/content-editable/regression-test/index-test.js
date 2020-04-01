const hammerhead   = window.getTestCafeModule('hammerhead');
const browserUtils = hammerhead.utils.browser;

const testCafeCore = window.getTestCafeModule('testCafeCore');
const domUtils     = testCafeCore.domUtils;

const testCafeAutomation = window.getTestCafeModule('testCafeAutomation');
const TypeOptions        = testCafeAutomation.TypeOptions;
const TypeAutomation     = testCafeAutomation.Type;

testCafeCore.preventRealEvents();

$(document).ready(function () {
    //consts
    const TEST_ELEMENT_CLASS = 'testElement';

    let firstElementInnerHTML  = null;
    let secondElementInnerHTML = null;
    let thirdElementInnerHTML  = null;

    const startNext = function () {
        if (browserUtils.isIE) {
            removeTestElements();
            window.setTimeout(start, 30);
        }
        else
            start();
    };

    const removeTestElements = function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
    };

    const checkSelection = function ($el, startNode, startOffset, endNode, endOffset) {
        const curDocument = domUtils.findDocument($el[0]);
        const selection   = curDocument.getSelection();

        equal(domUtils.getActiveElement(), $el[0]);
        ok(domUtils.isTheSameNode(startNode, selection.anchorNode), 'startNode correct');
        equal(selection.anchorOffset, startOffset, 'startOffset correct');
        ok(domUtils.isTheSameNode(endNode, selection.focusNode), 'endNode correct');
        equal(selection.focusOffset, endOffset, 'endOffset correct');
    };

    const setInnerHTML = function ($el, innerHTML) {
        $el[0].innerHTML = innerHTML;
    };

    const stateHelper = {
        isStateSaved: function () {
            return firstElementInnerHTML;
        },

        saveState: function () {
            firstElementInnerHTML  = $('#1')[0].innerHTML;
            secondElementInnerHTML = $('#2')[0].innerHTML;
            thirdElementInnerHTML  = $('#3')[0].innerHTML;
        },

        restoreState: function () {
            if (firstElementInnerHTML) {
                setInnerHTML($('#1'), firstElementInnerHTML);
                setInnerHTML($('#2'), secondElementInnerHTML);
                setInnerHTML($('#3'), thirdElementInnerHTML);
            }
        }
    };

    QUnit.testStart(function () {
        //before first test save page state
        if (!stateHelper.isStateSaved())
            stateHelper.saveState();
    });

    QUnit.testDone(function () {
        stateHelper.restoreState();

        if (!browserUtils.isIE)
            removeTestElements();
    });

    //tests
    module('regression tests');

    asyncTest('Wrong result of type action without option \'caretPos\'', function () {
        const $body      = $('body');
        const $el        = $('#2').find('p:first');
        const node       = $el[0].childNodes[0];
        const nodeValue  = node.nodeValue;
        const typingText = '123 test';

        $body.css('height', 1500).attr('contenteditable', 'true');
        $body.focus();
        equal(document.activeElement, $body[0]);

        const typeAutomation = new TypeAutomation($el[0], typingText, new TypeOptions());

        typeAutomation
            .run()
            .then(function () {
                equal(document.activeElement, $body[0]);
                checkSelection($body, node, nodeValue.length + typingText.length, node,
                    nodeValue.length + typingText.length);

                equal($('#2').find('p:first')[0].childNodes[0].nodeValue,
                    nodeValue + typingText.replace(' ', String.fromCharCode(160)),
                    'typing must be in the end of element from a parameter of act.type');

                $body.attr('contenteditable', 'false');

                startNext();
            });
    });

    if (!browserUtils.isFirefox) {
        asyncTest('textInput eventArgs.data should contain space but not &nbsp;)', function () {
            const editor = document.createElement('div');
            const text   = 'Hello World';
            const type   = new TypeAutomation(editor, text, {});

            let result = '';

            editor.className       = TEST_ELEMENT_CLASS;
            editor.contentEditable = true;

            document.body.appendChild(editor);

            const onTextInput = function (e) {
                result += e.data;
            };

            document.addEventListener('textInput', onTextInput, true);
            document.addEventListener('textinput', onTextInput, true);

            type
                .run()
                .then(function () {
                    document.removeEventListener('textInput', onTextInput, true);
                    document.removeEventListener('textinput', onTextInput, true);
                    equal(result, text);
                    equal(editor.textContent, text.replace(' ', String.fromCharCode(160)));
                    startNext();
                });
        });
    }

    asyncTest('selection after mousedown should ignore single new line character', function () {

        function testWithWhiteSpaceStyle (whiteSpace) {
            const editor = document.createElement('div');
            const span   = document.createElement('span');
            const type   = new TypeAutomation(editor, 'Hello World', {});

            editor.className        = TEST_ELEMENT_CLASS;
            editor.style.whiteSpace = whiteSpace;
            editor.contentEditable  = true;
            span.innerHTML          = String.fromCharCode(10);

            editor.appendChild(span);
            document.body.appendChild(editor);

            const onSelectionChange = function () {
                equal(document.getSelection().anchorOffset, 0);
                document.removeEventListener('selectionchange', onSelectionChange, true);
            };

            document.addEventListener('selectionchange', onSelectionChange, true);

            return type
                .run()
                .then(function () {
                    equal(editor.textContent, 'Hello' + String.fromCharCode(160) + 'World\n', 'white-space: ' + whiteSpace);
                    removeTestElements();
                    document.getSelection().removeAllRanges();
                    return;
                });
        }

        testWithWhiteSpaceStyle('pre')
            .then(function () {
                return testWithWhiteSpaceStyle('pre-wrap');
            })
            .then(function () {
                return testWithWhiteSpaceStyle('pre-line');
            })
            .then(function () {
                startNext();
            });
    });
});
