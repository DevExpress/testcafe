var hammerhead    = window.getTestCafeModule('hammerhead');
var browserUtils  = hammerhead.utils.browser;
var iframeSandbox = hammerhead.sandbox.iframe;

var testCafeCore  = window.getTestCafeModule('testCafeCore');
var SETTINGS      = testCafeCore.get('./settings').get();
var ERROR_TYPE    = testCafeCore.ERROR_TYPE;
var domUtils      = testCafeCore.get('./utils/dom');
var textSelection = testCafeCore.get('./utils/text-selection');

var testCafeRunner = window.getTestCafeModule('testCafeRunner');
var actionsAPI     = testCafeRunner.get('./api/actions');
var automation     = testCafeRunner.get('./automation/automation');
var StepIterator   = testCafeRunner.get('./step-iterator');

var testCafeUI = window.getTestCafeModule('testCafeUI');
var cursor     = testCafeUI.get('./cursor');


automation.init();
cursor.init();

var stepIterator = new StepIterator();
actionsAPI.init(stepIterator);

$(document).ready(function () {
    StepIterator.prototype.asyncActionSeries = function (items, runArgumentsIterator, action) {
        var seriesActionsRun = function (elements, callback) {
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

    stepIterator.on(StepIterator.ERROR_EVENT, function (err) {
        stepIterator.state.stoppedOnFail = false;
        currentErrorCode                 = err.code;
        currentSourceIndex               = err.__sourceIndex;
    });

    var asyncActionCallback,
        currentErrorCode   = null,
        currentSourceIndex = null,
        $input,
        $iFrame,

        //constants
        TEST_ELEMENT_CLASS = 'testElement',

        //utils
        createIFrame       = function ($element, src, callback) {
            $iFrame = $('<iframe/>')
                .attr('src', src)
                .css({
                    width:  '600px',
                    height: '600px'
                })
                .addClass(TEST_ELEMENT_CLASS);
            $element.addClass(TEST_ELEMENT_CLASS);

            var onLoadHandler = function () {
                $($iFrame[0].contentWindow.document.body).append($element);
                $iFrame.unbind('load', onLoadHandler);
                callback();
            };

            $iFrame.bind('load', onLoadHandler);
            $iFrame.appendTo($('body'));
        },

        runAsyncTest       = function (actions, assertions, timeout, delayBeforeAssertions) {
            var callbackFunction = function () {
                clearTimeout(timeoutId);
                assertions();
                start();
            };
            asyncActionCallback  = function () {
                window.setTimeout(callbackFunction, delayBeforeAssertions || 0);
            };
            actions();
            var timeoutId        = setTimeout(function () {
                callbackFunction = function () {
                };
                ok(false, 'Timeout is exceeded');
                start();
            }, timeout);
        };

    //tests
    QUnit.testStart(function () {
        $input              = $('<input type="text" id="input" class="input"/>').addClass(TEST_ELEMENT_CLASS).appendTo($('body'));
        $input[0].value     = 'test';
        $input[0].focus();
        textSelection.select($input[0], 4, 4);
        asyncActionCallback = function () {
        };
        hammerhead.on(hammerhead.EVENTS.iframeReadyToInit, window.initIFrameTestHandler);
        hammerhead.off(hammerhead.EVENTS.iframeReadyToInit, iframeSandbox.iframeReadyToInitHandler);
    });

    QUnit.testDone(function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
        currentErrorCode             = null;
        currentSourceIndex           = null;
        SETTINGS.ENABLE_SOURCE_INDEX = false;
        hammerhead.off(hammerhead.EVENTS.iframeReadyToInit, window.initIFrameTestHandler);
    });

    module('events raising');

    asyncTest('events raising with shortcut', function () {
        var keydownCount    = 0,
            keyupCount      = 0,
            keypressCount   = 0,
            mouseclickCount = 0;

        $input.keydown(
            function () {
                keydownCount++;
            }).keyup(
            function () {
                keyupCount++;
            }).keypress(
            function () {
                keypressCount++;
            });
        runAsyncTest(
            function () {
                actionsAPI.press('ctrl+a backspace');
            },
            function () {
                equal(keydownCount, 3, 'keydown event raises twice');
                equal(keyupCount, 3, 'keyup event raises twice');
                equal(keypressCount, browserUtils.isMozilla ? 2 : 0, 'keypress event raises twice');
            },
            3000
        );
    });

    module('shortcuts');

    asyncTest('select all', function () {
        runAsyncTest(
            function () {
                actionsAPI.press('ctrl+a');
            },
            function () {
                equal($input[0].value, textSelection.getSelectedText($input[0]), 'all text selected');
                equal($input[0].value, 'test', 'text is not changed');
            },
            1000
        );
    });

    asyncTest('shortcut must not be raised when preventDefault called', function () {
        $input.keydown(function (e) {
            e.preventDefault();
        });
        runAsyncTest(
            function () {
                actionsAPI.press('ctrl+a');
            },
            function () {
                notEqual($input[0].value, textSelection.getSelectedText($input[0]), 'text not selected');
                equal($input[0].value, 'test', 'text is not changed');
            },
            1000
        );
    });

    asyncTest('"backspace" command removes last symbol', function () {
        runAsyncTest(
            function () {
                actionsAPI.press('backspace');
            },
            function () {
                equal($input[0].value, 'tes', 'symbol removed');
            },
            1000
        );
    });

    asyncTest('"ctrl+a backspace" removes all text', function () {
        runAsyncTest(
            function () {
                actionsAPI.press('ctrl+a backspace');
            },
            function () {
                equal($input[0].value, '', 'text removed');
            },
            1000
        );
    });

    asyncTest('"ctrl+a delete" removes all text', function () {
        runAsyncTest(
            function () {
                actionsAPI.press('ctrl+a delete');
            },
            function () {
                equal($input[0].value, '', 'text removed');
            },
            1000
        );
    });

    asyncTest('left', function () {
        runAsyncTest(
            function () {
                actionsAPI.press('left backspace');
            },
            function () {
                equal($input[0].value, 'tet', 'press left done');
            },
            1000
        );
    });

    asyncTest('right', function () {
        runAsyncTest(
            function () {
                actionsAPI.press('left left right backspace');
            },
            function () {
                equal($input[0].value, 'tet', 'press left done');
            },
            1500
        );
    });

    asyncTest('home', function () {
        runAsyncTest(
            function () {
                actionsAPI.press('home delete');
            },
            function () {
                equal($input[0].value, 'est', 'press home done');
            },
            1000
        );
    });

    asyncTest('end', function () {
        runAsyncTest(
            function () {
                actionsAPI.press('home end backspace');
            },
            function () {
                equal($input[0].value, 'tes', 'press end done');
            },
            1000
        );
    });

    asyncTest('press a', function () {
        runAsyncTest(
            function () {
                actionsAPI.press('left a');
            },
            function () {
                equal($input[0].value, 'tesat');
            },
            1000
        );
    });

    asyncTest('press +', function () {
        runAsyncTest(
            function () {
                actionsAPI.press('+ shift++');
            },
            function () {
                equal($input[0].value, 'test++');
            },
            2000
        );
    });

    asyncTest('press space', function () {
        runAsyncTest(
            function () {
                actionsAPI.press('left space');
            },
            function () {
                equal($input[0].value, 'tes t');
            },
            1000
        );
    });

    asyncTest('press shift+a', function () {
        runAsyncTest(
            function () {
                actionsAPI.press('shift+a');
            },
            function () {
                equal($input[0].value, 'testA');
            },
            1000
        );
    });

    asyncTest('press shift+1', function () {
        runAsyncTest(
            function () {
                actionsAPI.press('shift+1');
            },
            function () {
                equal($input[0].value, 'test!');
            },
            1000
        );
    });

    asyncTest('press tab', function () {
        domUtils.getActiveElement().blur();
        $('body').focus();
        $input.attr('tabIndex', 1);
        runAsyncTest(
            function () {
                actionsAPI.press('tab');
            },
            function () {
                deepEqual(domUtils.getActiveElement(), $input[0]);
            },
            1000
        );
    });

    asyncTest('press tab with tabIndexes', function () {
        var $input2 = $('<input type="text" id="$input2" class="input"/>')
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo($('body'))
            .attr('tabIndex', 1);
        $input.attr('tabIndex', 2);
        domUtils.getActiveElement().blur();
        $('body').focus();
        runAsyncTest(
            function () {
                actionsAPI.press('tab');
            },
            function () {
                deepEqual(domUtils.getActiveElement(), $input2[0]);
            },
            1000
        );
    });

    asyncTest('press tab with iframe', function () {
        var $iframe      = $('<iframe id="test1" src="about:blank"/>')
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo($('body'));
        var $iframeInput = $('<input type="text" id="iframeInput"/>')
            .addClass(TEST_ELEMENT_CLASS);
        $($iframe.contents()[0]).find('body').append($iframeInput);

        domUtils.getActiveElement().blur();
        $input.focus();

        runAsyncTest(
            function () {
                actionsAPI.press('tab');
            },
            function () {
                ok(domUtils.getActiveElement() !== $input[0]);
            },
            1000
        );
    });

    module('Regression tests');
    asyncTest('T178354', function () {
        domUtils.getActiveElement().blur();
        $('body').focus();
        $input.attr('tabIndex', 1);
        runAsyncTest(
            function () {
                actionsAPI.press('tab');
            },
            function () {
                deepEqual(domUtils.getActiveElement(), $input[0]);
                equal($input[0].selectionStart, 0);
                equal($input[0].selectionEnd, $input[0].value.length);
            },
            1000
        );
    });

    asyncTest('B238757 - It is impossible to record and run \'press\' action with \'+\' key', function () {
        runAsyncTest(
            function () {
                actionsAPI.press('+');
            },
            function () {
                equal($input[0].value, 'test+');
            },
            1000
        );
    });

    asyncTest('B253200 - TestCafe doesn\'t emulate browsers behavior for press "enter" key on the focused HyperLink editor (link with href)', function () {
        var iFrameSrc = window.QUnitGlobals.getResourceUrl('../../../data/runner/iframe.html', 'runner-iframe.html'),
            linkHref  = window.QUnitGlobals.getResourceUrl('../../../data/focus-blur-change/iframe.html', 'focus-iframe.html'),
            $link     = $('<a>Link</a>').attr('href', linkHref),
            clicked   = false;

        var testActions = function () {
            runAsyncTest(
                function () {
                    $link.click(function () {
                        clicked = true;
                    });
                    equal($iFrame[0].contentWindow.location.pathname, '/sessionId!iframe/https://example.com/test-resource/runner-iframe.html');
                    $link.focus();

                    //NOTE: we need set timeout for waiting of focus in IE

                    window.setTimeout(function () {
                        equal(domUtils.getActiveElement(), $link[0]);
                        actionsAPI.press('enter');
                    }, 500);

                },
                function () {
                    equal($iFrame[0].contentWindow.location.pathname, '/sessionId/https://example.com/test-resource/focus-iframe.html');
                    ok(clicked);
                },
                2000,
                1000
            );
        };

        createIFrame($link, iFrameSrc, testActions);
    });

    asyncTest('B253200 - TestCafe doesn\'t emulate browsers behavior for press "enter" key on the focused HyperLink editor (link with javascript)', function () {
        var iFrameSrc = window.QUnitGlobals.getResourceUrl('../../../data/runner/iframe.html', 'runner-iframe.html');
        var linkHref  = window.QUnitGlobals.getResourceUrl('../../../data/focus-blur-change/iframe.html', 'focus-iframe.html');

        var $link   = $('<a>Link</a>').attr('href', 'javascript: window.location.href = "' + linkHref + '"'),
            clicked = false;

        var testActions = function () {
            runAsyncTest(
                function () {
                    $link.click(function () {
                        clicked = true;
                    });
                    equal($iFrame[0].contentWindow.location.pathname, '/sessionId!iframe/https://example.com/test-resource/runner-iframe.html');
                    $link.focus();

                    //NOTE: we need set timeout for waiting of focus in IE
                    window.setTimeout(function () {
                        equal(domUtils.getActiveElement(), $link[0]);
                        actionsAPI.press('enter');
                    }, 500);
                },
                function () {
                    equal($iFrame[0].contentWindow.location.pathname, '/sessionId!iframe/https://example.com/test-resource/focus-iframe.html');
                    ok(clicked);
                },
                2000,
                1000
            );
        };

        createIFrame($link, iFrameSrc, testActions);
    });

    module('parse keys string');

    asyncTest('press correct symbol', function () {
        actionsAPI.press('a');
        setTimeout(function () {
            equal(currentErrorCode, null);
            start();
        }, 300);
    });

    asyncTest('press correct symbol with spaces', function () {
        actionsAPI.press(' a  ');
        setTimeout(function () {
            equal(currentErrorCode, null);
            start();
        }, 300);
    });

    asyncTest('press correct keys combination', function () {
        actionsAPI.press('g h g+h  f t');
        setTimeout(function () {
            equal(currentErrorCode, null);
            start();
        }, 300);
    });

    asyncTest('press correct keys combination with shortcuts', function () {
        actionsAPI.press('g home g+h  f t left+right');
        setTimeout(function () {
            equal(currentErrorCode, null);
            start();
        }, 300);
    });

    asyncTest('press incorrect keys combination', function () {
        SETTINGS.ENABLE_SOURCE_INDEX = true;
        actionsAPI.press('incorrect', '#11');
        setTimeout(function () {
            equal(currentErrorCode, ERROR_TYPE.incorrectPressActionArgument);
            equal(currentSourceIndex, 11);

            start();
        }, 300);
    });
});
