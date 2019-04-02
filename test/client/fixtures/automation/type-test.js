const hammerhead    = window.getTestCafeModule('hammerhead');
const browserUtils  = hammerhead.utils.browser;
const nativeMethods = hammerhead.nativeMethods;

const testCafeCore      = window.getTestCafeModule('testCafeCore');
const parseKeySequence  = testCafeCore.get('./utils/parse-key-sequence');

const testCafeAutomation = window.getTestCafeModule('testCafeAutomation');
const TypeAutomation     = testCafeAutomation.Type;
const PressAutomation    = testCafeAutomation.Press;
const TypeOptions        = testCafeAutomation.get('../../test-run/commands/options').TypeOptions;

testCafeCore.preventRealEvents();

$(document).ready(function () {
    let $commonInput = null;

    //constants
    const TEST_ELEMENT_CLASS = 'testElement';


    //tests
    QUnit.testStart(function () {
        $commonInput = $('<input type="text" id="input" class="input"/>').addClass(TEST_ELEMENT_CLASS).appendTo($('body'));
    });

    QUnit.testDone(function () {
        $('body').focus();
        $('.' + TEST_ELEMENT_CLASS).remove();
    });

    asyncTest('typetext events', function () {
        let keydownCount    = 0;
        let keyupCount      = 0;
        let keypressCount   = 0;
        let mouseclickCount = 0;

        $commonInput
            .keydown(function () {
                keydownCount++;
            })
            .keyup(function () {
                keyupCount++;
            })
            .keypress(function () {
                keypressCount++;
            })
            .click(function () {
                mouseclickCount++;
            });

        const type = new TypeAutomation($commonInput[0], 'HI', new TypeOptions({ offsetX: 5, offsetY: 5 }));

        type
            .run()
            .then(function () {
                const expectedKeydownCount    = 2;
                const expectedKeypressCount   = browserUtils.isAndroid ? 0 : 2;
                const expectedKeyupCount      = 2;
                const expectedMouseClickCount = 1;

                equal(keydownCount, expectedKeydownCount, 'keydown event raises twice');
                equal(keyupCount, expectedKeyupCount, 'keyup event raises twice');
                equal(keypressCount, expectedKeypressCount, 'keypress event raises twice');
                equal(mouseclickCount, expectedMouseClickCount, 'click event raises once');

                start();
            });
    });

    asyncTest('input value changed', function () {
        $('<input type="text" id="input1" class="input"/>').addClass(TEST_ELEMENT_CLASS).appendTo($('body'));

        const $inputs = $('.' + TEST_ELEMENT_CLASS);
        const text    = 'Hello, world!';

        const firstType = new TypeAutomation($inputs[0], text, new TypeOptions({ offsetX: 5, offsetY: 5 }));

        firstType
            .run()
            .then(function () {
                const secondType = new TypeAutomation($inputs[1], text, new TypeOptions({ offsetX: 5, offsetY: 5 }));

                return secondType.run();
            })
            .then(function () {
                equal($inputs[0].value, text, 'first elements value setted');
                equal($inputs[1].value, text, 'second elements value setted');

                start();
            });
    });

    if (!browserUtils.isAndroid) {
        asyncTest('correct keyCode', function () {
            const key = 'k';

            $commonInput[0].onkeypress = function (e) {
                equal((e || window.event).keyCode, key.charCodeAt(0), 'keypress event argument is correct');
            };

            const type = new TypeAutomation($commonInput[0], key, new TypeOptions({ offsetX: 5, offsetY: 5 }));

            type
                .run()
                .then(function () {
                    expect(1);
                    start();
                });
        });
    }

    asyncTest('typetext to inner input', function () {
        const $outerDiv = $('<div></div>')
            .css({
                width:  '100px',
                height: '50px'
            })
            .addClass(TEST_ELEMENT_CLASS).appendTo('body');

        const text = 'Hi';

        $commonInput.appendTo($outerDiv);

        const type = new TypeAutomation($outerDiv[0], text, new TypeOptions());

        type
            .run()
            .then(function () {
                equal($commonInput[0].value, text, 'text to inner input has been written');
                start();
            });
    });

    asyncTest('do not click when element is focused', function () {
        const text = 'test';

        let clickCount = 0;

        $commonInput.click(function () {
            clickCount++;
        });

        $commonInput[0].focus();

        const type = new TypeAutomation($commonInput[0], text, new TypeOptions());

        type
            .run()
            .then(function () {
                equal(clickCount, 0);
                equal($commonInput[0].value, text, 'text to inner input has been written');
                start();
            });
    });

    asyncTest('set option.replace to true to replace current text', function () {
        const text = 'new text';

        $commonInput[0].value = 'old text';

        const type = new TypeAutomation($commonInput[0], text, new TypeOptions({ replace: true, offsetX: 5, offsetY: 5 }));

        type
            .run()
            .then(function () {
                equal($commonInput[0].value, text, 'old text replaced');
                start();
            });
    });

    asyncTest('set option.paste to true to insert all text in one keystroke', function () {
        const text = 'new text';

        let keydownCount    = 0;
        let keyupCount      = 0;
        let keypressCount   = 0;

        $commonInput[0].value = '';

        $commonInput[0].addEventListener('keydown', function () {
            keydownCount++;
        });
        $commonInput[0].addEventListener('keypress', function () {
            keypressCount++;
        });
        $commonInput[0].addEventListener('keyup', function () {
            keyupCount++;
        });

        const type = new TypeAutomation($commonInput[0], text, new TypeOptions({ paste: true, offsetX: 5, offsetY: 5 }));

        const expectedKeydownCount  = 1;
        const expectedKeypressCount = browserUtils.isAndroid ? 0 : 1;
        const expectedKeyupCount    = 1;

        type
            .run()
            .then(function () {
                equal($commonInput[0].value, text, 'text entered in one keystroke');
                equal(keydownCount, expectedKeydownCount, 'keydown event raises once');
                equal(keyupCount, expectedKeyupCount, 'keyup event raises once');
                equal(keypressCount, expectedKeypressCount, 'keypress event raises once');
                start();
            });
    });

    asyncTest('do not change readonly inputs value', function () {
        const $input1      = $('<input type="text" readonly />').addClass(TEST_ELEMENT_CLASS).appendTo($('body'));
        const $input2      = $('<input type="text" value="value" />').attr('readonly', 'readonly').addClass(TEST_ELEMENT_CLASS).appendTo($('body'));
        const oldInput1Val = $input1.val();
        const oldInput2Val = $input2.val();

        const firstType = new TypeAutomation($input1[0], 'test', new TypeOptions());

        firstType
            .run()
            .then(function () {
                const secondType = new TypeAutomation($input2[0], 'test', new TypeOptions());

                return secondType.run();
            })
            .then(function () {
                ok($input1.val() === oldInput1Val);
                ok($input2.val() === oldInput2Val);
                start();
            });
    });

    module('regression tests');

    asyncTest('input event raising (B253410)', function () {
        const $input = $('<input type="text" />').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $div   = $('<div></div>').addClass(TEST_ELEMENT_CLASS).appendTo('body');

        $input.bind('input', function () {
            $div.text($div.text() + $input.val());
            $input.val('');
        });

        const type = new TypeAutomation($input[0], 'test', new TypeOptions({ offsetX: 5, offsetY: 5 }));

        type
            .run()
            .then(function () {
                equal($div.text(), 'test');
                equal($input.val(), '');
                start();
            });
    });

    if (!browserUtils.isAndroid) {
        asyncTest('change event must not be raised if keypress was prevented (B253816)', function () {
            const $input = $('<input type="text" />').addClass(TEST_ELEMENT_CLASS).appendTo('body');

            let changed = false;

            $input.bind('change', function () {
                changed = true;
            });

            const firstType = new TypeAutomation($input[0], 'test', new TypeOptions({ offsetX: 5, offsetY: 5 }));

            firstType
                .run()
                .then(function () {
                    $input[0].blur();

                    ok(changed, 'check change event was raised if keypress was not prevented');

                    changed = false;

                    $input.bind('keypress', function (e) {
                        e.target.value += String.fromCharCode(e.keyCode);
                        return false;
                    });

                    const secondType = new TypeAutomation($input[0], 'new', new TypeOptions({ offsetX: 5, offsetY: 5 }));

                    return secondType.run();
                })
                .then(function () {
                    $input[0].blur();

                    ok(!changed, 'check change event was not raised if keypress was prevented');
                    start();
                });
        });
    }

    asyncTest('keypress args must contain charCode of the symbol, not keyCode', function () {
        const $input   = $('<input type="text" />').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const symbol   = '!';
        const charCode = 33;
        const keyCode  = 49;

        $input.bind('keypress', function (e) {
            equal(e.keyCode, charCode, 'keyCode on keypress checked');
            equal(e.charCode, charCode, 'charCode on keypress checked');
        });

        $input.bind('keydown', function (e) {
            equal(e.keyCode, keyCode, 'keyCode on keydown checked');
        });

        const type = new TypeAutomation($input[0], symbol, new TypeOptions({ offsetX: 5, offsetY: 5 }));

        type
            .run()
            .then(function () {
                equal($input.val(), symbol, 'input value checked');
                start();
            });
    });

    asyncTest('T138385 - "input" event is raised if symbol count more than "maxlength" attribute (act.type)', function () {
        const $input          = $('<input type="text" maxlength="3"/>').addClass(TEST_ELEMENT_CLASS).appendTo('body');

        let inputEventCount = 0;

        $input.bind('input', function () {
            inputEventCount++;
        });

        const type = new TypeAutomation($input[0], 'test', new TypeOptions({ offsetX: 5, offsetY: 5 }));

        type
            .run()
            .then(function () {
                equal(inputEventCount, 4);
                equal($input.val(), 'tes');
                start();
            });
    });

    asyncTest('T138385 - "input" event is raised if symbol count more than "maxlength" attribute (act.press)', function () {
        const $input = $('<input type="text" maxlength="3"/>').addClass(TEST_ELEMENT_CLASS).appendTo('body');

        let inputEventCount = 0;

        $input.bind('input', function () {
            inputEventCount++;
        });

        $input.focus();

        const press = new PressAutomation(parseKeySequence('t e s t').combinations, {});

        press
            .run()
            .then(function () {
                equal(inputEventCount, 4);
                equal($input.val(), 'tes');
                start();
            });
    });

    asyncTest('T239547: TD15.1 - Playback problems on https://jsfiddle.net/', function () {
        const $input   = $('<input type="text" />').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const charCode = 45;
        const keyCode  = browserUtils.isFirefox ? 173 : 189;

        $input.bind('keypress', function (e) {
            equal(e.keyCode, charCode, 'keyCode on keypress checked');
            equal(e.charCode, charCode, 'charCode on keypress checked');
        });

        $input.bind('keydown', function (e) {
            equal(e.keyCode, keyCode, 'keyCode on keydown checked');
        });

        const type = new TypeAutomation($input[0], '-', new TypeOptions({ offsetX: 5, offsetY: 5 }));

        type
            .run()
            .then(function () {
                equal($input.val(), '-', 'input value checked');
                start();
            });
    });


    asyncTest('T334620, GH-3282 - Wrong "key" property in keyEvent objects (type)', function () {
        const textarea = document.createElement('textarea');

        textarea.className = TEST_ELEMENT_CLASS;

        document.body.appendChild(textarea);

        let keydownKeyProperty  = '';
        let keypressKeyProperty = '';
        let keyupKeyProperty    = '';

        textarea.addEventListener('keydown', function (e) {
            keydownKeyProperty += e.key;
        });

        textarea.addEventListener('keypress', function (e) {
            keypressKeyProperty += e.key;
        });

        textarea.addEventListener('keyup', function (e) {
            keyupKeyProperty += e.key;
        });

        const type = new TypeAutomation(textarea, 'aA \r', new TypeOptions({ offsetX: 1, offsetY: 1 }));

        type
            .run()
            .then(function () {
                const expectedKeydownKeyProperty  = 'aA Enter';
                const expectedKeypressKeyProperty = browserUtils.isAndroid ? '' : 'aA Enter';
                const expectedKeyupKeyProperty    = 'aA Enter';
                const expectedTextareaValue       = 'aA \n';

                equal(keydownKeyProperty, expectedKeydownKeyProperty);
                equal(keypressKeyProperty, expectedKeypressKeyProperty);
                equal(keyupKeyProperty, expectedKeyupKeyProperty);
                equal(textarea.value, expectedTextareaValue);

                start();
            });
    });

    if (browserUtils.isSafari) {
        asyncTest('T334620 - Wrong "keyIdentifier" property in keyEvent objects (type)', function () {
            const textarea = document.createElement('textarea');

            textarea.className = TEST_ELEMENT_CLASS;

            document.body.appendChild(textarea);

            let keydownKeyIdentifierProperty  = '';
            let keypressKeyIdentifierProperty = '';
            let keyupKeyIdentifierProperty    = '';

            textarea.addEventListener('keydown', function (e) {
                keydownKeyIdentifierProperty += e.keyIdentifier;
            });

            textarea.addEventListener('keypress', function (e) {
                keypressKeyIdentifierProperty += e.keyIdentifier;
            });

            textarea.addEventListener('keyup', function (e) {
                keyupKeyIdentifierProperty += e.keyIdentifier;
            });

            const type = new TypeAutomation(textarea, 'aA \r', new TypeOptions({ offsetX: 1, offsetY: 1 }));

            const s = {
                ' ': 'U+0020',
                'a': 'U+0041'
            };

            const expectedKeySequence = s['a'] + s['a'] + s[' '] + 'Enter';

            type
                .run()
                .then(function () {
                    equal(keydownKeyIdentifierProperty, expectedKeySequence);
                    equal(keypressKeyIdentifierProperty, '');
                    equal(keyupKeyIdentifierProperty, expectedKeySequence);
                    equal(textarea.value, 'aA \n');
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
                const type        = new TypeAutomation(element, '1', new TypeOptions({ offsetX: 5, offsetY: 5 }));

                Object.defineProperty(element, 'value', {
                    get: function () {
                        return valueGetter.call(element);
                    },
                    set: function () {
                        ok(false);
                    }
                });

                type
                    .run()
                    .then(function () {
                        equal(element.value, '1');
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
