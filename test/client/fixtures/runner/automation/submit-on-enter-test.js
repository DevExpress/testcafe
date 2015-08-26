var hammerhead     = window.getTestCafeModule('hammerhead');
var browser        = hammerhead.Util.Browser;

var testCafeRunner             = window.getTestCafeModule('testCafeRunner');
var automation                 = testCafeRunner.get('./automation/automation');
var keyPressSimulator          = testCafeRunner.get('./automation/playback/key-press-simulator');

automation.init();

$(document).ready(function () {

    var TEST_ELEMENT_CLASS = 'testElement';

    function checkSubmitRaisedOnEnterPress($form, $input, needSubmit) {
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
        keyPressSimulator('enter', callback);
    }

    QUnit.testDone(function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
    });

    module('form markup');

    asyncTest('form with two text inputs and submit button (input type="submit")', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        $('<input type="submit">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

   asyncTest('form with two text inputs and submit button (button type="submit")', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        $('<button type="submit">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

     asyncTest('form with two text inputs and submit button (button without declared type)', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        $('<button></button>').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('form with two text inputs without submit button', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, false);
    });

    asyncTest('form with two text inputs and not-submit button (button type="button")', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        $('<button type="button"></button>').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, false);
    });

    asyncTest('form with two text inputs and disabled submit button', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        $('<button type="submit" disabled></button>').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, false);
    });

   asyncTest('form with one text input (type=text)', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('form with one text input (type=search)', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="search">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

     asyncTest('form with one text (type=url)', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="url">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('form with one text input (type=number)', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="number">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('form with one text input (type=tel)', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="tel">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('form with one text input (type=password)', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="password">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('form with one text input (type=number)', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="number">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('form with one text input (type=email)', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="email">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('form with one text input (type=date)', function () {
        var needChangeType = browser.isIE && browser.version > 11,
            $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="' + (needChangeType ? 'email' : 'date') + '">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        //HACK: For tests in MSEdge. MSEdge fails when we try to create input with type = 'date'
        if(needChangeType)
            $input[0].type = 'date';

        //webkit does not submit date input on enter
        checkSubmitRaisedOnEnterPress($form, $input, browser.isWebKit ? false : true);
    });

    asyncTest('form with one text input (type=time)', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="time">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        //webkit does not submit time input on enter
        checkSubmitRaisedOnEnterPress($form, $input, browser.isWebKit ? false : true);
    });

    asyncTest('form with one not-text input (radio)', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="radio">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, false);
    });

    asyncTest('form with one text input and one not-text input (checkbox), text input is focused', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="checkbox">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('form with one text input and one not-text input (checkbox), checkbox is focused', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="checkbox">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, false);
    });

    asyncTest('form with one text input and one not-text input (checkbox), checkbox is focused', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="checkbox">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, false);
    });

    asyncTest('form with two text inputs (text and search)', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="search">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, false);
    });

    asyncTest('form with invalid text input (url)', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="url">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $input.val('test');

        checkSubmitRaisedOnEnterPress($form, $input, !$input[0].validity);
    });

    asyncTest('form with valid and invalid text input (text and url) and submit button', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form),
            $urlInput = $('<input type="url">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<button type="submit">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $urlInput.val('test');

        checkSubmitRaisedOnEnterPress($form, $input, !$input[0].validity);
    });

    module('event handlers');
    asyncTest('check all handlers are executed - form with submit button', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form),
            $button = $('<input type="submit">').addClass(TEST_ELEMENT_CLASS).appendTo($form),
            inlineSubmitHandlerExecuted = false,
            jQuerySubmitHandlerExecuted = false,
            submitHandlerExecuted = false,
            buttonClickHandlerExecuted = false,
            inputKeydownHandlerExecuted = false,
            inputKeyupHandlerExecuted = false,
            inputKeypressHandlerExecuted = false;

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
        keyPressSimulator('enter', callback);
    });

    asyncTest('check all handlers are executed - form without submit button', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form),
            inlineSubmitHandlerExecuted = false,
            jQuerySubmitHandlerExecuted = false,
            submitHandlerExecuted = false,
            inputKeydownHandlerExecuted = false,
            inputKeyupHandlerExecuted = false,
            inputKeypressHandlerExecuted = false,
            submitFunctionCalled = false;

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
            if (browser.isMozilla)
                e.preventDefault();
        });

        //submit event dispatching leads to form submit in FireFox
        //in other browsers we call submit function after submit event dispatched (if there are no submit buttons on form)
        if (!browser.isMozilla)
            $form[0].submit = function () {
                submitFunctionCalled = true;
            };

        var callback = function () {
            ok(jQuerySubmitHandlerExecuted, 'jQuery submit handler executed');
            ok(submitHandlerExecuted, 'submit handler executed');
            ok(inlineSubmitHandlerExecuted, 'inline submit handler executed');
            ok(inputKeydownHandlerExecuted, 'input keydown handler executed');
            ok(inputKeypressHandlerExecuted, 'input keydown handler executed');
            ok(inputKeyupHandlerExecuted, 'input keydown handler executed');
            if (!browser.isMozilla)
                ok(submitFunctionCalled, 'submit function called');

            start();
        };

        $input[0].focus();
        keyPressSimulator('enter', callback);
    });

    //when enter pressed in a form input, browser sends click event to form submit button
    asyncTest('form must not be submitted if submit button click event was prevented', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form),
            $button = $('<input type="submit">').addClass(TEST_ELEMENT_CLASS).appendTo($form),
            submitHandlerExecuted = false,
            clickHandlerExecuted = false;

        $button[0].addEventListener('click', function (e) {
            clickHandlerExecuted = true;
            e.preventDefault();
        });

        $form[0].addEventListener('submit', function (e) {
            submitHandlerExecuted = true;
        });

        var callback = function () {
            ok(clickHandlerExecuted, 'click executed');
            ok(!submitHandlerExecuted, 'submit not executed');
            start();
        };

        $input[0].focus();
        keyPressSimulator('enter', callback);
    });

    asyncTest('form must not be submitted if enter keydown event was prevented', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form),
            keydownHandlerExecuted = false,
            submitHandlerExecuted = false,
            ENTER_KEY_CODE = 13;

        $('<input type="submit">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $input.bind('keydown', function (e) {
            keydownHandlerExecuted = true;
            if (e.keyCode === ENTER_KEY_CODE)
                e.preventDefault();
        });

        $form[0].addEventListener('submit', function (e) {
            submitHandlerExecuted = true;
        });

        var callback = function () {
            ok(keydownHandlerExecuted, 'keydown handler was executed');
            ok(!submitHandlerExecuted, 'submit handler was not executed');
            start();
        };

        $input[0].focus();
        keyPressSimulator('enter', callback);
    });

    asyncTest('form must not be submitted if it has inputs with failed validation', function () {
        var $form = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form),
            $emailInput = $('<input type="email">').addClass(TEST_ELEMENT_CLASS).appendTo($form),
            $button = $('<input type="submit">').addClass(TEST_ELEMENT_CLASS).appendTo($form),
            submitHandlerExecuted = false,
            clickHandlerExecuted = false;

        $emailInput.val('test');

        $button[0].addEventListener('click', function () {
            clickHandlerExecuted = true;
        });

        $form[0].addEventListener('submit', function (e) {
            submitHandlerExecuted = true;
            e.preventDefault();
        });

        var callback = function () {
            ok(clickHandlerExecuted, 'click executed');
            ok(!$input[0].validity === submitHandlerExecuted, 'submit not executed');

            start();
        };

        $input[0].focus();
        keyPressSimulator('enter', callback);
    });
});
