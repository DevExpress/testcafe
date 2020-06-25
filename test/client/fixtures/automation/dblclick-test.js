const testCafeAutomation = window.getTestCafeModule('testCafeAutomation');
const DblClickAutomation = testCafeAutomation.DblClick;
const ClickOptions       = testCafeAutomation.ClickOptions;

const testCafeCore      = window.getTestCafeModule('testCafeCore');

testCafeCore.preventRealEvents();

$(document).ready(function () {
    let $el = null;

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

    //tests
    QUnit.testStart(function () {
        $el = addInputElement('button', 'button1', Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100));
    });

    QUnit.testDone(function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
    });

    module('event tests');

    asyncTest('dom events', function () {
        let clickCount    = 0;
        let dblclickCount = 0;

        $el
            .click(
                function () {
                    clickCount++;
                })
            .dblclick(function () {
                dblclickCount++;
            });

        const dblClick = new DblClickAutomation($el[0], new ClickOptions({ offsetX: 5, offsetY: 5 }));

        dblClick
            .run()
            .then(function () {
                equal(clickCount, 2, 'click raised twice');
                equal(dblclickCount, 1, 'dblclick raised once');

                start();
            });
    });
});
