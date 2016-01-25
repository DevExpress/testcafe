var hammerhead   = window.getTestCafeModule('hammerhead');
var browserUtils = hammerhead.utils.browser;

var testCafeCore = window.getTestCafeModule('testCafeCore');
var domUtils     = testCafeCore.get('./utils/dom');

var testCafeRunner         = window.getTestCafeModule('testCafeRunner');
var automation             = testCafeRunner.get('./automation/automation');
var typePlaybackAutomation = testCafeRunner.get('./automation/playback/type');

automation.init();

$(document).ready(function () {
    //consts
    var TEST_ELEMENT_CLASS = 'testElement';

    var firstElementInnerHTML  = null,
        secondElementInnerHTML = null,
        thirdElementInnerHTML  = null;

    $('body').css('height', 1500).attr('contenteditable', 'true');

    var startNext = function () {
        if (browserUtils.isIE) {
            removeTestElements();
            window.setTimeout(start, 30);
        }
        else
            start();
    };

    var removeTestElements = function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
    };

    var checkSelection = function ($el, startNode, startOffset, endNode, endOffset) {
        var curDocument = domUtils.findDocument($el[0]),
            selection   = curDocument.getSelection();
        equal(domUtils.getActiveElement(), $el[0]);
        ok(domUtils.isTheSameNode(startNode, selection.anchorNode), 'startNode correct');
        equal(selection.anchorOffset, startOffset, 'startOffset correct');
        ok(domUtils.isTheSameNode(endNode, selection.focusNode), 'endNode correct');
        equal(selection.focusOffset, endOffset, 'endOffset correct');
    };

    var setInnerHTML = function ($el, innerHTML) {
        window.setProperty($el[0], 'innerHTML', innerHTML);
    };

    var stateHelper = {
        isStateSaved: function () {
            return firstElementInnerHTML;
        },
        saveState:    function () {
            firstElementInnerHTML  = $('#1')[0].innerHTML;
            secondElementInnerHTML = $('#2')[0].innerHTML;
            thirdElementInnerHTML  = $('#3')[0].innerHTML;
        },
        restoreState: function () {
            var curActiveElement = domUtils.getActiveElement(),
                curDocument      = domUtils.findDocument(curActiveElement);

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
        var $body      = $('body'),
            $el        = $('#2').find('p:first'),

            node       = $el[0].childNodes[0],
            nodeValue  = node.nodeValue,

            typingText = '123 test';

        $body.focus();
        equal(document.activeElement, $body[0]);

        window.async.series({
            'Type in child of body with contenteditable attribute': function (callback) {
                typePlaybackAutomation($el[0], typingText, {}, function () {
                    callback();
                });
            },

            'Check result of typing': function () {
                equal(document.activeElement, $body[0]);
                checkSelection($body, node, nodeValue.length + typingText.length, node, nodeValue.length +
                                                                                        typingText.length);
                equal($('#2').find('p:first')[0].childNodes[0].nodeValue, nodeValue +
                                                                          typingText.replace(' ', String.fromCharCode(160)), 'typing must be in the end of element from a parameter of act.type');
                startNext();

            }
        });
    });
});
