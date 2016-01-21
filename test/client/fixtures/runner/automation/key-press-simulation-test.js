var hammerhead   = window.getTestCafeModule('hammerhead');
var browserUtils = hammerhead.utils.browser;

var testCafeCore = window.getTestCafeModule('testCafeCore');
var eventUtils   = testCafeCore.get('./utils/event');

var testCafeRunner  = window.getTestCafeModule('testCafeRunner');
var automation      = testCafeRunner.get('./automation/automation');
var PressAutomation = testCafeRunner.get('./automation/playback/press');
var parseKeyString  = testCafeRunner.get('./automation/playback/press/parse-key-string');
var KEY_MAPS        = testCafeRunner.get('./utils/key-maps');

automation.init();

$(document).ready(function () {
    var $el                = null,

        //constants
        TEST_ELEMENT_CLASS = 'testElement',

        //utils
        addInputElement    = function (type, id, x, y) {
            var elementString = ['<input type="', type, '" id="', id, '" value="', id, '" />'].join('');
            return $(elementString)
                .css({
                    position:   'absolute',
                    marginLeft: x + 'px',
                    marginTop:  y + 'px'
                })
                .addClass(type)
                .addClass(TEST_ELEMENT_CLASS)
                .appendTo('body');
        },

        eventsLog          = '',
        eventsSeparator    = '-',
        logEvent           = function (e) {
            eventsLog = [
                eventsLog,
                getEventLog(e)
            ].join(eventsSeparator);
        },
        createCheckingLog  = function (events) {
            var log = '';
            for (var i = 0; i < events.length; i++) {
                log = [
                    log,
                    getEventLog(events[i])
                ].join(eventsSeparator);
            }
            return log;
        },
        getEventLog        = function (e) {
            return [
                e.type,
                e.keyCode || 0,
                e.charCode || 0,
                e.ctrlKey || false,
                e.shiftKey || false,
                e.altKey || false
            ].join(' ');
        },

        //keyCodes
        KEYCODES           = {
            shift: 16,
            ctrl:  17,
            alt:   18,

            enter: 13,
            end:   35,

            a: 65,
            b: 66,

            A: 65,

            '1': 49,
            '"': 222
        },
        CHARCODES          = {
            a: 97,
            b: 98,

            A: 65,

            '1': 49,
            '!': 33,
            '"': 34
        };

    //tests
    QUnit.testStart(function () {
        $el = addInputElement('button', 'button1', Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100));

        $el[0].focus();

        $el.keydown(function (e) {
            logEvent(e);
        });
        $el.keypress(function (e) {
            logEvent(e);
        });
        $el.keyup(function (e) {
            logEvent(e);
        });
    });

    QUnit.testDone(function () {
        eventsLog = '';
        $('.' + TEST_ELEMENT_CLASS).remove();
    });

    function testKeysPress (keyString, expectedEvents) {
        var keyCombinations = parseKeyString(keyString).combinations;
        var pressAutomation = new PressAutomation(keyCombinations);

        pressAutomation
            .run()
            .then(function () {
                equal(eventsLog, createCheckingLog(expectedEvents), 'events are correct');
                start();
            });
    }

    function runPressAutomation (keyString, callback) {
        var keyCombinations = parseKeyString(keyString).combinations;
        var pressAutomation = new PressAutomation(keyCombinations);

        pressAutomation
            .run()
            .then(callback);
    }

    module('events raising');
    asyncTest('press literal symbol', function () {
        var literal        = 'a';
        var expectedEvents = [
            { type: 'keydown', keyCode: KEYCODES[literal] },
            { type: 'keypress', keyCode: CHARCODES[literal], charCode: CHARCODES[literal] },
            { type: 'keyup', keyCode: KEYCODES[literal] }
        ];

        testKeysPress(literal, expectedEvents);
    });

    asyncTest('press literal symbol uppercase', function () {
        var literal        = 'A';
        var expectedEvents = [
            { type: 'keydown', keyCode: KEYCODES[literal] },
            { type: 'keypress', keyCode: CHARCODES[literal], charCode: CHARCODES[literal] },
            { type: 'keyup', keyCode: KEYCODES[literal] }
        ];

        testKeysPress(literal, expectedEvents);
    });

    asyncTest('press two literal symbols', function () {
        var aLiteral = 'a',
            bLiteral = 'b';

        var expectedEvents = [
            { type: 'keydown', keyCode: KEYCODES[aLiteral] },
            { type: 'keypress', keyCode: CHARCODES[aLiteral], charCode: CHARCODES[aLiteral] },
            { type: 'keydown', keyCode: KEYCODES[bLiteral] },
            { type: 'keypress', keyCode: CHARCODES[bLiteral], charCode: CHARCODES[bLiteral] },
            { type: 'keyup', keyCode: KEYCODES[bLiteral] },
            { type: 'keyup', keyCode: KEYCODES[aLiteral] }
        ];

        testKeysPress(aLiteral + '+' + bLiteral, expectedEvents);
    });

    asyncTest('press literal with ctrl', function () {
        var literal        = 'b';
        var expectedEvents = [
            { type: 'keydown', keyCode: KEYCODES.ctrl, ctrlKey: true },
            { type: 'keydown', keyCode: KEYCODES[literal], ctrlKey: true },
            { type: 'keypress', keyCode: CHARCODES[literal], charCode: CHARCODES[literal], ctrlKey: true },
            { type: 'keyup', keyCode: KEYCODES[literal], ctrlKey: true },
            { type: 'keyup', keyCode: KEYCODES.ctrl }
        ];

        testKeysPress('ctrl+b', expectedEvents);
    });

    asyncTest('press number key', function () {
        var literal        = '1';
        var expectedEvents = [
            { type: 'keydown', keyCode: KEYCODES[literal] },
            { type: 'keypress', keyCode: CHARCODES[literal], charCode: CHARCODES[literal] },
            { type: 'keyup', keyCode: KEYCODES[literal] }
        ];

        testKeysPress(literal, expectedEvents);
    });

    asyncTest('press special key', function () {
        var specialKey     = 'enter',
            specialKeyCode = KEYCODES[specialKey];

        var expectedEvents = [
            { type: 'keydown', keyCode: specialKeyCode },
            { type: 'keypress', keyCode: specialKeyCode, charCode: specialKeyCode },
            { type: 'keyup', keyCode: specialKeyCode }
        ];

        testKeysPress(specialKey, expectedEvents);
    });

    asyncTest('press mapped modifier', function () {
        var expectedEvents = [
            { type: 'keydown', keyCode: KEYCODES.alt, altKey: true },
            { type: 'keyup', keyCode: KEYCODES.alt }
        ];

        testKeysPress('option', expectedEvents);
    });

    asyncTest('symbols with icorrect keycode', function () {
        var expectedEvents = [
            { type: 'keydown', keyCode: KEYCODES['shift'], shiftKey: true },
            { type: 'keydown', keyCode: KEYCODES['"'], shiftKey: true },
            { type: 'keypress', keyCode: CHARCODES['"'], charCode: CHARCODES['"'], shiftKey: true },
            { type: 'keyup', keyCode: KEYCODES['"'], shiftKey: true },
            { type: 'keyup', keyCode: KEYCODES['shift'] }
        ];

        testKeysPress('"', expectedEvents);
    });

    module('shift key');
    //press(shift+a)
    asyncTest('shift+a', function () {
        var literal      = 'a',
            upperLiteral = literal.toUpperCase();

        var expectedEvents = [
            { type: 'keydown', keyCode: KEYCODES.shift, shiftKey: true },
            { type: 'keydown', keyCode: KEYCODES[literal], shiftKey: true },
            { type: 'keypress', keyCode: CHARCODES[upperLiteral], charCode: CHARCODES[upperLiteral], shiftKey: true },
            { type: 'keyup', keyCode: KEYCODES[literal], shiftKey: true },
            { type: 'keyup', keyCode: KEYCODES.shift }
        ];

        testKeysPress('shift+a', expectedEvents);
    });
    //press(shift+A)
    asyncTest('shift+A', function () {
        var literal      = 'A',
            lowerLiteral = literal.toLowerCase();

        var expectedEvents = [
            { type: 'keydown', keyCode: KEYCODES.shift, shiftKey: true },
            { type: 'keydown', keyCode: KEYCODES[literal], shiftKey: true },
            { type: 'keypress', keyCode: CHARCODES[lowerLiteral], charCode: CHARCODES[lowerLiteral], shiftKey: true },
            { type: 'keyup', keyCode: KEYCODES[literal], shiftKey: true },
            { type: 'keyup', keyCode: KEYCODES.shift }
        ];

        testKeysPress('shift+A', expectedEvents);
    });

    var literal                        = '1',
        modifiedLiteral                = '!';
    var expectedEventsShift_1_Pressing = [
        { type: 'keydown', keyCode: KEYCODES.shift, shiftKey: true },
        { type: 'keydown', keyCode: KEYCODES[literal], shiftKey: true },
        { type: 'keypress', keyCode: CHARCODES[modifiedLiteral], charCode: CHARCODES[modifiedLiteral], shiftKey: true },
        { type: 'keyup', keyCode: KEYCODES[literal], shiftKey: true },
        { type: 'keyup', keyCode: KEYCODES.shift }
    ];

    asyncTest('shift+1', function () {
        testKeysPress('shift+1', expectedEventsShift_1_Pressing);
    });

    asyncTest('shift+!', function () {
        testKeysPress('shift+!', expectedEventsShift_1_Pressing);
    });

    asyncTest('!', function () {
        testKeysPress('!', expectedEventsShift_1_Pressing);
    });

    module('Regression tests');
    asyncTest('B237817 - ASPxComboBox - pressing "ctrl+end" via act.press does not work', function () {
        var expectedEvents = [
            { type: 'keydown', keyCode: KEYCODES.ctrl, ctrlKey: true },
            { type: 'keydown', keyCode: KEYCODES.end, ctrlKey: true }
        ];

        if (browserUtils.isFirefox)
            expectedEvents.push({ type: 'keypress', keyCode: KEYCODES.end, charCode: KEYCODES.end, ctrlKey: true });

        expectedEvents.push({ type: 'keyup', keyCode: KEYCODES.end, ctrlKey: true });
        expectedEvents.push({ type: 'keyup', keyCode: KEYCODES.ctrl });

        testKeysPress('ctrl+end', expectedEvents);
    });

    asyncTest('B237084 - Client instance works incorrect after "enter" key has been pressed on the focused control', function () {
        var clickRaisedCount = 0,
            $input           = $('<input type="button">').addClass(TEST_ELEMENT_CLASS)
                .click(function () {
                    clickRaisedCount++;
                })
                .appendTo('body');

        $input[0].focus();

        window.setTimeout(function () {
            runPressAutomation('enter', function () {
                equal(clickRaisedCount, 1);

                runPressAutomation('space', function () {
                    equal(clickRaisedCount, 2);

                    start();
                });
            });
        });
    });

    asyncTest('B237122 - Client instance works incorrect after "space" key has been pressed on the focused control', function () {
        var input = $('<input>').addClass(TEST_ELEMENT_CLASS).appendTo('body')[0];

        input.addEventListener('keyup', function (ev) {
            equal(ev.keyCode, KEY_MAPS.specialKeys.space);
        });

        input.focus();
        window.setTimeout(function () {
            runPressAutomation('space', function () {
                expect(1);
                start();
            });
        }, 100);
    });

    asyncTest('B254435 - TestCafe allows act.press with service keys in input in firefox browser if there is call preventDefault() in keypress event handler', function () {
        var value = 'text',
            input = $('<input>').attr('value', value).addClass(TEST_ELEMENT_CLASS).appendTo('body')[0];

        input.addEventListener('keypress', function (ev) {
            eventUtils.preventDefault(ev);
        });

        input.focus();

        runPressAutomation('ctrl+a', function () {
            runPressAutomation('delete', function () {
                equal(input.value, browserUtils.isFirefox ? value : '');

                start();
            });
        });
    });
});
