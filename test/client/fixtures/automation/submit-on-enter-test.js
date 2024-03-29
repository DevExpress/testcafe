const hammerhead   = window.getTestCafeModule('hammerhead');
const browserUtils = hammerhead.utils.browser;

const testCafeCore      = window.getTestCafeModule('testCafeCore');
const parseKeySequence  = testCafeCore.parseKeySequence;

const testCafeAutomation = window.getTestCafeModule('testCafeAutomation');
const PressAutomation    = testCafeAutomation.Press;

testCafeCore.preventRealEvents();


$(document).ready(function () {
    const TEST_ELEMENT_CLASS = 'testElement';

    function checkSubmitRaisedOnEnterPress ($form, $input, needSubmit) {
        let submitHandlerExecuted = false;

        $form[0].addEventListener('submit', function (e) {
            submitHandlerExecuted = true;
            e.preventDefault();
        });

        const callback = function () {
            ok(needSubmit === submitHandlerExecuted, 'submit handler executed');

            start();
        };

        $input[0].focus();
        runPressAutomation('enter', callback);
    }

    function isInputValueValid ($el) {
        const el = $el[0];

        return el.validity.valid;
    }

    function runPressAutomation (keys, callback) {
        const pressAutomation = new PressAutomation(parseKeySequence(keys).combinations, {});

        pressAutomation
            .run()
            .then(callback);
    }

    QUnit.testDone(function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
    });

    module('form with two text inputs');
    asyncTest('submit button (input type="submit")', function () {
        const $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        $('<input type="submit">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('submit button (button type="submit")', function () {
        const $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        $('<button type="submit">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('submit button (button without declared type)', function () {
        const $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        $('<button></button>').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('without submit button', function () {
        const $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, false);
    });

    asyncTest('not-submit button (button type="button")', function () {
        const $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        $('<button type="button"></button>').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, false);
    });

    asyncTest('disabled submit button', function () {
        const $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        $('<button type="submit" disabled></button>').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, false);
    });

    asyncTest('inputs types "text" and "search" and without submit button', function () {
        const $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="search">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, false);
    });

    asyncTest('valid and invalid text input ("text" and "url") and submit button', function () {
        const $form     = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $input    = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        const $urlInput = $('<input type="url">').addClass(TEST_ELEMENT_CLASS).val('test').appendTo($form);

        $('<button type="submit">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, isInputValueValid($urlInput));
    });

    module('form with one text input');
    asyncTest('input type = "text"', function () {
        const $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('input type = "search"', function () {
        const $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $input = $('<input type="search">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('input type = "url"', function () {
        const $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $input = $('<input type="url">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('input type = "number"', function () {
        const $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $input = $('<input type="number">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('input type = "tel"', function () {
        const $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $input = $('<input type="tel">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('input type = "password"', function () {
        const $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $input = $('<input type="password">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('input type = "email"', function () {
        const $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $input = $('<input type="email">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    asyncTest('input type = "date"', function () {
        const $form          = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $input         = $('<input type="' + 'date' + '">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        //webkit does not submit date input on enter
        checkSubmitRaisedOnEnterPress($form, $input, !browserUtils.isWebKit || browserUtils.isSafari);
    });

    asyncTest('input type = "time"', function () {
        const $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $input = $('<input type="time">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        //webkit does not submit time input on enter
        checkSubmitRaisedOnEnterPress($form, $input, !browserUtils.isWebKit || browserUtils.isSafari);
    });

    asyncTest('input type = "radio"', function () {
        const $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $input = $('<input type="radio">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, false);
    });

    asyncTest('input type = "url" with invalid value', function () {
        const $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $input = $('<input type="url">').addClass(TEST_ELEMENT_CLASS).val('test').appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, isInputValueValid($input));
    });

    module('form with two different type inputs');
    asyncTest('one text input and one not-text input (type = "checkbox"), text input is focused', function () {
        const $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $input = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="checkbox">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, true);
    });

    (browserUtils.isFirefox ? QUnit.skip : asyncTest)('one text input and one not-text input (type = "checkbox"), checkbox is focused', function () {
        const $form  = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $input = $('<input type="checkbox">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        checkSubmitRaisedOnEnterPress($form, $input, browserUtils.isFirefox);
    });

    module('event handlers');
    asyncTest('check all handlers are executed - form with submit button', function () {
        const $form   = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $input  = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        const $button = $('<input type="submit">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        let inlineSubmitHandlerExecuted  = false;
        let jQuerySubmitHandlerExecuted  = false;
        let submitHandlerExecuted        = false;
        let buttonClickHandlerExecuted   = false;
        let inputKeydownHandlerExecuted  = false;
        let inputKeyupHandlerExecuted    = false;
        let inputKeypressHandlerExecuted = false;

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

        const callback = function () {
            ok(jQuerySubmitHandlerExecuted, 'jQuery submit handler executed');
            ok(submitHandlerExecuted, 'submit handler executed');
            ok(inlineSubmitHandlerExecuted, 'inline submit handler executed');
            ok(buttonClickHandlerExecuted, 'button click handler executed');
            ok(inputKeydownHandlerExecuted, 'input keydown handler executed');
            ok(inputKeyupHandlerExecuted, 'input keyup handler executed');

            if (!browserUtils.isAndroid)
                ok(inputKeypressHandlerExecuted, 'input keypress handler executed');

            start();
        };

        $input[0].focus();
        runPressAutomation('enter', callback);
    });

    asyncTest('check all handlers are executed - form without submit button', function () {
        const $form              = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $input             = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        const needToPreventEvent = browserUtils.isFirefox || browserUtils.isSafari && browserUtils.version > 9;

        let inlineSubmitHandlerExecuted  = false;
        let jQuerySubmitHandlerExecuted  = false;
        let submitHandlerExecuted        = false;
        let inputKeydownHandlerExecuted  = false;
        let inputKeyupHandlerExecuted    = false;
        let inputKeypressHandlerExecuted = false;
        let submitFunctionCalled         = false;

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

        const callback = function () {
            ok(jQuerySubmitHandlerExecuted, 'jQuery submit handler executed');
            ok(submitHandlerExecuted, 'submit handler executed');
            ok(inlineSubmitHandlerExecuted, 'inline submit handler executed');
            ok(inputKeydownHandlerExecuted, 'input keydown handler executed');
            ok(inputKeyupHandlerExecuted, 'input keyup handler executed');

            if (!needToPreventEvent)
                ok(submitFunctionCalled, 'submit function called');

            if (!browserUtils.isAndroid)
                ok(inputKeypressHandlerExecuted, 'input keypress handler executed');

            start();
        };

        $input[0].focus();
        runPressAutomation('enter', callback);
    });

    //when enter pressed in a form input, browser sends click event to form submit button
    asyncTest('form must not be submitted if submit button click event was prevented', function () {
        const $form   = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $input  = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        const $button = $('<input type="submit">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        let submitHandlerExecuted = false;
        let clickHandlerExecuted  = false;

        $button[0].addEventListener('click', function (e) {
            clickHandlerExecuted = true;
            e.preventDefault();
        });

        $form[0].addEventListener('submit', function () {
            submitHandlerExecuted = true;
        });

        const callback = function () {
            ok(clickHandlerExecuted, 'click executed');
            ok(!submitHandlerExecuted, 'submit not executed');
            start();
        };

        $input[0].focus();
        runPressAutomation('enter', callback);
    });

    asyncTest('form must not be submitted if enter keydown event was prevented', function () {
        const $form          = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $input         = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        const ENTER_KEY_CODE = 13;

        let keydownHandlerExecuted = false;
        let submitHandlerExecuted  = false;

        $('<input type="submit">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        $input.bind('keydown', function (e) {
            keydownHandlerExecuted = true;
            if (e.keyCode === ENTER_KEY_CODE)
                e.preventDefault();
        });

        $form[0].addEventListener('submit', function () {
            submitHandlerExecuted = true;
        });

        const callback = function () {
            ok(keydownHandlerExecuted, 'keydown handler was executed');
            ok(!submitHandlerExecuted, 'submit handler was not executed');
            start();
        };

        $input[0].focus();
        runPressAutomation('enter', callback);
    });

    asyncTest('form must not be submitted if it has inputs with failed validation', function () {
        const $form       = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $input      = $('<input type="text">').addClass(TEST_ELEMENT_CLASS).appendTo($form);
        const $emailInput = $('<input type="email">').addClass(TEST_ELEMENT_CLASS).val('test').appendTo($form);
        const $button     = $('<input type="submit">').addClass(TEST_ELEMENT_CLASS).appendTo($form);

        let submitHandlerExecuted = false;
        let clickHandlerExecuted  = false;

        $button[0].addEventListener('click', function () {
            clickHandlerExecuted = true;
        });

        $form[0].addEventListener('submit', function (e) {
            submitHandlerExecuted = true;
            e.preventDefault();
        });

        const callback = function () {
            ok(clickHandlerExecuted, 'click executed');
            equal(submitHandlerExecuted, isInputValueValid($emailInput));

            start();
        };

        $input[0].focus();
        runPressAutomation('enter', callback);
    });
});
