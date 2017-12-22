var hammerhead   = window.getTestCafeModule('hammerhead');
var browserUtils = hammerhead.utils.browser;

var testCafeCore      = window.getTestCafeModule('testCafeCore');
var parseKeySequence  = testCafeCore.get('./utils/parse-key-sequence');

var testCafeAutomation = window.getTestCafeModule('testCafeAutomation');
var PressAutomation    = testCafeAutomation.Press;

testCafeCore.preventRealEvents();


$(document).ready(function () {
    var TEST_ELEMENT_CLASS = 'testElement';

    function checkSubmitRaisedOnEnterPress ($form, $input, needSubmit) {
        var submitHandlerExecuted = false;

        $form[0].addEventListener('submit', function (e) {
            submitHandlerExecuted = true;
            e.preventDefault();
        });

        var callback = function () {
            ok(needSubmit === submitHandlerExecuted, 'submit handler executed');

            start();
        };

        $input[0].focus();
        runPressAutomation('enter', callback);
    }

    function isInputValueValid ($el) {
        var el = $el[0];

        return el.validity.valid;
    }

    function runPressAutomation (keys, callback) {
        var pressAutomation = new PressAutomation(parseKeySequence(keys).combinations, {});

        pressAutomation
            .run()
            .then(callback);
    }

    QUnit.testDone(function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
    });

    module('form with two text inputs');
    asyncTest('submit button (input type="submit")', function () {
        var $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        $('<input type="submit">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('submit button (button type="submit")', function () {
        var $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        $('<button type="submit">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('submit button (button without declared type)', function () {
        var $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        $('<button></button>').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('without submit button', function () {
        var $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, false);
    });

    asyncTest('not-submit button (button type="button")', function () {
        var $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        $('<button type="button"></button>').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, false);
    });

    asyncTest('disabled submit button', function () {
        var $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        $('<button type="submit" disabled></button>').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, false);
    });

    asyncTest('inputs types "text" and "search" and without submit button', function () {
        var $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="search">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, false);
    });

    asyncTest('valid and invalid text input ("text" and "url") and submit button', function () {
        var $form     = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $input    = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        var $urlInput = $('<input type="url">').addClass(TEST_ELEMENT_CLASS).val('test').appendTo($form);

        $('<button type="submit">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, isInputValueValid($urlInput));
    });

    module('form with one text input');
    asyncTest('input type = "text"', function () {
        var $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('input type = "search"', function () {
        var $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $input = $('<input type="search">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('input type = "url"', function () {
        var $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $input = $('<input type="url">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('input type = "number"', function () {
        var $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $input = $('<input type="number">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('input type = "tel"', function () {
        var $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $input = $('<input type="tel">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('input type = "password"', function () {
        var $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $input = $('<input type="password">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('input type = "email"', function () {
        var $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $input = $('<input type="email">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('input type = "date"', function () {
        var needChangeType = browserUtils.isIE && browserUtils.version > 11;
        var $form          = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $input         = $('<input type="' + (needChangeType ? 'email' : 'date') +
                               '">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        //HACK: For tests in MSEdge. MSEdge fails when we try to create input with type = 'date'
        if (needChangeType)
            $input[0].type = 'date';

        //webkit does not submit date input on enter
        checkSubmitRaisedOnEnterPress($form, $input, !browserUtils.isWebKit || browserUtils.isSafari);
    });

    asyncTest('input type = "time"', function () {
        var $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $input = $('<input type="time">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        //webkit does not submit time input on enter
        checkSubmitRaisedOnEnterPress($form, $input, !browserUtils.isWebKit || browserUtils.isSafari);
    });

    asyncTest('input type = "radio"', function () {
        var $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $input = $('<input type="radio">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, false);
    });

    asyncTest('input type = "url" with invalid value', function () {
        var $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $input = $('<input type="url">').addClass(TEST_ELEMENT_CLASS).val('test').appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, isInputValueValid($input));
    });

    module('form with two different type inputs');
    asyncTest('one text input and one not-text input (type = "checkbox"), text input is focused', function () {
        var $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="checkbox">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('one text input and one not-text input (type = "checkbox"), checkbox is focused', function () {
        var $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $input = $('<input type="checkbox">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, browserUtils.isFirefox);
    });

    module('event handlers');
    asyncTest('check all handlers are executed - form with submit button', function () {
        var $form                        = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $input                       = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        var $button                      = $('<input type="submit">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        var inlineSubmitHandlerExecuted  = false;
        var jQuerySubmitHandlerExecuted  = false;
        var submitHandlerExecuted        = false;
        var buttonClickHandlerExecuted   = false;
        var inputKeydownHandlerExecuted  = false;
        var inputKeyupHandlerExecuted    = false;
        var inputKeypressHandlerExecuted = false;

        $input.bind('keydown', function () {
            inputKeydownHandlerExecuted = true;
        });

        $input.bind('keypress', function () {
            inputKeypressHandlerExecuted = true;
        });

        $input.bind('keyup', function () {
            inputKeyupHandlerExecuted = true;
        });

        $button.bind('click', function () {
            buttonClickHandlerExecuted = true;
        });

        $form.bind('submit', function () {
            jQuerySubmitHandlerExecuted = true;
        });

        $form[0].onsubmit = function () {
            inlineSubmitHandlerExecuted = true;
        };

        $form[0].addEventListener('submit', function (e) {
            submitHandlerExecuted = true;
            e.preventDefault();
        });

        var callback = function () {
            ok(jQuerySubmitHandlerExecuted, 'jQuery submit handler executed');
            ok(submitHandlerExecuted, 'submit handler executed');
            ok(inlineSubmitHandlerExecuted, 'inline submit handler executed');
            ok(buttonClickHandlerExecuted, 'button click handler executed');
            ok(inputKeydownHandlerExecuted, 'input keydown handler executed');
            ok(inputKeypressHandlerExecuted, 'input keydown handler executed');
            ok(inputKeyupHandlerExecuted, 'input keydown handler executed');


            start();
        };

        $input[0].focus();
        runPressAutomation('enter', callback);
    });

    asyncTest('check all handlers are executed - form without submit button', function () {
        var $form                        = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $input                       = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        var inlineSubmitHandlerExecuted  = false;
        var jQuerySubmitHandlerExecuted  = false;
        var submitHandlerExecuted        = false;
        var inputKeydownHandlerExecuted  = false;
        var inputKeyupHandlerExecuted    = false;
        var inputKeypressHandlerExecuted = false;
        var submitFunctionCalled         = false;
        var needToPreventEvent           = browserUtils.isFirefox || browserUtils.isSafari && browserUtils.version > 9;

        $input.bind('keydown', function () {
            inputKeydownHandlerExecuted = true;
        });

        $input.bind('keypress', function () {
            inputKeypressHandlerExecuted = true;
        });

        $input.bind('keyup', function () {
            inputKeyupHandlerExecuted = true;
        });

        $form.bind('submit', function () {
            jQuerySubmitHandlerExecuted = true;
        });

        $form[0].onsubmit = function () {
            inlineSubmitHandlerExecuted = true;
        };

        $form[0].addEventListener('submit', function (e) {
            submitHandlerExecuted = true;
            if (needToPreventEvent)
                e.preventDefault();
        });

        // NOTE: submit event dispatching leads to form submit in FireFox and Safari version 10 or higher
        // in other browsers we call submit function after submit event dispatched (if there are no submit buttons on form)
        if (!needToPreventEvent) {
            $form[0].submit = function () {
                submitFunctionCalled = true;
            };
        }

        var callback = function () {
            ok(jQuerySubmitHandlerExecuted, 'jQuery submit handler executed');
            ok(submitHandlerExecuted, 'submit handler executed');
            ok(inlineSubmitHandlerExecuted, 'inline submit handler executed');
            ok(inputKeydownHandlerExecuted, 'input keydown handler executed');
            ok(inputKeypressHandlerExecuted, 'input keydown handler executed');
            ok(inputKeyupHandlerExecuted, 'input keydown handler executed');
            if (!needToPreventEvent)
                ok(submitFunctionCalled, 'submit function called');

            start();
        };

        $input[0].focus();
        runPressAutomation('enter', callback);
    });

    //when enter pressed in a form input, browser sends click event to form submit button
    asyncTest('form must not be submitted if submit button click event was prevented', function () {
        var $form                 = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $input                = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        var $button               = $('<input type="submit">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        var submitHandlerExecuted = false;
        var clickHandlerExecuted  = false;

        $button[0].addEventListener('click', function (e) {
            clickHandlerExecuted = true;
            e.preventDefault();
        });

        $form[0].addEventListener('submit', function () {
            submitHandlerExecuted = true;
        });

        var callback = function () {
            ok(clickHandlerExecuted, 'click executed');
            ok(!submitHandlerExecuted, 'submit not executed');
            start();
        };

        $input[0].focus();
        runPressAutomation('enter', callback);
    });

    asyncTest('form must not be submitted if enter keydown event was prevented', function () {
        var $form                  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $input                 = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        var keydownHandlerExecuted = false;
        var submitHandlerExecuted  = false;
        var ENTER_KEY_CODE         = 13;

        $('<input type="submit">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $input.bind('keydown', function (e) {
            keydownHandlerExecuted = true;
            if (e.keyCode === ENTER_KEY_CODE)
                e.preventDefault();
        });

        $form[0].addEventListener('submit', function () {
            submitHandlerExecuted = true;
        });

        var callback = function () {
            ok(keydownHandlerExecuted, 'keydown handler was executed');
            ok(!submitHandlerExecuted, 'submit handler was not executed');
            start();
        };

        $input[0].focus();
        runPressAutomation('enter', callback);
    });

    asyncTest('form must not be submitted if it has inputs with failed validation', function () {
        var $form                 = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $input                = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        var $emailInput           = $('<input type="email">').addClass(TEST_ELEMENT_CLASS).val('test').appendTo($form);
        var $button               = $('<input type="submit">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        var submitHandlerExecuted = false;
        var clickHandlerExecuted  = false;

        $button[0].addEventListener('click', function () {
            clickHandlerExecuted = true;
        });

        $form[0].addEventListener('submit', function (e) {
            submitHandlerExecuted = true;
            e.preventDefault();
        });

        var callback = function () {
            ok(clickHandlerExecuted, 'click executed');
            equal(submitHandlerExecuted, isInputValueValid($emailInput));

            start();
        };

        $input[0].focus();
        runPressAutomation('enter', callback);
    });
});
