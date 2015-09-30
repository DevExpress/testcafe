var hammerhead   = window.getTestCafeModule('hammerhead');
var browserUtils = hammerhead.utils.browser;

var testCafeCore = window.getTestCafeModule('testCafeCore');
var SETTINGS     = testCafeCore.get('./settings').get();
var ERROR_TYPE   = testCafeCore.ERROR_TYPE;

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

var ELEMENT_WAITING_TIMEOUT = 400;

actionsAPI.setElementAvailabilityWaitingTimeout(ELEMENT_WAITING_TIMEOUT);

$(document).ready(function () {
    var actionTargetWaitingCounter = 0,
        actionRunCounter           = 0;

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

    StepIterator.prototype.onActionTargetWaitingStarted = function () {
        actionTargetWaitingCounter++;
    };

    StepIterator.prototype.onActionRun = function () {
        actionRunCounter++;
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

        //constants
        TEST_ELEMENT_CLASS = 'testElement',

        //utils
        runAsyncTest       = function (actions, assertions, timeout) {
            var callbackFunction = function () {
                clearTimeout(timeoutId);
                assertions();
                start();
            };
            asyncActionCallback  = function () {
                callbackFunction();
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
        $input                     = $('<input type="text" id="input" class="input"/>').addClass(TEST_ELEMENT_CLASS).appendTo($('body'));
        actionTargetWaitingCounter = 0;
        actionRunCounter           = 0;
    });

    QUnit.testDone(function () {
        $('body').focus();

        $('.' + TEST_ELEMENT_CLASS).remove();
        currentErrorCode             = null;
        currentSourceIndex           = null;
        SETTINGS.ENABLE_SOURCE_INDEX = false;
    });

    asyncTest('typetext events', function () {
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
            }).click(function () {
                mouseclickCount++;
            });
        runAsyncTest(
            function () {
                actionsAPI.type($input, 'HI');
            },
            function () {
                equal(keydownCount, 2, 'keydown event raises twice');
                equal(keyupCount, 2, 'keyup event raises twice');
                equal(keypressCount, 2, 'keypress event raises twice');
                equal(mouseclickCount, 1, 'click event raises once');
                equal(actionTargetWaitingCounter, 1);
                equal(actionRunCounter, 1);
            },
            3000
        );
    });

    asyncTest('input value changed', function () {
        $('<input type="text" id="input1" class="input"/>').addClass(TEST_ELEMENT_CLASS).appendTo($('body'));
        var $inputs = $('.' + TEST_ELEMENT_CLASS),
            text    = 'Hello, world!';
        runAsyncTest(
            function () {
                actionsAPI.type($inputs, text);
            },
            function () {
                equal($inputs[0].value, text, 'first elements value setted');
                equal($inputs[1].value, text, 'second elements value setted');
            },
            5000
        );
    });

    asyncTest('correct keyCode', function () {
        var key              = 'k';
        $input[0].onkeypress = function (e) {
            equal((e || window.event).keyCode, key.charCodeAt(0), 'keypress event argument is correct');
        };
        runAsyncTest(
            function () {
                actionsAPI.type($input, key);
            },
            function () {
                expect(1);
            },
            2000
        );
    });

    asyncTest('typetext to inner input', function () {
        var $outerDiv = $('<div></div>')
                .css({
                    width:  '100px',
                    height: '50px'
                })
                .addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            text      = 'Hi';
        $input.appendTo($outerDiv);
        runAsyncTest(
            function () {
                actionsAPI.type($outerDiv, text);
            },
            function () {
                equal($input[0].value, text, 'text to inner input has been written')
            },
            2000
        );
    });

    asyncTest('do not click when element is focused', function () {
        var clickCount = 0,
            text       = 'test';
        $input.click(function () {
            clickCount++;
        });
        $input[0].focus();
        runAsyncTest(
            function () {
                actionsAPI.type($input, text);
            },
            function () {
                equal(clickCount, 0);
                equal($input[0].value, text, 'text to inner input has been written')
            },
            3000
        );
    });

    asyncTest('by default type command concats new text with the old one', function () {
        var newText     = 'new text',
            oldText     = 'old text';
        $input[0].value = oldText;
        runAsyncTest(
            function () {
                actionsAPI.type($input, newText);
            },
            function () {
                equal($input[0].value, oldText.concat(newText), 'new text concated with the old one');
            },
            2000
        );
    });

    asyncTest('set option.replace to true to replace current text', function () {
        var text        = 'new text';
        $input[0].value = 'old text';
        runAsyncTest(
            function () {
                actionsAPI.type($input, text, { replace: true });
            },
            function () {
                equal($input[0].value, text, 'old text replaced');
            },
            2000
        );
    });

    asyncTest('empty first argument raises error', function () {
        SETTINGS.ENABLE_SOURCE_INDEX = true;
        asyncActionCallback          = function () {
        };
        actionsAPI.type($('#nonExistentElement'), 'text', '#213');
        setTimeout(function () {
            equal(currentErrorCode, ERROR_TYPE.emptyFirstArgument, 'correct error code is sent');
            equal(currentSourceIndex, 213);
            start();
        }, ELEMENT_WAITING_TIMEOUT + 100);
    });

    asyncTest('empty "text" argument raises error', function () {
        SETTINGS.ENABLE_SOURCE_INDEX = true;
        asyncActionCallback          = function () {
        };

        actionsAPI.type($input, '', '#218');

        setTimeout(function () {
            equal(currentErrorCode, ERROR_TYPE.emptyTypeActionArgument, 'correct error code is sent');
            equal(currentSourceIndex, 218);
            start();
        }, 500);
    });

    asyncTest('do not change readonly inputs value', function () {
        var $input1      = $('<input type="text" readonly />').addClass(TEST_ELEMENT_CLASS).appendTo($('body')),
            $input2      = $('<input type="text" value="value" />').attr('readonly', 'readonly').addClass(TEST_ELEMENT_CLASS).appendTo($('body')),
            oldInput1Val = $input1.val(),
            oldInput2Val = $input2.val();
        runAsyncTest(
            function () {
                actionsAPI.type([$input1, $input2], 'test');
            },
            function () {
                ok($input1.val() === oldInput1Val);
                ok($input2.val() === oldInput2Val);
            },
            5000
        );
    });

    module('regression tests');

    asyncTest('input event raising (B253410)', function () {
        var $input = $('<input type="text" />').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $div   = $('<div></div>').addClass(TEST_ELEMENT_CLASS).appendTo('body');

        runAsyncTest(
            function () {
                $input.bind('input', function (e) {
                    $div.text($div.text() + $input.val());
                    $input.val('');
                });
                actionsAPI.type($input, 'test');
            },
            function () {
                equal($div.text(), 'test');
                equal($input.val(), '');
            },
            5000
        );
    });

    asyncTest('change event must not be raised if keypress was prevented (B253816)', function () {
        var $input  = $('<input type="text" />').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            changed = false;

        $input.bind('change', function () {
            changed = true;
        });

        asyncActionCallback = function () {
            $input[0].blur();

            ok(changed, 'check change event was raised if keypress was not prevented');
            changed             = false;
            $input.bind('keypress', function (e) {
                e.target.value += String.fromCharCode(e.keyCode);
                return false;
            });
            asyncActionCallback = function () {
                $input[0].blur();

                ok(!changed, 'check change event was not raised if keypress was prevented');

                start();
            };

            actionsAPI.type($input, 'new');
        };

        actionsAPI.type($input, 'test');
    });

    asyncTest('keypress args must contain charCode of the symbol, not keyCode', function () {
        var $input   = $('<input type="text" />').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            symbol   = '!',
            charCode = 33,
            keyCode  = 49;

        runAsyncTest(
            function () {
                $input.bind('keypress', function (e) {
                    equal(e.keyCode, charCode, 'keyCode on keypress checked');
                    equal(e.charCode, charCode, 'charCode on keypress checked');
                });
                $input.bind('keydown', function (e) {
                    equal(e.keyCode, keyCode, 'keyCode on keydown checked');
                });
                actionsAPI.type($input, '!');
            },
            function () {
                equal($input.val(), '!', 'input value checked');
            },
            5000
        );
    });

    asyncTest('T138385 - input type="number" leave out "maxlength" attribute (act.type)', function () {
        var $input          = $('<input type="number" maxlength="2"/>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            inputEventCount = 0;

        runAsyncTest(
            function () {
                $input.bind('input', function () {
                    inputEventCount++;
                });
                actionsAPI.type($input, '123');
            },
            function () {
                equal(inputEventCount, 3);
                equal($input.val(), browserUtils.isIE ? '12' : '123');
            },
            5000
        );
    });

    asyncTest('T138385 - input type "number" leave out "maxlength" attribute (act.press)', function () {
        var $input          = $('<input type="number" maxlength="2"/>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            inputEventCount = 0;

        runAsyncTest(
            function () {
                $input.bind('input', function () {
                    inputEventCount++;
                });
                $input.focus();

                actionsAPI.press('1 2 3');
            },
            function () {
                equal(inputEventCount, 3);
                equal($input.val(), browserUtils.isIE ? '12' : '123');
            },
            5000
        );
    });

    asyncTest('T138385 - "input" event is raised if symbol count more than "maxlength" attribute (act.type)', function () {
        var $input          = $('<input type="text" maxlength="3"/>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            inputEventCount = 0;

        runAsyncTest(
            function () {
                $input.bind('input', function () {
                    inputEventCount++;
                });
                actionsAPI.type($input, 'test');
            },
            function () {
                equal(inputEventCount, 4);
                equal($input.val(), 'tes');
            },
            5000
        );
    });

    asyncTest('T138385 - "input" event is raised if symbol count more than "maxlength" attribute (act.press)', function () {
        var $input          = $('<input type="text" maxlength="3"/>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            inputEventCount = 0;

        runAsyncTest(
            function () {
                $input.bind('input', function () {
                    inputEventCount++;
                });

                $input.focus();

                actionsAPI.press('t e s t');
            },
            function () {
                equal(inputEventCount, 4);
                equal($input.val(), 'tes');
            },
            5000
        );
    });

    asyncTest('T239547: TD15.1 - Playback problems on https://jsfiddle.net/', function () {
        var $input   = $('<input type="text" />').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            charCode = 45,
            keyCode  = browserUtils.isMozilla ? 173 : 189;

        runAsyncTest(
            function () {
                $input.bind('keypress', function (e) {
                    equal(e.keyCode, charCode, 'keyCode on keypress checked');
                    equal(e.charCode, charCode, 'charCode on keypress checked');
                });
                $input.bind('keydown', function (e) {
                    equal(e.keyCode, keyCode, 'keyCode on keydown checked');
                });
                actionsAPI.type($input, '-');
            },
            function () {
                equal($input.val(), '-', 'input value checked');
            },
            5000
        );
    });
});
