var hammerhead = window.getTestCafeModule('hammerhead');
var browser    = hammerhead.Util.Browser;
var hh_event      = hammerhead.Util.Event;

var testCafeCore = window.getTestCafeModule('testCafeCore');
var position     = testCafeCore.get('./util/position');

var testCafeRunner = window.getTestCafeModule('testCafeRunner');
var actionsAPI     = testCafeRunner.get('./api/actions');
var automation     = testCafeRunner.get('./automation/automation');
var StepIterator   = testCafeRunner.get('./step-iterator');

var testCafeUI = window.getTestCafeModule('testCafeUI');
var cursor     = testCafeUI.get('./cursor');


automation.init();
cursor.init();

var stepIterator = new StepIterator();
actionsAPI.init(stepIterator);

var correctTestWaitingTime = function (time) {
    if (browser.isTouchDevice && browser.isMozilla)
        return time * 2;

    return time;
};

var TEST_COMPLETE_WAITING_TIMEOUT = 2000;

$(document).ready(function () {
    var actionTargetWaitingCounter = 0,
        actionRunCounter           = 0;

    StepIterator.prototype.asyncActionSeries = function (items, runArgumentsIterator, action) {
        var seriesActionsRun = function (elements, callback) {
            window.async.forEachSeries(
                elements,
                function (element, seriaCallback) {
                    action(element, seriaCallback);
                },
                function () {
                    callback();
                });
        };

        runArgumentsIterator(items, seriesActionsRun, asyncActionCallback);
    };

    StepIterator.prototype.onActionTargetWaitingStarted = function () {
        actionTargetWaitingCounter++;
    };

    StepIterator.prototype.onActionRun = function () {
        actionRunCounter++;
    };

    //constants
    var TEST_ELEMENT_CLASS = 'testElement',

        //utils
        asyncActionCallback,

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

        runAsyncTest       = function (actions, assertions, timeout) {
            var callbackFunction = function () {
                clearTimeout(timeoutId);
                assertions();
                startNext();
            };
            asyncActionCallback  = function () {
                callbackFunction();
            };
            actions();
            var timeoutId        = setTimeout(function () {
                callbackFunction = function () {
                };
                ok(false, 'Timeout is exceeded');
                startNext();
            }, timeout);
        },

        startNext          = function () {
            if (browser.isIE) {
                removeTestElements();
                window.setTimeout(start, 30);
            }
            else
                start();
        },

        removeTestElements = function () {
            $('.' + TEST_ELEMENT_CLASS).remove();
        };

    //tests
    QUnit.testStart(function () {
        asyncActionCallback = function () {
        };

        actionTargetWaitingCounter = 0;
        actionRunCounter           = 0;
    });

    QUnit.testDone(function () {
        if (!browser.isIE)
            removeTestElements();
    });

    module('dom events tests');

    asyncTest('mouse events raised', function () {
        var $input            = null,

            mousedownRaised   = false,
            mouseupRaised     = false,
            clickRaised       = false,
            contextmenuRaised = false;
        runAsyncTest(
            function () {
                $input = addInputElement('button', 'button1', Math.floor(Math.random() * 100),
                    Math.floor(Math.random() * 100));

                window.setTimeout(function () {
                    $input.mousedown(function (e) {
                        mousedownRaised = true;
                        ok(e.which, hh_event.WHICH_PARAMETER.RIGHT_BUTTON);
                        ok(!mouseupRaised && !clickRaised && !contextmenuRaised, 'mousedown event was raised first');
                    });
                    $input.mouseup(function (e) {
                        mouseupRaised = true;
                        ok(e.which, hh_event.WHICH_PARAMETER.RIGHT_BUTTON);
                        ok(mousedownRaised && !clickRaised && !contextmenuRaised, 'mouseup event was raised second');
                    });
                    $input.click(function () {
                        clickRaised = true;
                    });
                    $input.contextmenu(function (e) {
                        contextmenuRaised = true;
                        ok(e.which, hh_event.WHICH_PARAMETER.RIGHT_BUTTON);
                        deepEqual(cursor.getAbsolutePosition(), position.findCenter(this), 'check cursor position');
                        ok(mousedownRaised && mouseupRaised && !clickRaised, 'contextmenu event was raised third ');
                    });
                    actionsAPI.rclick($input[0]);
                }, 200);
            },
            function () {
                ok(mousedownRaised && mousedownRaised && !clickRaised && contextmenuRaised, 'mouse events were raised');
                equal(actionTargetWaitingCounter, 1);
                equal(actionRunCounter, 1);
                expect(10);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('T191183 - pointer event properties are fixed', function () {
        var $el             = null,
            mousedownRaised = false,
            mouseupRaised   = false,
            contextmenu     = false;
        runAsyncTest(
            function () {
                $el = addInputElement('button', 'button1', Math.floor(Math.random() * 100),
                    Math.floor(Math.random() * 100));

                $el.mousedown(function (e) {
                    mousedownRaised = true;

                    equal(e.button, 2);
                    if (browser.isIE || browser.isMozilla)
                        equal(e.buttons, 2);

                    ok(!mouseupRaised && !contextmenu, 'mousedown event was raised first');
                });
                $el.mouseup(function (e) {
                    mouseupRaised = true;

                    equal(e.button, 2);
                    if (browser.isIE || browser.isMozilla)
                        equal(e.buttons, 2);

                    ok(mousedownRaised && !contextmenu, 'mouseup event was raised second');
                });
                $el.contextmenu(function (e) {
                    contextmenu = true;

                    equal(e.button, 2);
                    if (browser.isIE || browser.isMozilla)
                        equal(e.buttons, 2);

                    deepEqual(cursor.getAbsolutePosition(), position.findCenter(this), 'check cursor position');
                    ok(mousedownRaised && mouseupRaised, 'click event was raised third ');
                });

                var pointerHandler = function (e) {
                    equal(e.pointerType, browser.version > 10 ? 'mouse' : 4);
                    equal(e.button, 2);
                    equal(e.buttons, 2);
                };

                if (browser.isIE && browser.version > 11) {
                    $el[0].onpointerdown = pointerHandler;
                    $el[0].onpointerup   = pointerHandler;
                }
                else {
                    $el[0].onmspointerdown = pointerHandler;
                    $el[0].onmspointerup   = pointerHandler;
                }

                actionsAPI.rclick($el[0]);
            },
            function () {
                ok(mousedownRaised && mousedownRaised && contextmenu, 'mouse events were raised');
                if (browser.isMozilla || browser.isIE9)
                    expect(11);
                else if (browser.isIE)
                    expect(17);
                else
                    expect(8);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });
});
