var testCafeAutomation = window.getTestCafeModule('testCafeAutomation');
var DblClickAutomation = testCafeAutomation.DblClick;
var ClickOptions       = testCafeAutomation.get('../../test-run/commands/options').ClickOptions;

var testCafeCore      = window.getTestCafeModule('testCafeCore');

testCafeCore.preventRealEvents();

$(document).ready(function () {
    var $el = null;

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
        var clickCount    = 0;
        var dblclickCount = 0;

        $el
            .click(
                function () {
                    clickCount++;
                })
            .dblclick(function () {
                dblclickCount++;
            });

        var dblClick = new DblClickAutomation($el[0], new ClickOptions({ offsetX: 5, offsetY: 5 }));

        dblClick
            .run()
            .then(function () {
                equal(clickCount, 2, 'click raised twice');
                equal(dblclickCount, 1, 'dblclick raised once');

                start();
            });
    });
});
