var testCafeCore      = window.getTestCafeModule('testCafeCore');
var parseKeySequence  = testCafeCore.get('./utils/parse-key-sequence');
var domUtils          = testCafeCore.get('./utils/dom');
var textSelection     = testCafeCore.get('./utils/text-selection');

var testCafeAutomation = window.getTestCafeModule('testCafeAutomation');
var PressAutomation    = testCafeAutomation.Press;

testCafeCore.preventRealEvents();

var hammerhead    = window.getTestCafeModule('hammerhead');
var iframeSandbox = hammerhead.sandbox.iframe;
var browserUtils  = hammerhead.utils.browser;
var nativeMethods = hammerhead.nativeMethods;


$(document).ready(function () {
    var $input = null;

    //constants
    var TEST_ELEMENT_CLASS = 'testElement';


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
        var press = new PressAutomation(parseKeySequence('left a').combinations, {});

        press
            .run()
            .then(function () {
                equal($input[0].value, 'tesat');
                start();
            });
    });

    asyncTest('press +', function () {
        var press = new PressAutomation(parseKeySequence('+ shift++').combinations, {});

        press
            .run()
            .then(function () {
                equal($input[0].value, 'test++');
                start();
            });
    });

    asyncTest('press space', function () {
        var press = new PressAutomation(parseKeySequence('left space').combinations, {});

        press
            .run()
            .then(function () {
                equal($input[0].value, 'tes t');
                start();
            });
    });

    asyncTest('press shift+a', function () {
        var press = new PressAutomation(parseKeySequence('shift+a').combinations, {});

        press
            .run()
            .then(function () {
                equal($input[0].value, 'testA');
                start();
            });
    });

    asyncTest('press shift+1', function () {
        var press = new PressAutomation(parseKeySequence('shift+1').combinations, {});

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

        var press = new PressAutomation(parseKeySequence('tab').combinations, {});

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
        var $input2 = $('<input type="text" id="$input2" class="input"/>')
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo($('body'))
            .attr('tabIndex', 1);

        $input.attr('tabIndex', 2);
        domUtils.getActiveElement().blur();
        $('body').focus();

        var press = new PressAutomation(parseKeySequence('tab').combinations, {});

        press
            .run()
            .then(function () {
                deepEqual(domUtils.getActiveElement(), $input2[0]);
                start();
            });
    });

    asyncTest('press tab with iframe', function () {
        var $iframe = $('<iframe id="test1" src="about:blank"/>')
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo($('body'));

        var $iframeInput = $('<input type="text" id="iframeInput"/>')
            .addClass(TEST_ELEMENT_CLASS);

        window.QUnitGlobals.waitForIframe($iframe[0])
            .then(function () {
                $($iframe.contents()[0]).find('body').append($iframeInput);

                domUtils.getActiveElement().blur();
                $input.focus();

                var press = new PressAutomation(parseKeySequence('tab').combinations, {});

                press
                    .run()
                    .then(function () {
                        ok(domUtils.getActiveElement() !== $input[0]);
                        start();
                    });
            });
    });

    module('regression tests');

    if (!browserUtils.isSafari && (!browserUtils.isChrome || browserUtils.version > 53)) {
        asyncTest('T334620 - Wrong "key" property in keyEvent objects (press)', function () {
            var textarea = document.createElement('textarea');

            textarea.className = TEST_ELEMENT_CLASS;

            document.body.appendChild(textarea);

            var keydownKeyProperty  = '';
            var keypressKeyProperty = '';
            var keyupKeyProperty    = '';

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

            var press = new PressAutomation(parseKeySequence('a A shift+a ! enter shift+1 shift+!').combinations, {});

            press
                .run()
                .then(function () {
                    equal(keydownKeyProperty, 'aAShiftAShift!EnterShift!Shift!');
                    equal(keypressKeyProperty, 'aAA!Enter!!');
                    equal(keyupKeyProperty, 'aAAShift!ShiftEnter!Shift!Shift');
                    equal(textarea.value, 'aAA!\n!!');
                    start();
                });
        });
    }
    else {
        asyncTest('T334620 - Wrong "keyIdentifier" property in keyEvent objects (press)', function () {
            var textarea = document.createElement('textarea');

            textarea.className = TEST_ELEMENT_CLASS;

            document.body.appendChild(textarea);

            var keydownKeyIdentifierProperty  = '';
            var keypressKeyIdentifierProperty = '';
            var keyupKeyIdentifierProperty    = '';

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

            var press = new PressAutomation(parseKeySequence('a A shift+a ! enter shift+1 shift+!').combinations, {});

            var s = {
                '!': 'U+0021',
                'a': 'U+0041'
            };

            var expectedKeydownSequence = s['a'] + s['a'] + 'Shift' + s['a'] + 'Shift' + s['!'] + 'Enter' + 'Shift' +
                                          s['!'] + 'Shift' + s['!'];
            var expectedKeyupSequence   = s['a'] + s['a'] + s['a'] + 'Shift' + s['!'] + 'Shift' + 'Enter' + s['!'] +
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
            var input    = $('<input type="text" />').addClass(TEST_ELEMENT_CLASS).appendTo('body')[0];
            var textArea = $('<textarea/>').addClass(TEST_ELEMENT_CLASS).appendTo('body')[0];

            var testNativeValueSetter = function (element, callback) {
                var valueGetter = Object.getOwnPropertyDescriptor(element.constructor.prototype, 'value').get;
                var press = new PressAutomation(parseKeySequence('backspace').combinations, {});

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
