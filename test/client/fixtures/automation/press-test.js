const testCafeCore      = window.getTestCafeModule('testCafeCore');
const parseKeySequence  = testCafeCore.get('./utils/parse-key-sequence');
const domUtils          = testCafeCore.get('./utils/dom');
const textSelection     = testCafeCore.get('./utils/text-selection');

const testCafeAutomation = window.getTestCafeModule('testCafeAutomation');
const PressAutomation    = testCafeAutomation.Press;

testCafeCore.preventRealEvents();

const hammerhead    = window.getTestCafeModule('hammerhead');
const iframeSandbox = hammerhead.sandbox.iframe;
const browserUtils  = hammerhead.utils.browser;
const nativeMethods = hammerhead.nativeMethods;


$(document).ready(function () {
    let $input = null;

    //constants
    const TEST_ELEMENT_CLASS = 'testElement';


    //tests
    QUnit.testStart(function () {
        $input          = $('<input type="text" id="input" class="input"/>').addClass(TEST_ELEMENT_CLASS).appendTo($('body'));
        $input[0].value = 'test';
        $input[0].focus();

        textSelection.select($input[0], 4, 4);

        iframeSandbox.on(iframeSandbox.RUN_TASK_SCRIPT_EVENT, window.initIFrameTestHandler);
        iframeSandbox.off(iframeSandbox.RUN_TASK_SCRIPT_EVENT, iframeSandbox.iframeReadyToInitHandler);
    });

    QUnit.testDone(function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
        iframeSandbox.off(iframeSandbox.RUN_TASK_SCRIPT_EVENT, window.initIFrameTestHandler);
    });

    module('different scenarios');

    asyncTest('press a', function () {
        const press = new PressAutomation(parseKeySequence('left a').combinations, {});

        press
            .run()
            .then(function () {
                equal($input[0].value, 'tesat');
                start();
            });
    });

    asyncTest('press +', function () {
        const press = new PressAutomation(parseKeySequence('+ shift++').combinations, {});

        press
            .run()
            .then(function () {
                equal($input[0].value, 'test++');
                start();
            });
    });

    asyncTest('press space', function () {
        const press = new PressAutomation(parseKeySequence('left space').combinations, {});

        press
            .run()
            .then(function () {
                equal($input[0].value, 'tes t');
                start();
            });
    });

    asyncTest('press shift+a', function () {
        const press = new PressAutomation(parseKeySequence('shift+a').combinations, {});

        press
            .run()
            .then(function () {
                equal($input[0].value, 'testA');
                start();
            });
    });

    asyncTest('press shift+1', function () {
        const press = new PressAutomation(parseKeySequence('shift+1').combinations, {});

        press
            .run()
            .then(function () {
                equal($input[0].value, 'test!');
                start();
            });
    });

    asyncTest('press tab', function () {
        domUtils.getActiveElement().blur();
        $('body').focus();
        $input.attr('tabIndex', 1);

        const press = new PressAutomation(parseKeySequence('tab').combinations, {});

        press
            .run()
            .then(function () {
                deepEqual(domUtils.getActiveElement(), $input[0]);
                equal($input[0].selectionStart, 0);
                equal($input[0].selectionEnd, $input[0].value.length);
                start();
            });
    });

    asyncTest('press tab with tabIndexes', function () {
        const $input2 = $('<input type="text" id="$input2" class="input"/>')
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo($('body'))
            .attr('tabIndex', 1);

        $input.attr('tabIndex', 2);
        domUtils.getActiveElement().blur();
        $('body').focus();

        const press = new PressAutomation(parseKeySequence('tab').combinations, {});

        press
            .run()
            .then(function () {
                deepEqual(domUtils.getActiveElement(), $input2[0]);
                start();
            });
    });

    asyncTest('press tab with iframe', function () {
        const $iframe = $('<iframe id="test1" src="about:blank"/>')
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo($('body'));

        const $iframeInput = $('<input type="text" id="iframeInput"/>')
            .addClass(TEST_ELEMENT_CLASS);

        window.QUnitGlobals.waitForIframe($iframe[0])
            .then(function () {
                $($iframe.contents()[0]).find('body').append($iframeInput);

                domUtils.getActiveElement().blur();
                $input.focus();

                const press = new PressAutomation(parseKeySequence('tab').combinations, {});

                press
                    .run()
                    .then(function () {
                        ok(domUtils.getActiveElement() !== $input[0]);
                        start();
                    });
            });
    });

    module('regression tests');

    asyncTest('T334620, GH-3282 - Wrong "key" property in keyEvent objects (press)', function () {
        const textarea = document.createElement('textarea');

        textarea.className = TEST_ELEMENT_CLASS;

        document.body.appendChild(textarea);

        let keydownKeyProperty  = '';
        let keypressKeyProperty = '';
        let keyupKeyProperty    = '';

        textarea.focus();

        textarea.addEventListener('keydown', function (e) {
            keydownKeyProperty += e.key;
        });

        textarea.addEventListener('keypress', function (e) {
            keypressKeyProperty += e.key;
        });

        textarea.addEventListener('keyup', function (e) {
            keyupKeyProperty += e.key;
        });

        const press = new PressAutomation(parseKeySequence('a A shift+a ! enter shift+1 shift+!').combinations, {});

        const expectedKeydownKeyProperty  = 'aAShiftAShift!EnterShift!Shift!';
        const expectedKeypressKeyProperty =  browserUtils.isAndroid ? '' : 'aAA!Enter!!';
        const expectedKeyupKeyProperty    = 'aAAShift!ShiftEnter!Shift!Shift';
        const expectedTextAreaValue       = 'aAA!\n!!';

        press
            .run()
            .then(function () {
                equal(keydownKeyProperty, expectedKeydownKeyProperty);
                equal(keypressKeyProperty, expectedKeypressKeyProperty);
                equal(keyupKeyProperty, expectedKeyupKeyProperty);
                equal(textarea.value, expectedTextAreaValue);
                start();
            });
    });

    if (browserUtils.isSafari) {
        asyncTest('T334620 - Wrong "keyIdentifier" property in keyEvent objects (press)', function () {
            const textarea = document.createElement('textarea');

            textarea.className = TEST_ELEMENT_CLASS;

            document.body.appendChild(textarea);

            let keydownKeyIdentifierProperty  = '';
            let keypressKeyIdentifierProperty = '';
            let keyupKeyIdentifierProperty    = '';

            textarea.focus();

            textarea.addEventListener('keydown', function (e) {
                keydownKeyIdentifierProperty += e.keyIdentifier;
            });

            textarea.addEventListener('keypress', function (e) {
                keypressKeyIdentifierProperty += e.keyIdentifier;
            });

            textarea.addEventListener('keyup', function (e) {
                keyupKeyIdentifierProperty += e.keyIdentifier;
            });

            const press = new PressAutomation(parseKeySequence('a A shift+a ! enter shift+1 shift+!').combinations, {});

            const s = {
                '!': 'U+0021',
                'a': 'U+0041'
            };

            const expectedKeydownSequence = s['a'] + s['a'] + 'Shift' + s['a'] + 'Shift' + s['!'] + 'Enter' + 'Shift' +
                                          s['!'] + 'Shift' + s['!'];
            const expectedKeyupSequence   = s['a'] + s['a'] + s['a'] + 'Shift' + s['!'] + 'Shift' + 'Enter' + s['!'] +
                                          'Shift' + s['!'] + 'Shift';

            press
                .run()
                .then(function () {
                    equal(keydownKeyIdentifierProperty, expectedKeydownSequence);
                    equal(keypressKeyIdentifierProperty, '');
                    equal(keyupKeyIdentifierProperty, expectedKeyupSequence);
                    equal(textarea.value, 'aAA!\n!!');
                    start();
                });
        });
    }

    if (nativeMethods.inputValueSetter) {
        asyncTest('call native setter of the value property (GH-1558)', function () {
            const input    = $('<input type="text" />').addClass(TEST_ELEMENT_CLASS).appendTo('body')[0];
            const textArea = $('<textarea/>').addClass(TEST_ELEMENT_CLASS).appendTo('body')[0];

            const testNativeValueSetter = function (element, callback) {
                const valueGetter = Object.getOwnPropertyDescriptor(element.constructor.prototype, 'value').get;
                const press = new PressAutomation(parseKeySequence('backspace').combinations, {});

                element.value = '1';
                element.focus();
                element.setSelectionRange(1, 1);

                Object.defineProperty(element, 'value', {
                    get: function () {
                        return valueGetter.call(element);
                    },
                    set: function () {
                        ok(false);
                    }
                });

                press
                    .run()
                    .then(function () {
                        equal(element.value, '');
                        callback();
                    });
            };

            testNativeValueSetter(input, function () {
                testNativeValueSetter(textArea, function () {
                    start();
                });
            });
        });
    }
});
