var hammerhead       = window.getTestCafeModule('hammerhead');
var browserUtils     = hammerhead.utils.browser;
var featureDetection = hammerhead.utils.featureDetection;

var testCafeAutomation = window.getTestCafeModule('testCafeAutomation');
var HoverAutomation    = testCafeAutomation.Hover;
var MouseOptions       = testCafeAutomation.get('../../test-run/commands/options').MouseOptions;

var testCafeCore = window.getTestCafeModule('testCafeCore');
var position     = testCafeCore.get('./utils/position');

testCafeCore.preventRealEvents();


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

    //tests
    QUnit.testDone(function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
    });

    if (!featureDetection.isTouchDevice) {
        asyncTest('check mouseover and mouseout event', function () {
            var $el1 = addInputElement('button', 'button1', 200, 200);
            var $el2 = addInputElement('button', 'button1', 400, 400);

            var mouseOver1Raised = false;
            var mouseOut1Raised  = false;
            var mouseOver2Raised = false;

            $el1.mouseover(function () {
                mouseOver1Raised = true;
            });

            $el1.mouseout(function () {
                mouseOut1Raised = true;
            });

            $el2.mouseover(function () {
                mouseOver2Raised = true;
            });

            var firstHover = new HoverAutomation($el1[0], new MouseOptions({ offsetX: 5, offsetY: 5 }));

            firstHover
                .run()
                .then(function () {
                    ok(mouseOver1Raised);

                    var secondHover = new HoverAutomation($el2[0], new MouseOptions({ offsetX: 5, offsetY: 5 }));

                    return secondHover.run();
                })
                .then(function () {
                    ok(mouseOut1Raised);
                    ok(mouseOver2Raised);

                    start();
                });
        });


        asyncTest('T188166 - act.hover trigger "mouseenter" event with "which" parameter 1', function () {
            var $el = addInputElement('button', 'button1', 200, 200);

            $el.mouseover(function (e) {
                equal(window.getProperty(e, 'which'), browserUtils.isWebKit ? 0 : 1);
                equal(window.getProperty(e.originalEvent, 'which'), browserUtils.isWebKit ? 0 : 1);
            });

            $el.mouseenter(function (e) {
                equal(window.getProperty(e, 'which'), browserUtils.isWebKit ? 0 : 1);
                equal(window.getProperty(e.originalEvent, 'which'), browserUtils.isWebKit ? 0 : 1);
            });

            $el[0].addEventListener('mouseover', function (e) {
                equal(window.getProperty(e, 'which'), browserUtils.isWebKit ? 0 : 1);
            });

            var hover = new HoverAutomation($el[0], new MouseOptions({ offsetX: 5, offsetY: 5 }));

            hover
                .run()
                .then(function () {
                    expect(5);
                    start();
                });
        });

        asyncTest('T191183 - pointer event properties are fixed', function () {
            var $el                  = addInputElement('button', 'button1', 400, 400);
            var mouseoverRaised      = false;
            var mouseoverWhichParam  = null;
            var mouseenterRaised     = false;
            var mouseenterWhichParam = null;

            $el.mouseover(function (e) {
                mouseoverRaised     = true;
                mouseoverWhichParam = window.getProperty(e, 'which');

                equal(e.button, 0);

                if (browserUtils.isIE || browserUtils.isFirefox)
                    equal(e.buttons, 0);
            });

            $el.mouseenter(function (e) {
                mouseenterRaised     = true;
                mouseenterWhichParam = window.getProperty(e, 'which');

                equal(e.button, 0);

                if (browserUtils.isIE || browserUtils.isFirefox)
                    equal(e.buttons, 0);
            });

            var pointerHandler = function (e) {
                equal(e.pointerType, browserUtils.version > 10 ? 'mouse' : 4);
                equal(e.button, -1);
                equal(e.buttons, 0);
            };

            if (browserUtils.isIE && browserUtils.version > 11) {
                $el[0].onpointermove = pointerHandler;
                $el[0].onpointerover = pointerHandler;
            }
            else {
                $el[0].onmspointermove = pointerHandler;
                $el[0].onmspointerover = pointerHandler;
            }

            var hover = new HoverAutomation($el[0], new MouseOptions({ offsetX: 5, offsetY: 5 }));

            hover
                .run()
                .then(function () {
                    ok(mouseoverRaised);
                    ok(mouseenterRaised);
                    equal(mouseoverWhichParam, browserUtils.isWebKit ? 0 : 1);
                    equal(mouseenterWhichParam, browserUtils.isWebKit ? 0 : 1);

                    if (browserUtils.isFirefox || browserUtils.isIE9)
                        expect(8);
                    else if (browserUtils.isIE)
                        expect(17);
                    else
                        expect(6);
                    start();
                });
        });

        asyncTest('T214458 - The Hover action does not allow specifying mouse action options thus being inconsistent with other actions', function () {
            var $el                = addInputElement('button', 'button1', 200, 200);
            var elementOffset      = position.getOffsetPosition($el[0]);
            var actionOffset       = 10;
            var lastMouseMoveEvent = null;

            $el.mousemove(function (e) {
                lastMouseMoveEvent = e;
            });

            var hover = new HoverAutomation($el[0], new MouseOptions({
                modifiers: { shift: true },
                offsetX:   actionOffset,
                offsetY:   actionOffset
            }));

            hover
                .run()
                .then(function () {
                    equal(lastMouseMoveEvent.pageX, elementOffset.left + actionOffset);
                    equal(lastMouseMoveEvent.pageY, elementOffset.top + actionOffset);
                    ok(lastMouseMoveEvent.shiftKey);

                    start();
                });
        });
    }
});
