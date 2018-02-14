var testCafeAutomation = window.getTestCafeModule('testCafeAutomation');
var RClickAutomation   = testCafeAutomation.RClick;
var ClickOptions       = testCafeAutomation.get('../../test-run/commands/options').ClickOptions;

var testCafeCore = window.getTestCafeModule('testCafeCore');

testCafeCore.preventRealEvents();

var hammerhead   = window.getTestCafeModule('hammerhead');
var browserUtils = hammerhead.utils.browser;

var RIGHT_BUTTON_WHICH_PARAMETER = hammerhead.utils.event.WHICH_PARAMETER.rightButton;

$(document).ready(function () {
    //constants
    var TEST_ELEMENT_CLASS = 'testElement';

    //utils
    var addInputElement = function (type, id, x, y) {
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
    };

    var startNext = function () {
        if (browserUtils.isIE) {
            removeTestElements();
            window.setTimeout(start, 30);
        }
        else
            start();
    };

    var removeTestElements = function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
    };

    //tests
    QUnit.testDone(function () {
        if (!browserUtils.isIE)
            removeTestElements();
    });

    module('dom events tests');

    asyncTest('mouse events raised', function () {
        var $input            = null;
        var mousedownRaised   = false;
        var mouseupRaised     = false;
        var clickRaised       = false;
        var contextmenuRaised = false;

        $input = addInputElement('button', 'button1', Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100));

        window.setTimeout(function () {
            $input.mousedown(function (e) {
                mousedownRaised = true;
                ok(e.which, RIGHT_BUTTON_WHICH_PARAMETER);
                ok(!mouseupRaised && !clickRaised && !contextmenuRaised, 'mousedown event was raised first');
            });
            $input.mouseup(function (e) {
                mouseupRaised = true;
                ok(e.which, RIGHT_BUTTON_WHICH_PARAMETER);
                ok(mousedownRaised && !clickRaised && !contextmenuRaised, 'mouseup event was raised second');
            });
            $input.click(function () {
                clickRaised = true;
            });
            $input.contextmenu(function (e) {
                contextmenuRaised = true;
                ok(e.which, RIGHT_BUTTON_WHICH_PARAMETER);
                ok(mousedownRaised && mouseupRaised && !clickRaised, 'contextmenu event was raised third ');
            });

            var rclick = new RClickAutomation($input[0], new ClickOptions({ offsetX: 5, offsetY: 5 }));

            rclick
                .run()
                .then(function () {
                    ok(mousedownRaised && mousedownRaised && !clickRaised && contextmenuRaised, 'mouse events were raised');
                    startNext();
                });
        }, 200);
    });

    asyncTest('T191183 - pointer event properties are fixed', function () {
        var mousedownRaised = false;
        var mouseupRaised   = false;
        var contextmenu     = false;

        var $el = addInputElement('button', 'button1', Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100));

        $el.mousedown(function (e) {
            mousedownRaised = true;

            equal(e.button, 2);

            if (browserUtils.isIE || browserUtils.isFirefox)
                equal(e.buttons, 2);

            ok(!mouseupRaised && !contextmenu, 'mousedown event was raised first');
        });

        $el.mouseup(function (e) {
            mouseupRaised = true;

            equal(e.button, 2);

            if (browserUtils.isIE || browserUtils.isFirefox)
                equal(e.buttons, 2);

            ok(mousedownRaised && !contextmenu, 'mouseup event was raised second');
        });

        $el.contextmenu(function (e) {
            contextmenu = true;

            equal(e.button, 2);

            if (browserUtils.isIE || browserUtils.isFirefox)
                equal(e.buttons, 2);

            ok(mousedownRaised && mouseupRaised, 'click event was raised third ');
        });

        var pointerHandler = function (e) {
            equal(e.pointerType, browserUtils.version > 10 ? 'mouse' : 4);
            equal(e.button, 2);
            equal(e.buttons, 2);
        };

        if (browserUtils.isIE && browserUtils.version > 11) {
            $el[0].onpointerdown = pointerHandler;
            $el[0].onpointerup   = pointerHandler;
        }
        else {
            $el[0].onmspointerdown = pointerHandler;
            $el[0].onmspointerup   = pointerHandler;
        }

        var rclick = new RClickAutomation($el[0], new ClickOptions({ offsetX: 5, offsetY: 5 }));

        rclick
            .run()
            .then(function () {
                ok(mousedownRaised && mousedownRaised && contextmenu, 'mouse events were raised');

                if (browserUtils.isFirefox || browserUtils.isIE9)
                    expect(10);
                else if (browserUtils.isIE)
                    expect(16);
                else
                    expect(7);

                startNext();
            });
    });
});
