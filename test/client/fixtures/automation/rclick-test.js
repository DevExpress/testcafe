const testCafeAutomation = window.getTestCafeModule('testCafeAutomation');
const RClickAutomation   = testCafeAutomation.RClick;
const ClickOptions       = testCafeAutomation.ClickOptions;

const testCafeCore = window.getTestCafeModule('testCafeCore');

testCafeCore.preventRealEvents();

const hammerhead   = window.getTestCafeModule('hammerhead');
const browserUtils = hammerhead.utils.browser;

const RIGHT_BUTTON_WHICH_PARAMETER = hammerhead.utils.event.WHICH_PARAMETER.rightButton;

$(document).ready(function () {
    //constants
    const TEST_ELEMENT_CLASS = 'testElement';

    //utils
    const addInputElement = function (type, id, x, y) {
        const elementString = ['<input type="', type, '" id="', id, '" value="', id, '" />'].join('');

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

    const startNext = function () {
        if (browserUtils.isIE) {
            removeTestElements();
            window.setTimeout(start, 30);
        }
        else
            start();
    };

    const removeTestElements = function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
    };

    //tests
    QUnit.testDone(function () {
        if (!browserUtils.isIE)
            removeTestElements();
    });

    module('dom events tests');

    asyncTest('mouse events raised', function () {
        let $input            = null;
        let mousedownRaised   = false;
        let mouseupRaised     = false;
        let clickRaised       = false;
        let contextmenuRaised = false;

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

            const rclick = new RClickAutomation($input[0], new ClickOptions({ offsetX: 5, offsetY: 5 }));

            rclick
                .run()
                .then(function () {
                    ok(mousedownRaised && mousedownRaised && !clickRaised && contextmenuRaised, 'mouse events were raised');
                    startNext();
                });
        }, 200);
    });

    asyncTest('T191183 - pointer event properties are fixed', function () {
        let mousedownRaised = false;
        let mouseupRaised   = false;
        let contextmenu     = false;

        const $el = addInputElement('button', 'button1', Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100));

        $el.mousedown(function (e) {
            mousedownRaised = true;

            equal(e.button, 2);

            if (!browserUtils.isSafari)
                equal(e.buttons, 2);

            ok(!mouseupRaised && !contextmenu, 'mousedown event was raised first');
        });

        $el.mouseup(function (e) {
            mouseupRaised = true;

            equal(e.button, 2);

            if (!browserUtils.isSafari)
                equal(e.buttons, 0);

            ok(mousedownRaised && !contextmenu, 'mouseup event was raised second');
        });

        $el.contextmenu(function (e) {
            contextmenu = true;

            equal(e.button, 2);

            if (!browserUtils.isSafari)
                equal(e.buttons, 0);

            ok(mousedownRaised && mouseupRaised, 'click event was raised third ');
        });

        const pointerHandler = function (e) {
            equal(e.pointerType, browserUtils.version > 10 ? 'mouse' : 4);

            if (e.type === 'pointerdown')
                equal(e.buttons, 2);

            if (e.type === 'pointerup')
                equal(e.buttons, 0);
        };

        if (browserUtils.isIE && browserUtils.version > 11) {
            $el[0].onpointerdown = pointerHandler;
            $el[0].onpointerup   = pointerHandler;
        }
        else {
            $el[0].onmspointerdown = pointerHandler;
            $el[0].onmspointerup   = pointerHandler;
        }

        const rclick = new RClickAutomation($el[0], new ClickOptions({ offsetX: 5, offsetY: 5 }));

        rclick
            .run()
            .then(function () {
                ok(mousedownRaised && mousedownRaised && contextmenu, 'mouse events were raised');

                if (browserUtils.isIE)
                    expect(14);
                else if (browserUtils.isSafari)
                    expect(7);
                else
                    expect(10);

                startNext();
            });
    });
});
