var hammerhead   = window.getTestCafeModule('hammerhead');
var browserUtils = hammerhead.utils.browser;

var testCafeCore  = window.getTestCafeModule('testCafeCore');
var textSelection = testCafeCore.get('./utils/text-selection');
var domUtils      = testCafeCore.get('./utils/dom');
var keyChar       = testCafeCore.get('./utils/key-char');

var testCafeRunner    = window.getTestCafeModule('testCafeRunner');
var automation        = testCafeRunner.get('./automation/automation');
var keyPressSimulator = testCafeRunner.get('./automation/playback/key-press-simulator');

automation.init();

$(document).ready(function () {
    //consts
    var TEST_ELEMENT_CLASS = 'testElement';

    //var
    var $el             = null,
        focusedElements = [];

    //utils
    var createTextInput = function (text, startSelection, endSelection, inverse) {
        var start = startSelection || text.length,
            end   = endSelection || start;
        $el       = $('<input type="text">').attr('id', 'input').addClass(TEST_ELEMENT_CLASS).appendTo('body').attr('value', text);
        $el[0].focus();
        nativeSelect($el[0], start, end, inverse);
        return $el[0];
    };

    var createTextarea = function (text, startSelection, endSelection, inverse, parent) {
        var start = startSelection || text.length,
            end   = endSelection || start;
        $el       = $('<textarea>').attr('id', 'textarea').addClass(TEST_ELEMENT_CLASS).appendTo((parent ||
                                                                                                  'body')).css('height', 200).attr('value', text);
        $el[0].focus();
        nativeSelect($el[0], start, end, inverse);
        return $el[0];
    };

    var nativeSelect = function (el, from, to, inverse) {
        var start = from || 0,
            end   = to;

        //NOTE: set to start position
        var startPosition = inverse ? end : start;
        if (el.setSelectionRange) {
            el.setSelectionRange(startPosition, startPosition);
        }
        else {
            el.selectionStart = startPosition;
            el.selectionEnd   = startPosition;
        }

        //NOTE: select
        if (el.setSelectionRange) {
            el.setSelectionRange(start, end, inverse ? 'backward' : 'forward');
        }
        else {
            el.selectionStart = start;
            el.selectionEnd   = end;
        }
    };

    var checkShortcut = function (element, value, selectionStart, selectionEnd, inverse) {
        var selectionEnd     = selectionEnd || selectionStart,
            activeElement    = domUtils.findDocument(element).activeElement,
            inverseSelection = textSelection.hasInverseSelection(activeElement);

        equal(activeElement, element, 'active element are correct');
        equal(activeElement.value, value, 'active element value are correct');
        equal(textSelection.getSelectionStart(activeElement), selectionStart, 'active element selection start are correct');
        equal(textSelection.getSelectionEnd(activeElement), selectionEnd, 'active element selection end are correct');

        ok(inverseSelection === (typeof inverse === 'undefined' ? false : inverse));
    };

    QUnit.testDone(function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
        $el = null;
    });

    //tests

    module('utils testing');
    test('getShortcutsByKeyCombination', function () {
        deepEqual(keyChar.getShortcutsByKeyCombination({ a: {} }, 'a'), ['a'], 'simple shortcut');
        deepEqual(keyChar.getShortcutsByKeyCombination({ 'ctrl+a': {} }, 'ctrl+a'), ['ctrl+a'], 'combined shortcut');
        deepEqual(keyChar.getShortcutsByKeyCombination({ 'a': {} }, 'b+a'), ['a'], 'symbol and simple shortcut');
        deepEqual(keyChar.getShortcutsByKeyCombination({ 'a': {} }, 'a+b'), ['a'], 'simple shortcut and symbol');
        deepEqual(keyChar.getShortcutsByKeyCombination({ 'ctrl+a': {} }, 'b+ctrl+a'), ['ctrl+a'], 'symbol and combined shortcut');
        deepEqual(keyChar.getShortcutsByKeyCombination({ 'ctrl+a': {} }, 'ctrl+a+b'), ['ctrl+a'], 'combined shortcut and symbol');
        deepEqual(keyChar.getShortcutsByKeyCombination({
            'ctrl+a': {},
            a:        {}
        }, 'a+ctrl+a'), ['a', 'ctrl+a'], 'simple shortcut and combined shortcut');
        deepEqual(keyChar.getShortcutsByKeyCombination({
            'ctrl+a': {},
            a:        {}
        }, 'ctrl+a+a'), ['ctrl+a', 'a'], 'combined shortcut and simple shortcut');
        deepEqual(keyChar.getShortcutsByKeyCombination({
            'ctrl+a': {},
            a:        {}
        }, 'ctrl+a+b+a'), ['ctrl+a', 'a'], 'combined shortcut, symbol and simple shortcut');
    });

    module('enter');

    asyncTest('press enter in input', function () {
        var text           = 'text',
            cursorPosition = 2,
            input          = createTextInput(text, cursorPosition);

        var callback = function () {
            checkShortcut(input, text, cursorPosition);
            start();
        };
        keyPressSimulator('enter', callback);
    });

    asyncTest('press enter in textarea', function () {
        var text           = 'text',
            cursorPosition = 2,
            textarea       = createTextarea(text, cursorPosition);

        var callback = function () {
            var newText = 'te\nxt';
            checkShortcut(textarea, newText, newText.indexOf('\n') + 1);
            start();
        };
        keyPressSimulator('enter', callback);
    });

    module('home');

    asyncTest('press home in input', function () {
        var text  = 'text',
            input = createTextInput(text, 2);

        var callback = function () {
            checkShortcut(input, text, 0);
            start();
        };
        keyPressSimulator('home', callback);
    });

    asyncTest('press home in textarea', function () {
        var text     = 'text\rarea',
            textarea = createTextarea(text, 7);

        var callback = function () {
            var newText = text.replace('\r', '\n');
            checkShortcut(textarea, newText, newText.indexOf('\n') + 1);
            start();
        };
        keyPressSimulator('home', callback);
    });

    asyncTest('press home with selection', function () {
        var text  = 'text',
            input = createTextInput(text, 2, text.length);

        var callback = function () {
            checkShortcut(input, text, 0);
            start();
        };
        keyPressSimulator('home', callback);
    });

    module('end');

    asyncTest('press end in input', function () {
        var text  = 'text',
            input = createTextInput(text, 2);

        var callback = function () {
            checkShortcut(input, text, text.length);
            start();
        };
        keyPressSimulator('end', callback);
    });

    asyncTest('press end in textarea', function () {
        var text     = 'text\rarea',
            textarea = createTextarea(text, 7);

        var callback = function () {
            var newText = text.replace('\r', '\n');
            checkShortcut(textarea, newText, newText.length);
            start();
        };
        keyPressSimulator('end', callback);
    });

    asyncTest('press end with selection', function () {
        var text  = 'text',
            input = createTextInput(text, 2, text.length);

        var callback = function () {
            checkShortcut(input, text, text.length);
            start();
        };
        keyPressSimulator('end', callback);
    });

    module('up');

    asyncTest('press up in input', function () {
        var text           = 'text',
            cursorPosition = 2,
            input          = createTextInput(text, cursorPosition);

        var callback = function () {
            if (!browserUtils.isWebKit)
                checkShortcut(input, text, cursorPosition);
            else
                checkShortcut(input, text, 0);
            start();
        };
        keyPressSimulator('up', callback);
    });

    asyncTest('press up in textarea', function () {
        var text     = 'text\rarea',
            textarea = createTextarea(text, 7);

        var callback = function () {
            var newText = text.replace('\r', '\n');
            checkShortcut(textarea, newText, 2);
            start();
        };
        keyPressSimulator('up', callback);
    });

    module('down');

    asyncTest('press down in input', function () {
        var text           = 'text',
            cursorPosition = 2,
            input          = createTextInput(text, cursorPosition);

        var callback = function () {
            if (!browserUtils.isWebKit)
                checkShortcut(input, text, cursorPosition);
            else
                checkShortcut(input, text, text.length);
            start();
        };
        keyPressSimulator('down', callback);
    });

    asyncTest('press down in textarea', function () {
        var text           = 'text\rarea',
            cursorPosition = 2,
            textarea       = createTextarea(text, cursorPosition);

        var callback = function () {
            var newText = text.replace('\r', '\n');
            checkShortcut(textarea, newText, newText.indexOf('\n') + cursorPosition + 1);
            start();
        };
        keyPressSimulator('down', callback);
    });

    module('left');

    asyncTest('press left in input', function () {
        var text           = 'text',
            cursorPosition = 2,
            input          = createTextInput(text, cursorPosition);

        var callback = function () {
            checkShortcut(input, text, cursorPosition - 1);
            start();
        };
        keyPressSimulator('left', callback);
    });

    asyncTest('press left in textarea', function () {
        var text              = 'text\rarea',
            textarea          = createTextarea(text, 7),
            oldSelectionStart = textSelection.getSelectionStart(textarea);

        var callback = function () {
            var newText = text.replace('\r', '\n');
            checkShortcut(textarea, newText, oldSelectionStart - 1);
            start();
        };
        keyPressSimulator('left', callback);
    });

    module('right');

    asyncTest('press right in input', function () {
        var text           = 'text',
            cursorPosition = 2,
            input          = createTextInput(text, cursorPosition);

        var callback = function () {
            checkShortcut(input, text, cursorPosition + 1);
            start();
        };
        keyPressSimulator('right', callback);
    });

    asyncTest('press right in textarea', function () {
        var text              = 'text\rarea',
            textarea          = createTextarea(text, 7),
            oldSelectionStart = textSelection.getSelectionStart(textarea);

        var callback = function () {
            var newText = text.replace('\r', '\n');
            checkShortcut(textarea, newText, oldSelectionStart + 1);
            start();
        };
        keyPressSimulator('right', callback);
    });

    module('backspace');

    asyncTest('press backspace in input', function () {
        var text           = 'text',
            cursorPosition = 2,
            input          = createTextInput(text, cursorPosition);

        var callback = function () {
            var newText = text.substring(0, cursorPosition - 1) + text.substring(cursorPosition);
            checkShortcut(input, newText, cursorPosition - 1);
            start();
        };
        keyPressSimulator('backspace', callback);
    });

    asyncTest('press backspace in textarea', function () {
        var text           = 'text\rarea',
            cursorPosition = 5,
            textarea       = createTextarea(text, cursorPosition);

        var callback = function () {
            var newText = text.replace('\r', '');
            checkShortcut(textarea, newText, cursorPosition - 1);
            start();
        };
        keyPressSimulator('backspace', callback);
    });

    module('delete');

    asyncTest('press delete in input', function () {
        var text           = 'text',
            cursorPosition = 2,
            input          = createTextInput(text, cursorPosition);

        var callback = function () {
            var newText = text.substring(0, cursorPosition) + text.substring(cursorPosition + 1);
            checkShortcut(input, newText, cursorPosition);
            start();
        };
        keyPressSimulator('delete', callback);
    });

    asyncTest('press delete in textarea', function () {
        var text           = 'text\rarea',
            cursorPosition = 4,
            textarea       = createTextarea(text, cursorPosition);

        var callback = function () {
            var newText = text.replace('\r', '');
            checkShortcut(textarea, newText, cursorPosition);
            start();
        };
        keyPressSimulator('delete', callback);
    });

    module('ctrl+a');

    asyncTest('press ctrl+a in input', function () {
        var text  = 'test',
            input = createTextInput(text, 2);

        var callback = function () {
            checkShortcut(input, text, 0, text.length);
            start();
        };
        keyPressSimulator('ctrl+a', callback);
    });

    asyncTest('press ctrl+a in textarea', function () {
        var text     = 'test\rarea',
            textarea = createTextarea(text, 2);

        var callback = function () {
            var newText = text.replace('\r', '\n');
            checkShortcut(textarea, newText, 0, newText.length);
            start();
        };
        keyPressSimulator('ctrl+a', callback);
    });

    asyncTest('B233976: Wrong recording key combination Ctrl+A and DELETE', function () {
        var text     = 'test\rarea',
            textarea = createTextarea(text, 2);

        var callback = function () {
            var newText = text.replace('\r', '\n');
            checkShortcut(textarea, newText, 0, newText.length);

            var deleteCallback = function () {
                checkShortcut(textarea, '', 0, 0);
                start();
            };
            keyPressSimulator('delete', deleteCallback);
        };
        keyPressSimulator('ctrl+a', callback);
    });

    asyncTest('press ctrl+a and backspace press in textarea', function () {
        var text     = 'test\rarea',
            textarea = createTextarea(text, 2);

        var callback = function () {
            var newText = text.replace('\r', '\n');
            checkShortcut(textarea, newText, 0, newText.length);

            var deleteCallback = function () {
                checkShortcut(textarea, '', 0, 0);
                start();
            };
            keyPressSimulator('backspace', deleteCallback);
        };
        keyPressSimulator('ctrl+a', callback);
    });

    module('test shortcut inside keys combination');

    asyncTest('press left+a in input', function () {
        var text  = '1',
            input = createTextInput(text, text.length);

        var callback = function () {
            checkShortcut(input, 'a1', 1);
            start();
        };
        keyPressSimulator('left+a', callback);
    });

    asyncTest('press a+left in input', function () {
        var text  = '1',
            input = createTextInput(text, text.length);

        var callback = function () {
            checkShortcut(input, '1a', 1);
            start();
        };
        keyPressSimulator('a+left', callback);
    });

    module('test keys combination of two shortcuts');

    asyncTest('press left+home in textarea', function () {
        var text     = 'test\rarea',
            textarea = createTextarea(text, 7);

        var callback = function () {
            var newText = text.replace('\r', '\n');
            checkShortcut(textarea, newText, newText.indexOf('\n') + 1);
            start();
        };
        keyPressSimulator('left+home', callback);
    });

    asyncTest('press home+left in textarea', function () {
        var text     = 'test\rarea',
            textarea = createTextarea(text, 7);

        var callback = function () {
            var newText = text.replace('\r', '\n');
            checkShortcut(textarea, newText, 4);
            start();
        };
        keyPressSimulator('home+left', callback);
    });

    module('shift+left');

    asyncTest('press shift+left in textarea without selection', function () {
        var text           = 'text\rarea',
            cursorPosition = 6,
            textarea       = createTextarea(text, cursorPosition);

        var callback = function () {
            var newText = text.replace('\r', '\n');
            checkShortcut(textarea, newText, cursorPosition - 4, cursorPosition, true);
            start();
        };
        keyPressSimulator('shift+left', function () {
            keyPressSimulator('shift+left', function () {
                keyPressSimulator('shift+left', function () {
                    keyPressSimulator('shift+left', callback);
                });
            });
        });
    });

    asyncTest('press shift+left in textarea with forward selection', function () {
        var text           = 'text\rare\rtest',
            startSelection = 7,
            endSelection   = 10,
            textarea       = createTextarea(text, startSelection, endSelection);

        var callback = function () {
            var newText = text.replace(/\r/g, '\n');
            checkShortcut(textarea, newText, 6, 7, true);
            start();
        };
        keyPressSimulator('shift+left', function () {
            keyPressSimulator('shift+left', function () {
                keyPressSimulator('shift+left', function () {
                    keyPressSimulator('shift+left', callback);
                });
            });
        });
    });

    asyncTest('press shift+left in textarea with backward selection', function () {
        var text           = 'text\rare\rtest',
            startSelection = 7,
            endSelection   = 10,
            textarea       = createTextarea(text, startSelection, endSelection, true);

        var callback = function () {
            var newText = text.replace(/\r/g, '\n');
            checkShortcut(textarea, newText, startSelection - 4, endSelection, true);
            start();
        };

        keyPressSimulator('shift+left', function () {
            keyPressSimulator('shift+left', function () {
                keyPressSimulator('shift+left', function () {
                    keyPressSimulator('shift+left', callback);
                });
            });
        });
    });

    module('shift+right');

    asyncTest('press shift+right in textarea without selection', function () {
        var text           = 'text\rarea',
            cursorPosition = 3,
            textarea       = createTextarea(text, cursorPosition);

        var callback = function () {
            var newText = text.replace('\r', '\n');
            checkShortcut(textarea, newText, cursorPosition, cursorPosition + 4);
            start();
        };
        keyPressSimulator('shift+right', function () {
            keyPressSimulator('shift+right', function () {
                keyPressSimulator('shift+right', function () {
                    keyPressSimulator('shift+right', callback);
                });
            });
        });
    });

    asyncTest('press shift+right in textarea with forward selection', function () {
        var text           = 'text\rarea\rtest',
            startSelection = 3,
            endSelection   = 7,
            textarea       = createTextarea(text, startSelection, endSelection);

        var callback = function () {
            var newText = text.replace(/\r/g, '\n');
            checkShortcut(textarea, newText, startSelection, 11);
            start();
        };
        keyPressSimulator('shift+right', function () {
            keyPressSimulator('shift+right', function () {
                keyPressSimulator('shift+right', function () {
                    keyPressSimulator('shift+right', callback);
                });
            });
        });
    });

    asyncTest('press shift+right in textarea with backward selection', function () {
        var text           = 'text\rare\rtest',
            startSelection = 2,
            endSelection   = 12,
            textarea       = createTextarea(text, startSelection, endSelection, true);

        var callback = function () {
            var newText = text.replace(/\r/g, '\n');
            checkShortcut(textarea, newText, startSelection + 4, endSelection, true);
            start();
        };
        keyPressSimulator('shift+right', function () {
            keyPressSimulator('shift+right', function () {
                keyPressSimulator('shift+right', function () {
                    keyPressSimulator('shift+right', callback);
                });
            });
        });
    });

    module('shift+up');

    asyncTest('press shift+up in input', function () {
        var text           = 'text',
            cursorPosition = 2,
            input          = createTextInput(text, cursorPosition);

        var callback = function () {
            if (!browserUtils.isWebKit)
                checkShortcut(input, text, cursorPosition);
            else
                checkShortcut(input, text, 0, cursorPosition, true);
            start();
        };
        keyPressSimulator('shift+up', callback);
    });

    asyncTest('press shift+up in textarea without selection', function () {
        var text           = 'text\rarea',
            cursorPosition = 7,
            textarea       = createTextarea(text, cursorPosition);

        var callback = function () {
            var newText = text.replace('\r', '\n');

            checkShortcut(textarea, newText, cursorPosition - 5, cursorPosition, true);
            start();
        };

        keyPressSimulator('shift+up', callback);
    });

    asyncTest('press shift+up in textarea with forward selection', function () {
        var text           = 'aaaa\rbbbb\rcccc',
            startSelection = 8,
            endSelection   = 12,
            textarea       = createTextarea(text, startSelection, endSelection);

        var callback = function () {
            var newText = text.replace(/\r/g, '\n');
            checkShortcut(textarea, newText, startSelection - 1, startSelection, true);
            start();
        };

        keyPressSimulator('shift+up', callback);
    });

    asyncTest('press shift+right in textarea with backward selection', function () {
        var text           = 'aaaa\rbbbb\rcccc',
            startSelection = 8,
            endSelection   = 12,
            textarea       = createTextarea(text, startSelection, endSelection, true);

        var callback = function () {
            var newText = text.replace(/\r/g, '\n');

            checkShortcut(textarea, newText, startSelection - 5, endSelection, true);
            start();
        };
        keyPressSimulator('shift+up', callback);
    });

    module('shift+down');

    asyncTest('press shift+down in input', function () {
        var text           = 'text',
            cursorPosition = 2,
            input          = createTextInput(text, cursorPosition);

        var callback = function () {
            if (!browserUtils.isWebKit)
                checkShortcut(input, text, cursorPosition);
            else
                checkShortcut(input, text, cursorPosition, text.length);
            start();
        };
        keyPressSimulator('shift+down', callback);
    });

    asyncTest('press shift+down in textarea without selection', function () {
        var text           = 'text\rarea',
            cursorPosition = 2,
            textarea       = createTextarea(text, cursorPosition);

        var callback = function () {
            var newText = text.replace('\r', '\n');

            checkShortcut(textarea, newText, cursorPosition, cursorPosition + 5);
            start();
        };

        keyPressSimulator('shift+down', callback);
    });

    asyncTest('press shift+down in textarea with forward selection', function () {
        var text           = 'aaaa\rbbbb\rcccc',
            startSelection = 3,
            endSelection   = 8,
            textarea       = createTextarea(text, startSelection, endSelection);

        var callback = function () {
            var newText = text.replace(/\r/g, '\n');
            checkShortcut(textarea, newText, startSelection, endSelection + 5);
            start();
        };

        keyPressSimulator('shift+down', callback);
    });

    asyncTest('press shift+down in textarea with backward selection', function () {
        var text           = 'aaaa\rbbbb\rcccc',
            startSelection = 8,
            endSelection   = 12,
            textarea       = createTextarea(text, startSelection, endSelection, true);

        var callback = function () {
            var newText = text.replace(/\r/g, '\n');

            checkShortcut(textarea, newText, endSelection, startSelection + 5);
            start();
        };
        keyPressSimulator('shift+down', callback);
    });

    module('shift+home');

    asyncTest('press shift+home in input', function () {
        var text  = 'text',
            input = createTextInput(text, 2);

        var callback = function () {
            checkShortcut(input, text, 0, 2, true);
            start();
        };
        keyPressSimulator('shift+home', callback);
    });

    asyncTest('press shift+home in textarea without selection', function () {
        var text           = 'text\rarea',
            cursorPosition = 7,
            textarea       = createTextarea(text, cursorPosition);

        var callback = function () {
            var newText = text.replace('\r', '\n');
            checkShortcut(textarea, newText, newText.indexOf('\n') + 1, cursorPosition, true);
            start();
        };
        keyPressSimulator('shift+home', callback);
    });

    asyncTest('press shift+home in textarea with forward selection', function () {
        var text          = 'text\rarea',
            startPosition = 7,
            endPosition   = 8,
            textarea      = createTextarea(text, startPosition, endPosition);

        var callback = function () {
            var newText = text.replace('\r', '\n');
            checkShortcut(textarea, newText, newText.indexOf('\n') + 1, startPosition, true);
            start();
        };
        keyPressSimulator('shift+home', callback);
    });

    asyncTest('press shift+home in textarea with backward selection', function () {
        var text          = 'text\rarea',
            startPosition = 7,
            endPosition   = 8,
            textarea      = createTextarea(text, startPosition, endPosition, true);

        var callback = function () {
            var newText = text.replace('\r', '\n');
            checkShortcut(textarea, newText, newText.indexOf('\n') + 1, endPosition, true);
            start();
        };
        keyPressSimulator('shift+home', callback);
    });

    module('shift+end');

    asyncTest('press shift+end in input', function () {
        var text  = 'text',
            input = createTextInput(text, 2);

        var callback = function () {
            checkShortcut(input, text, 2, 4);
            start();
        };
        keyPressSimulator('shift+end', callback);
    });

    asyncTest('press shift+end in textarea without selection', function () {
        var text           = 'text\rarea',
            cursorPosition = 7,
            textarea       = createTextarea(text, cursorPosition);

        var callback = function () {
            var newText = text.replace('\r', '\n');
            checkShortcut(textarea, newText, cursorPosition, text.length);
            start();
        };
        keyPressSimulator('shift+end', callback);
    });

    asyncTest('press shift+end in textarea with forward selection', function () {
        var text          = 'text\rarea',
            startPosition = 7,
            endPosition   = 8,
            textarea      = createTextarea(text, startPosition, endPosition);

        var callback = function () {
            var newText = text.replace('\r', '\n');
            checkShortcut(textarea, newText, startPosition, text.length);
            start();
        };
        keyPressSimulator('shift+end', callback);
    });

    asyncTest('press shift+end in textarea with backward selection', function () {
        var text          = 'text\rarea',
            startPosition = 7,
            endPosition   = 8,
            textarea      = createTextarea(text, startPosition, endPosition, true);

        var callback = function () {
            var newText = text.replace('\r', '\n');
            checkShortcut(textarea, newText, endPosition, text.length);
            start();
        };
        keyPressSimulator('shift+end', callback);
    });

    module('Resression tests. B238614 ');

    asyncTest('Incorrectly selection reproduce (left)', function () {
        var text          = 'input',
            startPosition = 2,
            endPosition   = 4,
            input         = createTextInput(text, startPosition, endPosition);

        var callback = function () {
            checkShortcut(input, text, startPosition, startPosition);
            start();
        };

        keyPressSimulator('left', callback);
    });

    asyncTest('Incorrectly selection reproduce (right)', function () {
        var text          = 'input',
            startPosition = 2,
            endPosition   = 4,
            input         = createTextInput(text, startPosition, endPosition);

        var callback = function () {
            checkShortcut(input, text, endPosition, endPosition);
            start();
        };

        keyPressSimulator('right', callback);
    });

    module('Resression tests.');

    //B238809 - Wrong playback test with shift+home/shift+end shortcuts in multiline textarea.
    asyncTest('B238809. Press shift+home in textarea with forward multiline selection', function () {
        var text          = 'text\rarea',
            startPosition = 2,
            endPosition   = 7,
            textarea      = createTextarea(text, startPosition, endPosition);

        var callback = function () {
            var newText = text.replace('\r', '\n');
            checkShortcut(textarea, newText, startPosition, newText.indexOf('\n') + 1, false);
            start();
        };
        keyPressSimulator('shift+home', callback);
    });

    asyncTest('B238809. Press shift+home in textarea with backward multiline selection', function () {
        var text          = 'text\rarea',
            startPosition = 2,
            endPosition   = 7,
            textarea      = createTextarea(text, startPosition, endPosition, true);

        var callback = function () {
            var newText = text.replace('\r', '\n');
            checkShortcut(textarea, newText, 0, endPosition, true);
            start();
        };
        keyPressSimulator('shift+home', callback);
    });

    asyncTest('B238809. Press shift+end in textarea with forward multiline selection', function () {
        var text          = 'text\rarea',
            startPosition = 2,
            endPosition   = 8,
            textarea      = createTextarea(text, startPosition, endPosition);

        var callback = function () {
            var newText = text.replace('\r', '\n');
            checkShortcut(textarea, newText, startPosition, newText.length, false);
            start();
        };
        keyPressSimulator('shift+end', callback);
    });

    asyncTest('B238809. Press shift+end in textarea with backward multiline selection', function () {
        var text          = 'text\rarea',
            startPosition = 2,
            endPosition   = 8,
            textarea      = createTextarea(text, startPosition, endPosition, true);

        var callback = function () {
            var newText = text.replace('\r', '\n');
            checkShortcut(textarea, newText, newText.indexOf('\n'), endPosition, true);
            start();
        };
        keyPressSimulator('shift+end', callback);
    });
});
