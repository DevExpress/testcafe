var hammerhead   = window.getTestCafeModule('hammerhead');
var browserUtils = hammerhead.utils.browser;

var testCafeCore      = window.getTestCafeModule('testCafeCore');
var textSelection     = testCafeCore.get('./utils/text-selection');
var contentEditable   = testCafeCore.get('./utils/content-editable');
var domUtils          = testCafeCore.get('./utils/dom');
var parseKeySequence  = testCafeCore.get('./utils/parse-key-sequence');

var testCafeAutomation   = window.getTestCafeModule('testCafeAutomation');
var TypeAutomation       = testCafeAutomation.Type;
var SelectTextAutomation = testCafeAutomation.SelectText;
var PressAutomation      = testCafeAutomation.Press;

var TypeOptions = testCafeAutomation.get('../../test-run/commands/options').TypeOptions;

testCafeCore.preventRealEvents();


$(document).ready(function () {
    //consts
    var TEST_ELEMENT_CLASS = 'testElement';

    var $el                     = null;
    var $parent                 = null;
    var firstElementInnerHTML   = null;
    var secondElementInnerHTML  = null;
    var thirdElementInnerHTML   = null;
    var fourthElementInnerHTML  = null;
    var fifthElementInnerHTML   = null;
    var sixthElementInnerHTML   = null;
    var seventhElementInnerHTML = null;

    $('body').css('height', 1500);

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
            if (firstElementInnerHTML) {
                setInnerHTML($('#1'), firstElementInnerHTML);
                setInnerHTML($('#2'), secondElementInnerHTML);
                setInnerHTML($('#3'), thirdElementInnerHTML);
                setInnerHTML($('#4'), fourthElementInnerHTML);
                setInnerHTML($('#5'), fifthElementInnerHTML);
                setInnerHTML($('#6'), sixthElementInnerHTML);
                setInnerHTML($('#7'), seventhElementInnerHTML);
            }
        }
    };

    var getRealCaretPosition = function ($element, node, offset) {
        var currentOffset = 0;
        var find          = false;

        function checkChildNodes (target) {
            var childNodes = target.childNodes;

            if (find)
                return currentOffset;

            if (domUtils.isTheSameNode(node, target)) {
                find = true;
                return currentOffset + offset;
            }

            if (!childNodes.length && target.nodeValue && target.nodeValue.length)
                currentOffset += target.nodeValue.length;

            $.each(childNodes, function (index, value) {
                currentOffset = checkChildNodes(value);
            });

            return currentOffset;
        }

        return checkChildNodes($element[0]);
    };

    var getElementTextWithoutSelection = function ($element, text) {
        var curDocument = domUtils.findDocument($element[0]);
        var sel         = curDocument.getSelection();
        var startNode   = sel.anchorNode;
        var startOffset = sel.anchorOffset;
        var endNode     = sel.focusNode;
        var endOffset   = sel.focusOffset;

        var elementText = $element.text();

        var start = getRealCaretPosition($element, startNode, startOffset);
        var end   = getRealCaretPosition($element, endNode, endOffset);

        if (!browserUtils.isIE && textSelection.hasInverseSelection($element[0]))
            return elementText.substring(0, end) + text + elementText.substring(start);

        return elementText.substring(0, start) + text + elementText.substring(end);
    };

    var runPressAutomation = function (keys, callback) {
        var pressAutomation = new PressAutomation(parseKeySequence(keys).combinations, {});

        pressAutomation
            .run()
            .then(callback);
    };

    var runSelectAutomation = function (element, startPos, endPos, callback) {
        var selectTextAutomation = new SelectTextAutomation(element, startPos, endPos, {});

        selectTextAutomation
            .run()
            .then(callback);
    };

    var runTypeAutomation = function (element, text, options, callback) {
        var typeOptions    = new TypeOptions(options);
        var typeAutomation = new TypeAutomation(element, text, typeOptions);

        typeAutomation
            .run()
            .then(callback);
    };

    QUnit.testStart(function () {
        //before first test save page state
        if (!stateHelper.isStateSaved())
            stateHelper.saveState();
    });

    QUnit.testDone(function () {
        $el     = null;
        $parent = null;

        stateHelper.restoreState();

        if (!browserUtils.isIE)
            removeTestElements();
    });

    //tests
    module('selection and typing');

    asyncTest('select from middle of node1 to middle node2 and typing', function () {
        var nodeValue      = null;
        var newElementText = null;
        var text           = '123';

        $el = $('#4');

        window.async.series({
            'Select': function (callback) {
                runSelectAutomation($el[0], 15, 151, callback);
            },

            'Check selection': function (callback) {
                checkSelection($el, $el[0].childNodes[1].childNodes[0], 10, $el[0].childNodes[5].childNodes[4].childNodes[0], 2);
                callback();
            },

            'Type in element': function (callback) {
                newElementText = getElementTextWithoutSelection($el, text);
                nodeValue      = $el[0].childNodes[1].childNodes[0].nodeValue;

                runTypeAutomation($el[0], text, {
                    caretPos: 15
                }, callback);
            },

            'Check typing': function () {
                if (!browserUtils.isIE || browserUtils.version > 11) {
                    checkSelection($el, $el[0].childNodes[1].childNodes[0], 13, $el[0].childNodes[1].childNodes[0], 13);
                    equal($el[0].childNodes[1].childNodes[0].nodeValue, nodeValue.substring(0, 10) + text);
                }
                else {
                    checkSelection($el, $el[0].childNodes[2].childNodes[0].childNodes[0], text.length, $el[0].childNodes[2].childNodes[0].childNodes[0], text.length);
                    equal($el[0].childNodes[2].childNodes[0].childNodes[0].nodeValue, text + 's');
                }

                equal($el.text(), newElementText);
                startNext();
            }
        });
    });

    asyncTest('select from start of node1 to middle node2 and typing', function () {
        var newElementText = null;
        var text           = '123';

        $el = $('#4');

        window.async.series({
            'Select': function (callback) {
                runSelectAutomation($el[0], 112, 186, callback);
            },

            'Check selection': function (callback) {
                checkSelection($el, $el[0].childNodes[3].childNodes[0], 0, $el[0].childNodes[8].childNodes[0], 2);
                callback();
            },

            'Type in element': function (callback) {
                newElementText = getElementTextWithoutSelection($el, text);

                runTypeAutomation($el[0], text, {
                    caretPos: 112
                }, callback);
            },

            'Check typing': function () {
                if (!browserUtils.isIE || browserUtils.version > 11) {
                    checkSelection($el, $el[0].childNodes[3].childNodes[0], text.length, $el[0].childNodes[3].childNodes[0], text.length);
                    equal($el[0].childNodes[3].childNodes[0].nodeValue, text);
                }
                else {
                    checkSelection($el, $el[0].childNodes[4].childNodes[0], text.length, $el[0].childNodes[4].childNodes[0], text.length);
                    equal($el[0].childNodes[4].childNodes[0].nodeValue, text + 'P');
                }

                equal($el.text(), newElementText);
                startNext();
            }
        });
    });

    asyncTest('select from middle of node1 to start node2 and typing (inverse)', function () {
        var newElementText = null;
        var text           = '123';

        $el = $('#4');

        window.async.series({
            'Select': function (callback) {
                runSelectAutomation($el[0], 186, 112, callback);
            },

            'Check selection': function (callback) {
                if (!browserUtils.isIE) {
                    checkSelection($el, $el[0].childNodes[8].childNodes[0], 2, $el[0].childNodes[3].childNodes[0], 0);
                    equal(textSelection.hasInverseSelection($el[0]), true, 'selection direction correct');
                }
                else
                    checkSelection($el, $el[0].childNodes[3].childNodes[0], 0, $el[0].childNodes[8].childNodes[0], 2);
                callback();
            },

            'Type in element': function (callback) {
                newElementText = getElementTextWithoutSelection($el, text);
                runTypeAutomation($el[0], text, {
                    caretPos: 112
                }, callback);
            },

            'Check typing': function () {
                if (browserUtils.isChrome && browserUtils.version > 57 || browserUtils.isFirefox || browserUtils.isIE && browserUtils.version > 11) {
                    checkSelection($el, $el[0].childNodes[3].childNodes[0], text.length, $el[0].childNodes[3].childNodes[0], text.length);
                    equal($el[0].childNodes[3].childNodes[0].nodeValue, text);
                }
                else {
                    checkSelection($el, $el[0].childNodes[4].childNodes[0], text.length, $el[0].childNodes[4].childNodes[0], text.length);
                    equal($el[0].childNodes[4].childNodes[0].nodeValue, text + 'P');
                }
                equal($el.text(), newElementText);

                startNext();
            }
        });
    });

    asyncTest('select from end of node1 to middle node2 and typing', function () {
        var nodeValue      = null;
        var newElementText = null;
        var text           = '123';

        $el = $('#4');

        window.async.series({
            'Select': function (callback) {
                runSelectAutomation($el[0], 124, 186, callback);
            },

            'Check selection': function (callback) {
                if (browserUtils.isSafari)
                    nodeValue = $el[0].childNodes[3].childNodes[0].nodeValue;
                else if (browserUtils.isFirefox || browserUtils.isWebKit ||
                         browserUtils.isIE && browserUtils.version > 11)
                    nodeValue = $el[0].childNodes[4].nodeValue;
                else
                    nodeValue = $el[0].childNodes[3].childNodes[0].nodeValue;

                if (browserUtils.isSafari)
                    nodeValue = $el[0].childNodes[3].childNodes[0].nodeValue;

                checkSelection($el, $el[0].childNodes[4], 6, $el[0].childNodes[8].childNodes[0], 2);
                callback();
            },

            'Type in element': function (callback) {
                newElementText = getElementTextWithoutSelection($el, text);
                runTypeAutomation($el[0], text, {
                    caretPos: 124
                }, callback);
            },

            'Check typing': function () {
                if (browserUtils.isSafari) {
                    checkSelection($el, $el[0].childNodes[3].childNodes[0],
                        6 + text.length, $el[0].childNodes[3].childNodes[0], 6 + text.length);

                    equal($el[0].childNodes[3].childNodes[0].nodeValue, nodeValue + text);
                }
                else if (browserUtils.isFirefox || browserUtils.isWebKit ||
                         browserUtils.isIE && browserUtils.version > 11) {
                    checkSelection($el, $el[0].childNodes[4], 6 + text.length, $el[0].childNodes[4], 6 +
                                                                                                     text.length);
                    equal($el[0].childNodes[4].nodeValue, nodeValue + text);
                }
                else {
                    checkSelection($el, $el[0].childNodes[5].childNodes[0], text.length,
                        $el[0].childNodes[5].childNodes[0], text.length);
                    equal($el[0].childNodes[5].childNodes[0].nodeValue, text + 'P');
                }
                equal($el.text().replace(/\s/g, ''), $.trim(newElementText).replace(/\s/g, ''));

                startNext();
            }
        });
    });

    asyncTest('select from middle of node1 to end node2 and typing (inverse)', function () {
        var nodeValue      = null;
        var newElementText = null;
        var text           = '123';

        $el = $('#4');

        window.async.series({
            'Select': function (callback) {
                runSelectAutomation($el[0], 186, 124, callback);
            },

            'Check selection': function (callback) {
                nodeValue = browserUtils.isFirefox || browserUtils.isIE && browserUtils.version > 11 || browserUtils.isChrome && browserUtils.version > 57
                    ? $el[0].childNodes[4].nodeValue
                    : $el[0].childNodes[5].childNodes[0].nodeValue;

                if (!browserUtils.isIE) {
                    checkSelection($el, $el[0].childNodes[8].childNodes[0], 2, $el[0].childNodes[4], 6);
                    equal(textSelection.hasInverseSelection($el[0]), true, 'selection direction correct');
                }
                else
                    checkSelection($el, $el[0].childNodes[4], 6, $el[0].childNodes[8].childNodes[0], 2);
                callback();
            },

            'Type in element': function (callback) {
                newElementText = getElementTextWithoutSelection($el, text);

                runTypeAutomation($el[0], text, {
                    caretPos: 124
                }, callback);
            },

            'Check typing': function () {
                if (!(browserUtils.isChrome && browserUtils.version > 57) && !browserUtils.isFirefox && !(browserUtils.isIE && browserUtils.version > 11)) {
                    checkSelection($el, $el[0].childNodes[5].childNodes[0], text.length, $el[0].childNodes[5].childNodes[0], text.length);
                    equal($el[0].childNodes[5].childNodes[0].nodeValue, text + 'P');
                }
                else {
                    checkSelection($el, $el[0].childNodes[4], 6 + text.length, $el[0].childNodes[4], 6 +
                                                                                                     text.length);
                    equal($el[0].childNodes[4].nodeValue, nodeValue + text);
                }
                equal($el.text().replace(/\s/g, ''), $.trim(newElementText).replace(/\s/g, ''));
                startNext();
            }
        });
    });

    asyncTest('select from start of node1 to end node2 and typing', function () {
        var newElementText = null;
        var text           = '123';

        $el = $('#4');

        window.async.series({
            'Select': function (callback) {
                runSelectAutomation($el[0], 112, 187, callback);
            },

            'Check selection': function (callback) {
                checkSelection($el, $el[0].childNodes[3].childNodes[0], 0, $el[0].childNodes[8].childNodes[0], 3);
                callback();
            },

            'Type in element': function (callback) {
                newElementText = getElementTextWithoutSelection($el, text);

                runTypeAutomation($el[0], text, {
                    caretPos: 112
                }, callback);
            },

            'Check typing': function () {
                if (browserUtils.isIE && browserUtils.version <= 11) {
                    checkSelection($el, $el[0].childNodes[4].childNodes[0], text.length, $el[0].childNodes[4].childNodes[0], text.length);
                    equal($el[0].childNodes[4].childNodes[0].nodeValue, text);
                }
                else {
                    checkSelection($el, $el[0].childNodes[3].childNodes[0], text.length, $el[0].childNodes[3].childNodes[0], text.length);
                    equal($el[0].childNodes[3].childNodes[0].nodeValue, text);
                }
                equal($el.text().replace(/\s/g, ''), $.trim(newElementText).replace(/\s/g, ''));

                startNext();
            }
        });
    });

    asyncTest('select from end of node1 to start node2 and typing', function () {
        var nodeValue      = null;
        var newElementText = null;
        var text           = '123';

        $el = $('#4');

        window.async.series({
            'Select': function (callback) {
                runSelectAutomation($el[0], 124, 184, callback);
            },

            'Check selection': function (callback) {
                nodeValue = browserUtils.isIE && browserUtils.version <=
                                                 11 ? $el[0].childNodes[8].childNodes[0].nodeValue : $el[0].childNodes[4].nodeValue;
                if (browserUtils.isFirefox || browserUtils.isIE || browserUtils.isChrome && browserUtils.version > 57)
                    checkSelection($el, $el[0].childNodes[4], 6, $el[0].childNodes[8].childNodes[0], 0);
                else
                    checkSelection($el, $el[0].childNodes[4], 6, $el[0].childNodes[8], 0);

                callback();
            },

            'Type in element': function (callback) {
                newElementText = getElementTextWithoutSelection($el, text);

                runTypeAutomation($el[0], text, {
                    caretPos: 124
                }, callback);
            },

            'Check typing': function () {
                if (browserUtils.isIE && browserUtils.version <= 11) {
                    checkSelection($el, $el[0].childNodes[5].childNodes[0], text.length, $el[0].childNodes[5].childNodes[0], text.length);
                    equal($el[0].childNodes[5].childNodes[0].nodeValue, text + nodeValue);
                }
                else {
                    checkSelection($el, $el[0].childNodes[4], 6 + text.length, $el[0].childNodes[4], 6 +
                                                                                                     text.length);
                    equal($el[0].childNodes[4].nodeValue, nodeValue + text);
                }
                equal($el.text().replace(/\s/g, ''), $.trim(newElementText).replace(/\s/g, ''));

                startNext();
            }
        });
    });

    asyncTest('select from start of node1 to start node2 and typing', function () {
        var nodeValue      = null;
        var newElementText = null;
        var text           = '123';

        $el = $('#4');

        window.async.series({
            'Select': function (callback) {
                runSelectAutomation($el[0], 112, 184, callback);
            },

            'Check selection': function (callback) {
                nodeValue = browserUtils.isIE ? $el[0].childNodes[8].childNodes[0].nodeValue : $el[0].childNodes[4].nodeValue;

                if (browserUtils.isFirefox || browserUtils.isIE || browserUtils.isChrome && browserUtils.version > 57)
                    checkSelection($el, $el[0].childNodes[3].childNodes[0], 0, $el[0].childNodes[8].childNodes[0], 0);
                else
                    checkSelection($el, $el[0].childNodes[3].childNodes[0], 0, $el[0].childNodes[8], 0);

                callback();
            },

            'Type in element': function (callback) {
                newElementText = getElementTextWithoutSelection($el, text);

                runTypeAutomation($el[0], text, {
                    caretPos: 112
                }, callback);
            },

            'Check typing': function () {
                if (browserUtils.isIE && browserUtils.version <= 11) {
                    checkSelection($el, $el[0].childNodes[4].childNodes[0], text.length, $el[0].childNodes[4].childNodes[0], text.length);
                    equal($el[0].childNodes[4].childNodes[0].nodeValue, text + nodeValue);
                }
                else {
                    checkSelection($el, $el[0].childNodes[3].childNodes[0], text.length, $el[0].childNodes[3].childNodes[0], text.length);
                    equal($el[0].childNodes[3].childNodes[0].nodeValue, text);
                }
                equal($el.text().replace(/\s/g, ''), $.trim(newElementText).replace(/\s/g, ''));

                startNext();
            }
        });
    });

    asyncTest('select from end of node1 to start node2 and typing', function () {
        var nodeValue      = null;
        var newElementText = null;
        var text           = '123';

        $el = $('#4');

        window.async.series({
            'Select': function (callback) {
                runSelectAutomation($el[0], 124, 187, callback);
            },

            'Check selection': function (callback) {
                nodeValue = browserUtils.isFirefox || browserUtils.isWebKit && !browserUtils.isSafari ||
                            browserUtils.isIE && browserUtils.version > 11
                    ? $el[0].childNodes[4].nodeValue
                    : $el[0].childNodes[3].childNodes[0].nodeValue;

                checkSelection($el, $el[0].childNodes[4], 6, $el[0].childNodes[8].childNodes[0], 3);
                callback();
            },

            'Type in element': function (callback) {
                newElementText = getElementTextWithoutSelection($el, text);

                runTypeAutomation($el[0], text, {
                    caretPos: 124
                }, callback);
            },

            'Check typing': function () {
                if (browserUtils.isIE && !(browserUtils.isIE && browserUtils.version > 11)) {
                    checkSelection($el, $el[0].childNodes[5].childNodes[0], text.length, $el[0].childNodes[5].childNodes[0], text.length);
                    equal($el[0].childNodes[5].childNodes[0].nodeValue, text);
                }
                else if (browserUtils.isFirefox || browserUtils.isWebKit && !browserUtils.isSafari ||
                         browserUtils.isIE && browserUtils.version > 11) {
                    checkSelection($el, $el[0].childNodes[4], 6 + text.length, $el[0].childNodes[4], 6 +
                                                                                                     text.length);
                    equal($el[0].childNodes[4].nodeValue, nodeValue + text);
                }
                else {
                    checkSelection($el, $el[0].childNodes[3].childNodes[0], 6 +
                                                                            text.length, $el[0].childNodes[3].childNodes[0], 6 +
                                                                                                                             text.length);
                    equal($el[0].childNodes[3].childNodes[0].nodeValue, nodeValue + text);
                }
                equal($el.text().replace(/\s/g, ''), $.trim(newElementText).replace(/\s/g, ''));

                startNext();
            }
        });
    });

    asyncTest('select with end on invisible node and typing', function () {
        var newElementText = null;
        var text           = '123';

        $parent = $('#4');
        $el     = $parent.find('p:nth(1)');

        window.async.series({
            'Select': function (callback) {
                runSelectAutomation($el[0], 1, 28, callback);
            },

            'Check selection': function (callback) {
                checkSelection($parent, $parent[0].childNodes[5].childNodes[0], 1, $parent[0].childNodes[5].childNodes[5], 1);
                callback();
            },

            'Type in element': function (callback) {
                newElementText = getElementTextWithoutSelection($el, text);

                runTypeAutomation($parent[0], text, {
                    caretPos: 126
                }, callback);
            },

            'Check typing': function () {
                if (browserUtils.isIE && browserUtils.version <= 11) {
                    checkSelection($parent, $parent[0].childNodes[5].childNodes[1],
                        text.length, $parent[0].childNodes[5].childNodes[1], text.length);
                }
                else {
                    checkSelection($parent, $parent[0].childNodes[5].childNodes[0],
                        1 + text.length, $parent[0].childNodes[5].childNodes[0], 1 + text.length);
                }

                equal($el.text().replace(/\s/g, ''), $.trim(newElementText).replace(/\s/g, ''));

                startNext();
            }
        });
    });

    asyncTest('select with start on invisible node and typing', function () {
        var nodeValue      = null;
        var newElementText = null;
        var text           = '123';

        $el = $('#4');

        window.async.series({
            'Select': function (callback) {
                runSelectAutomation($el[0], 152, 186, callback);
            },

            'Check selection': function (callback) {
                nodeValue = $el[0].childNodes[5].childNodes[4].childNodes[0].nodeValue;

                if (browserUtils.isFirefox || browserUtils.isIE || browserUtils.isChrome && browserUtils.version > 57)
                    checkSelection($el, $el[0].childNodes[5].childNodes[4].childNodes[0], 3, $el[0].childNodes[8].childNodes[0], 2);
                else
                    checkSelection($el, $el[0].childNodes[5].childNodes[5], 0, $el[0].childNodes[8].childNodes[0], 2);

                callback();
            },

            'Type in element': function (callback) {
                newElementText = getElementTextWithoutSelection($el, text);

                runTypeAutomation($el[0], text, {
                    caretPos: 152
                }, callback);
            },

            'Check typing': function () {
                if (browserUtils.isIE && browserUtils.version <= 11) {
                    checkSelection($el, $el[0].childNodes[6].childNodes[0], text.length, $el[0].childNodes[6].childNodes[0], text.length);
                    equal($el[0].childNodes[6].childNodes[0].nodeValue, text + 'P');
                }
                else {
                    checkSelection($el, $el[0].childNodes[5].childNodes[4].childNodes[0],
                        nodeValue.length + text.length, $el[0].childNodes[5].childNodes[4].childNodes[0],
                        nodeValue.length + text.length);

                    equal($el[0].childNodes[5].childNodes[4].childNodes[0].nodeValue, nodeValue + text);
                }

                equal($el.text().replace(/\s/g, ''), $.trim(newElementText).replace(/\s/g, ''));
                startNext();
            }
        });
    });

    asyncTest('select, press delete and typing', function () {
        $el = $('#4');

        var nodeValue     = $el[0].childNodes[1].childNodes[2].nodeValue;
        var nextNodeValue = $el[0].childNodes[10].childNodes[0].nodeValue;
        var text          = '123';

        window.async.series({
            'Select': function (callback) {
                runSelectAutomation($el[0], 41, 197, callback);
            },

            'Check selection': function (callback) {
                checkSelection($el, $el[0].childNodes[1].childNodes[2], 11, $el[0].childNodes[10].childNodes[0], 3);
                equal($el[0].childNodes[1].childNodes[2].nodeValue, nodeValue);
                callback();
            },

            'Press delete': function (callback) {
                runPressAutomation('delete', callback);
            },

            'Second check selection': function (callback) {
                equal($el[0].childNodes[1].childNodes[2].nodeValue, nodeValue.substring(0, 11));
                callback();
            },

            'Type in element': function (callback) {
                runTypeAutomation($el[0], text, {
                    caretPos: 41
                }, callback);
            },

            'Check typing': function () {
                //NOTE: we can not guarantee the exact position of selection after removal of content (after press 'delete', 'backspace' or etc.)
                var curDocument = domUtils.findDocument($el[0]);
                var selection   = curDocument.getSelection();

                if (!browserUtils.isIE9 || selection.anchorNode === $el[0].childNodes[1].childNodes[2]) {
                    checkSelection($el, $el[0].childNodes[1].childNodes[2],
                        11 + text.length, $el[0].childNodes[1].childNodes[2], 11 + text.length);

                    equal($el[0].childNodes[1].childNodes[2].nodeValue, nodeValue.substring(0, 11) + text);
                }
                else {
                    checkSelection($el, $el[0].childNodes[2].childNodes[0], text.length, $el[0].childNodes[2].childNodes[0], text.length);
                    equal($el[0].childNodes[2].childNodes[0].nodeValue, text + nextNodeValue.substring(3));
                }

                startNext();
            }
        });
    });

    asyncTest('select, press backspace and typing', function () {
        $parent = $('#6');
        $el     = $parent.find('i>code');

        var nodeValue        = $parent[0].childNodes[5].childNodes[0].nodeValue;
        var text             = '123';
        var currentSelection = null;

        window.async.series({
            'Select': function (callback) {
                runSelectAutomation($el[0], 0, 17, callback);
            },

            'Check selection': function (callback) {
                checkSelection($parent, $parent[0].childNodes[5].childNodes[1].childNodes[0], 0, $parent[0].childNodes[5].childNodes[1].childNodes[0], 17);
                equal($('#6')[0].childNodes[5].childNodes[0].nodeValue, nodeValue);
                callback();
            },

            'Press backspace': function (callback) {
                runPressAutomation('backspace', callback);
            },

            'Type in element': function (callback) {
                //NOTE: we can not guarantee the exact position of selection after removal of content (after press 'delete', 'backspace' or etc.)
                currentSelection = textSelection.getSelectionByElement($parent[0]);
                currentSelection = contentEditable.getSelection($parent[0], currentSelection, textSelection.hasInverseSelectionContentEditable($parent[0]));

                runTypeAutomation($parent[0], text, {
                    caretPos: 45
                }, callback);
            },

            'Check typing': function () {
                var $typedElement = $parent.find('i:first');

                checkSelection($parent, currentSelection.startPos.node,
                    currentSelection.startPos.offset + text.length, currentSelection.startPos.node,
                    currentSelection.startPos.offset + text.length);

                equal($typedElement.text().substring(0, 11), 'i el123b el');
                startNext();
            }
        });
    });

    asyncTest('select, press backspace and typing', function () {
        $parent = $('#6');
        $el     = $parent.find('i>code');

        var nodeValue        = $parent[0].childNodes[5].childNodes[0].nodeValue;
        var text             = '123';
        var currentSelection = null;

        window.async.series({
            'Select': function (callback) {
                runSelectAutomation($el[0], 0, 17, callback);
            },

            'Check selection': function (callback) {
                checkSelection($parent, $parent[0].childNodes[5].childNodes[1].childNodes[0], 0, $parent[0].childNodes[5].childNodes[1].childNodes[0], 17);
                equal($('#6')[0].childNodes[5].childNodes[0].nodeValue, nodeValue);
                callback();
            },

            'Press backspace': function (callback) {
                runPressAutomation('backspace', callback);
            },

            'Type in element': function (callback) {
                //NOTE: we can not guarantee the exact position of selection after removal of content (after press 'delete', 'backspace' or etc.)
                currentSelection = textSelection.getSelectionByElement($parent[0]);
                currentSelection = contentEditable.getSelection($parent[0], currentSelection, textSelection.hasInverseSelectionContentEditable($parent[0]));

                runTypeAutomation($parent[0], text, {
                    caretPos: 45
                }, callback);
            },

            'Check typing': function () {
                var $typedElement = $parent.find('i:first');

                checkSelection($parent, currentSelection.startPos.node,
                    currentSelection.startPos.offset + text.length, currentSelection.startPos.node,
                    currentSelection.startPos.offset + text.length);

                equal($typedElement.text().substring(0, 11), 'i el123b el');
                //var node = $parent[0].childNodes[5].childNodes[0];
                //checkSelection($parent, node, node.nodeValue.length, node, node.nodeValue.length);
                // equal($parent[0].childNodes[5].childNodes[0].nodeValue, nodeValue + text);
                startNext();
            }
        });
    });

    asyncTest('select (inverse), press left and typing', function () {
        $el = $('#4');

        var startNode      = $el[0].childNodes[1].childNodes[2];
        var startOffset    = 11;
        var endNode        = $el[0].childNodes[10].childNodes[0];
        var endOffset      = 3;
        var startNodeValue = startNode.nodeValue;
        var endNodeValue   = endNode.nodeValue;
        var text           = '123';

        window.async.series({
            'Select': function (callback) {
                runSelectAutomation($el[0], 197, 41, callback);
            },

            'Check selection': function (callback) {
                if (!browserUtils.isIE) {
                    checkSelection($el, endNode, endOffset, startNode, startOffset);
                    equal(textSelection.hasInverseSelection($el[0]), true, 'selection direction correct');
                }
                else
                    checkSelection($el, startNode, startOffset, endNode, endOffset);

                equal(startNode.nodeValue, startNodeValue);
                equal(endNode.nodeValue, endNodeValue);

                callback();
            },

            'Press left': function (callback) {
                runPressAutomation('left', callback);
            },

            'Second check selection': function (callback) {
                checkSelection($el, startNode, startOffset, startNode, startOffset);
                equal(startNode.nodeValue, startNodeValue);
                equal(endNode.nodeValue, endNodeValue);

                callback();
            },

            'Type in element': function (callback) {
                runTypeAutomation($el[0], text, {
                    caretPos: 41
                }, callback);
            },

            'Check typing': function () {
                checkSelection($el, startNode, startOffset + text.length, startNode, startOffset + text.length);

                equal(startNode.nodeValue, startNodeValue.substring(0, startOffset) + text +
                                           startNodeValue.substring(startOffset));

                startNext();
            }
        });
    });

    asyncTest('select (inverse), press right and typing', function () {
        $el = $('#4');

        var startNode      = $el[0].childNodes[1].childNodes[2];
        var startOffset    = 11;
        var endNode        = $el[0].childNodes[10].childNodes[0];
        var endOffset      = 3;
        var startNodeValue = startNode.nodeValue;
        var endNodeValue   = endNode.nodeValue;
        var text           = '123';

        window.async.series({
            'Select': function (callback) {
                runSelectAutomation($el[0], 197, 41, callback);
            },

            'Check selection': function (callback) {
                if (!browserUtils.isIE) {
                    checkSelection($el, endNode, endOffset, startNode, startOffset);
                    equal(textSelection.hasInverseSelection($el[0]), true, 'selection direction correct');
                }
                else
                    checkSelection($el, startNode, startOffset, endNode, endOffset);
                equal(startNode.nodeValue, startNodeValue);
                equal(endNode.nodeValue, endNodeValue);

                callback();
            },

            'Press left': function (callback) {
                runPressAutomation('right', callback);
            },

            'Second check selection': function (callback) {
                checkSelection($el, endNode, endOffset, endNode, endOffset);
                equal(startNode.nodeValue, startNodeValue);
                equal(endNode.nodeValue, endNodeValue);
                callback();
            },

            'Type in element': function (callback) {
                runTypeAutomation($el[0], text, {
                    caretPos: 197
                }, callback);
            },

            'Check typing': function () {
                checkSelection($el, endNode, endOffset + text.length, endNode, endOffset + text.length);

                equal(endNode.nodeValue, endNodeValue.substring(0, endOffset) + text +
                                         endNodeValue.substring(endOffset));
                startNext();
            }
        });
    });
});
