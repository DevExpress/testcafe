var hammerhead   = window.getTestCafeModule('hammerhead');
var browserUtils = hammerhead.utils.browser;

var testCafeCore = window.getTestCafeModule('testCafeCore');
var transport    = testCafeCore.get('./transport');

var testCafeRunner = window.getTestCafeModule('testCafeRunner');
var StepIterator   = testCafeRunner.get('./step-iterator');
var actionsAPI     = testCafeRunner.get('./api/actions');
var automation     = testCafeRunner.get('./automation/automation');

var testCafeUI = window.getTestCafeModule('testCafeUI');
var cursor     = testCafeUI.get('./cursor');


automation.init();
cursor.init();

var stepIterator = new StepIterator();
actionsAPI.init(stepIterator);


var correctTestWaitingTime = function (time) {
    if (browserUtils.isTouchDevice && browserUtils.isMozilla)
        return time * 2;

    return time;
};

actionsAPI.ELEMENT_AVAILABILITY_WAITING_TIMEOUT = 400;

var TEST_COMPLETE_WAITING_TIMEOUT = 2000;

$(document).ready(function () {
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

    transport.fatalError = function (err) {
        currentErrorType = err.type;
        if (err.element)
            currentErrorElement = err.element;
    };

    var currentErrorType                    = null,
        currentErrorElement                 = null,
        //constants
        TEST_ELEMENT_CLASS                  = 'testElement',

        //utils
        asyncActionCallback,

        addInputElement                     = function (x, y, value) {
            var elementString = ['<input type="text" value="', value, '" />'].join('');
            return $(elementString)
                .css({
                    position: 'absolute',
                    left:     x + 'px',
                    top:      y + 'px'
                })
                .addClass(TEST_ELEMENT_CLASS)
                .appendTo('body')
        },

        addDiv                              = function (x, y) {
            return $('<div />')
                .css({
                    position: 'absolute',
                    left:     x,
                    top:      y,
                    border:   '1px solid black'
                })
                .width(150)
                .height(150)
                .addClass(TEST_ELEMENT_CLASS)
                .appendTo('body');
        },

        runAsyncTest                        = function (actions, assertions, timeout) {
            var callbackFunction = function () {
                clearTimeout(timeoutId);
                assertions();
                startNext();
            };
            asyncActionCallback  = function () {
                callbackFunction();
            };
            actions();
            var timeoutId = setTimeout(function () {
                callbackFunction = function () {
                };
                ok(false, 'Timeout is exceeded');
                startNext();
            }, timeout);
        },

        startNext                           = function () {
            if (browserUtils.isIE) {
                removeTestElements();
                window.setTimeout(start, 30);
            }
            else
                start();
        },

        removeTestElements                  = function () {
            $('.' + TEST_ELEMENT_CLASS).remove();
        },

        createMouseMonitorEventObject       = function () {
            return {
                elementOneMousedownRaised:   false,
                elementOneMouseupRaised:     false,
                elementOneClickRaised:       false,
                elementOneRClickRaised:      false,
                elementOneDblClickRaised:    false,
                elementOneContextMenuRaised: false,
                elementOneSelectRaised:      false,
                elementOneMousedownCount:    0,
                elementOneMouseupCount:      0,
                elementOneClickCount:        0,

                elementTwoMousedownRaised:   false,
                elementTwoMouseupRaised:     false,
                elementTwoClickRaised:       false,
                elementTwoRClickRaised:      false,
                elementTwoDblClickRaised:    false,
                elementTwoContextMenuRaised: false,
                elementTwoSelectRaised:      false,
                elementTwoMousedownCount:    0,
                elementTwoMouseupCount:      0,
                elementTwoClickCount:        0
            }
        },

        createKeyMonitorEventObject         = function () {
            return {
                elementsOneKeydownRaised:  false,
                elementsOneKeypressRaised: false,
                elementsOneKeyupRaised:    false,

                elementsTwoKeydownRaised:  false,
                elementsTwoKeypressRaised: false,
                elementsTwoKeyupRaised:    false
            }
        },

        bindMouseHandlersToSwappingElements = function ($el1, $el2, eventName, eventMonitorObject, checkMousemove, toSecondHandler) {
            var isSecondEvent = false;
            $el1.bind('mousedown', function (e) {
                eventMonitorObject.elementOneMousedownRaised = true;
                eventMonitorObject.elementOneMousedownCount++;

                if (e.type === eventName && (!toSecondHandler || isSecondEvent))
                    swapLocationOfElements($el1, $el2);

                if (!isSecondEvent && eventName === e.type)
                    isSecondEvent = true;
            });

            $el1.bind('mouseup', function (e) {
                eventMonitorObject.elementOneMouseupRaised = true;
                eventMonitorObject.elementOneMouseupCount++;


                if (e.type === eventName && (!toSecondHandler || isSecondEvent))
                    swapLocationOfElements($el1, $el2);

                if (!isSecondEvent && eventName === e.type)
                    isSecondEvent = true;
            });

            $el1.bind('click', function (e) {
                eventMonitorObject.elementOneClickRaised = true;
                eventMonitorObject.elementOneClickCount++;

                if (e.type === eventName && (!toSecondHandler || isSecondEvent))
                    swapLocationOfElements($el1, $el2);

                if (!isSecondEvent && eventName === e.type)
                    isSecondEvent = true;
            });

            $el1.bind('contextmenu', function (e) {
                eventMonitorObject.elementOneRClickRaised = true;

                if (e.type === eventName)
                    swapLocationOfElements($el1, $el2);
            });

            $el1.bind('dblclick', function (e) {
                eventMonitorObject.elementOneDblClickRaised = true;

                if (e.type === eventName)
                    swapLocationOfElements($el1, $el2);
            });

            $el2.bind('mousedown', function () {
                eventMonitorObject.elementTwoMousedownRaised = true;
                eventMonitorObject.elementTwoMousedownCount++;
            });

            $el2.bind('mouseup', function () {
                eventMonitorObject.elementTwoMouseupRaised = true;
                eventMonitorObject.elementTwoMouseupCount++;
            });

            $el2.bind('click', function () {
                eventMonitorObject.elementTwoClickRaised = true;
                eventMonitorObject.elementTwoClickCount++;
            });

            $el2.bind('contextmenu', function () {
                eventMonitorObject.elementTwoRClickRaised = true;

            });

            $el2.bind('dblclick', function () {
                eventMonitorObject.elementTwoDblClickRaised = true;
            });

            if (checkMousemove) {
                $el1.bind('mousemove', function () {
                    if ((eventMonitorObject.elementOneMousedownRaised && !eventMonitorObject.elementOneMouseupRaised) ||
                        (eventMonitorObject.elementTwoMousedownRaised && !eventMonitorObject.elementTwoMouseupRaised))
                        eventMonitorObject.elementOneSelectRaised = true;
                });

                $el2.bind('mousemove', function () {
                    if ((eventMonitorObject.elementOneMousedownRaised && !eventMonitorObject.elementOneMouseupRaised) ||
                        (eventMonitorObject.elementTwoMousedownRaised && !eventMonitorObject.elementTwoMouseupRaised))
                        eventMonitorObject.elementTwoSelectRaised = true;
                });
            }
        },

        bindKeyHandlersToSwappingElements   = function ($el1, $el2, eventName, eventMonitorObject) {
            $el1.bind('keydown', function (e) {
                eventMonitorObject.elementsOneKeydownRaised = true;

                if (e.type === eventName)
                    $el2.focus();
            });

            $el1.bind('keypress', function (e) {
                eventMonitorObject.elementsOneKeypressRaised = true;

                if (e.type === eventName)
                    $el2.focus();
            });

            $el1.bind('keyup', function (e) {
                eventMonitorObject.elementsOneKeyupRaised = true;

                if (e.type === eventName)
                    $el2.focus();
            });


            $el2.bind('keydown', function () {
                eventMonitorObject.elementsTwoKeydownRaised = true;
            });

            $el2.bind('keypress', function () {
                eventMonitorObject.elementsTwoKeypressRaised = true;
            });

            $el2.bind('keyup', function () {
                eventMonitorObject.elementsTwoKeyupRaised = true;
            });
        },

        bindHandlerToTouchEvents            = function ($el1, $el2, eventName, eventMonitorObject, checkMousemove) {
            $el1.bind('touchstart', function (e) {
                eventMonitorObject.elementOneMousedownRaised = true;
                eventMonitorObject.elementOneMousedownCount++;

                if (eventName === e.type)
                    swapLocationOfElements($el1, $el2);
            });

            $el1.bind('touchend', function (e) {
                eventMonitorObject.elementOneMouseupRaised = true;
                eventMonitorObject.elementOneMouseupCount++;

                if (eventName === e.type)
                    swapLocationOfElements($el1, $el2);
            });

            $el1.bind('click', function (e) {
                eventMonitorObject.elementOneClickRaised = true;
                eventMonitorObject.elementOneClickCount++;

                if (eventName === e.type)
                    swapLocationOfElements($el1, $el2);
            });

            $el2.bind('touchstart', function (e) {
                eventMonitorObject.elementTwoMousedownRaised = true;
                eventMonitorObject.elementTwoMousedownCount++;

                if (eventName === e.type)
                    swapLocationOfElements($el1, $el2);
            });

            $el2.bind('touchend', function (e) {
                eventMonitorObject.elementTwoMouseupRaised = true;
                eventMonitorObject.elementTwoMouseupCount++;

                if (eventName === e.type)
                    swapLocationOfElements($el1, $el2);
            });

            $el2.bind('click', function (e) {
                eventMonitorObject.elementTwoClickRaised = true;
                eventMonitorObject.elementTwoClickCount++;

                if (eventName === e.type)
                    swapLocationOfElements($el1, $el2);
            });

            if (checkMousemove) {
                $el1.bind('touchmove', function () {
                    if ((eventMonitorObject.elementOneMousedownRaised && !eventMonitorObject.elementOneMouseupRaised) ||
                        (eventMonitorObject.elementTwoMousedownRaised && !eventMonitorObject.elementTwoMouseupRaised))
                        eventMonitorObject.elementOneSelectRaised = true;
                });

                $el2.bind('touchmove', function () {
                    if ((eventMonitorObject.elementOneMousedownRaised && !eventMonitorObject.elementOneMouseupRaised) ||
                        (eventMonitorObject.elementTwoMousedownRaised && !eventMonitorObject.elementTwoMouseupRaised))
                        eventMonitorObject.elementTwoSelectRaised = true;
                });
            }
        },

        swapLocationOfElements              = function ($el1, $el2) {
            var left1 = $el1.css('left'),
                top1  = $el1.css('top'),
                left2 = $el2.css('left'),
                top2  = $el2.css('top');

            $el1.css({
                left: left2,
                top:  top2
            });

            $el2.css({
                left: left1,
                top:  top1
            });
        },

        createIFrame                        = function ($element, src, callback) {
            var $iFrame = $('<iframe/>')
                .attr('src', src)
                .css({
                    width:  '600px',
                    height: '600px'
                })
                .addClass(TEST_ELEMENT_CLASS);
            $element.addClass(TEST_ELEMENT_CLASS);

            var onLoadHandler = function () {
                $($iFrame[0].contentWindow.document.body).append($element);
                $iFrame.unbind('load', onLoadHandler);
                callback();
            };

            $iFrame.bind('load', onLoadHandler);
            $iFrame.appendTo($('body'));
        };

    $('<div></div>').css({ width: 1, height: 1500, position: 'absolute' }).appendTo('body');
    $('body').css('height', '1500px');

    //tests
    QUnit.testStart(function () {
        asyncActionCallback = function () {
        };
    });

    QUnit.testDone(function () {
        if (!browserUtils.isIE)
            removeTestElements();
        currentErrorType    = null;
        currentErrorElement = null;
    });

    module('detection element under cursor after events simulation');

    asyncTest('click - change element on "mousedown" event', function () {
        var $div1              = null,
            $div2              = null,

            eventMonitorObject = createMouseMonitorEventObject();

        runAsyncTest(
            function () {
                $div1 = addDiv(100, 100).css('background-color', 'red');
                $div2 = addDiv(100, 300).css('background-color', 'green');

                bindMouseHandlersToSwappingElements($div1, $div2, 'mousedown', eventMonitorObject);

                actionsAPI.click($div1[0]);
            },
            function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(!eventMonitorObject.elementOneMouseupRaised);
                ok(!eventMonitorObject.elementOneClickRaised);

                ok(!eventMonitorObject.elementTwoMousedownRaised);
                ok(eventMonitorObject.elementTwoMouseupRaised);
                ok(!eventMonitorObject.elementTwoClickRaised);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('click - change element on "mouseup" event', function () {
        var $div1              = null,
            $div2              = null,

            eventMonitorObject = createMouseMonitorEventObject();

        runAsyncTest(
            function () {
                $div1 = addDiv(100, 100).css('background-color', 'red');
                $div2 = addDiv(100, 300).css('background-color', 'green');

                bindMouseHandlersToSwappingElements($div1, $div2, 'mouseup', eventMonitorObject);

                actionsAPI.click($div1[0]);
            },
            function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(eventMonitorObject.elementOneMouseupRaised);
                ok(eventMonitorObject.elementOneClickRaised);

                ok(!eventMonitorObject.elementTwoMousedownRaised);
                ok(!eventMonitorObject.elementTwoMouseupRaised);
                ok(!eventMonitorObject.elementTwoClickRaised);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('click - change element on "click" event', function () {
        var $div1              = null,
            $div2              = null,

            eventMonitorObject = createMouseMonitorEventObject();

        runAsyncTest(
            function () {
                $div1 = addDiv(100, 100).css('background-color', 'red');
                $div2 = addDiv(100, 300).css('background-color', 'green');

                bindMouseHandlersToSwappingElements($div1, $div2, 'click', eventMonitorObject);

                actionsAPI.click($div1[0]);
            },
            function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(eventMonitorObject.elementOneMouseupRaised);
                ok(eventMonitorObject.elementOneClickRaised);

                ok(!eventMonitorObject.elementTwoMousedownRaised);
                ok(!eventMonitorObject.elementTwoMouseupRaised);
                ok(!eventMonitorObject.elementTwoClickRaised);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });


    asyncTest('rclick - change element on "mousedown" event', function () {
        var $div1              = null,
            $div2              = null,

            eventMonitorObject = createMouseMonitorEventObject();

        runAsyncTest(
            function () {
                $div1 = addDiv(100, 100).css('background-color', 'red');
                $div2 = addDiv(100, 300).css('background-color', 'green');

                bindMouseHandlersToSwappingElements($div1, $div2, 'mousedown', eventMonitorObject);

                actionsAPI.rclick($div1[0]);
            },
            function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(!eventMonitorObject.elementOneMouseupRaised);
                ok(!eventMonitorObject.elementOneRClickRaised);

                ok(!eventMonitorObject.elementTwoMousedownRaised);
                ok(eventMonitorObject.elementTwoMouseupRaised);
                ok(eventMonitorObject.elementTwoRClickRaised);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('rclick - change element on "mouseup" event', function () {
        var $div1              = null,
            $div2              = null,

            eventMonitorObject = createMouseMonitorEventObject();

        runAsyncTest(
            function () {
                $div1 = addDiv(100, 100).css('background-color', 'red');
                $div2 = addDiv(100, 300).css('background-color', 'green');

                bindMouseHandlersToSwappingElements($div1, $div2, 'mouseup', eventMonitorObject);

                actionsAPI.rclick($div1[0]);
            },
            function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(eventMonitorObject.elementOneMouseupRaised);
                ok(!eventMonitorObject.elementOneRClickRaised);

                ok(!eventMonitorObject.elementTwoMousedownRaised);
                ok(!eventMonitorObject.elementTwoMouseupRaised);
                ok(eventMonitorObject.elementTwoRClickRaised);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('rclick - change element on "contextmenu" event', function () {
        var $div1              = null,
            $div2              = null,

            eventMonitorObject = createMouseMonitorEventObject();

        runAsyncTest(
            function () {
                $div1 = addDiv(100, 100).css('background-color', 'red');
                $div2 = addDiv(100, 300).css('background-color', 'green');

                bindMouseHandlersToSwappingElements($div1, $div2, 'contextmenu', eventMonitorObject);

                actionsAPI.rclick($div1[0]);
            },
            function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(eventMonitorObject.elementOneMouseupRaised);
                ok(eventMonitorObject.elementOneRClickRaised);

                ok(!eventMonitorObject.elementTwoMousedownRaised);
                ok(!eventMonitorObject.elementTwoMouseupRaised);
                ok(!eventMonitorObject.elementTwoRClickRaised);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });


    asyncTest('select - change element on "mousedown" event', function () {
        var $input1            = null,
            $input2            = null,

            eventMonitorObject = createMouseMonitorEventObject();

        runAsyncTest(
            function () {
                $input1 = addInputElement(200, 200, '12345');
                $input2 = addInputElement(400, 400, 'qwerty');

                if (browserUtils.hasTouchEvents)
                    bindHandlerToTouchEvents($input1, $input2, 'touchstart', eventMonitorObject, true);
                else
                    bindMouseHandlersToSwappingElements($input1, $input2, 'mousedown', eventMonitorObject, true);

                actionsAPI.select($input1[0], 2, 4);
            },
            function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(!eventMonitorObject.elementOneSelectRaised);
                ok(!eventMonitorObject.elementOneMouseupRaised);

                ok(!eventMonitorObject.elementTwoMousedownRaised);
                if (!browserUtils.hasTouchEvents)
                    ok(eventMonitorObject.elementTwoSelectRaised);
                ok(eventMonitorObject.elementTwoMouseupRaised);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('select - change element on "mouseup" event', function () {
        var $input1            = null,
            $input2            = null,

            eventMonitorObject = createMouseMonitorEventObject();

        runAsyncTest(
            function () {
                $input1 = addInputElement(200, 200, '12345');
                $input2 = addInputElement(400, 400, 'qwerty');

                if (browserUtils.hasTouchEvents)
                    bindHandlerToTouchEvents($input1, $input2, 'touchend', eventMonitorObject, true);
                else
                    bindMouseHandlersToSwappingElements($input1, $input2, 'mouseup', eventMonitorObject, true);

                actionsAPI.select($input1[0], 2, 4);
            },
            function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                if (!browserUtils.hasTouchEvents)
                    ok(eventMonitorObject.elementOneSelectRaised);
                ok(eventMonitorObject.elementOneMouseupRaised);

                ok(!eventMonitorObject.elementTwoMousedownRaised);
                ok(!eventMonitorObject.elementTwoSelectRaised);
                ok(!eventMonitorObject.elementTwoMouseupRaised);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });


    asyncTest('dblclick - change element on first "mousedown" event', function () {
        var $div1              = null,
            $div2              = null,

            eventMonitorObject = createMouseMonitorEventObject();

        runAsyncTest(
            function () {
                $div1 = addDiv(100, 100).css('background-color', 'red');
                $div2 = addDiv(100, 300).css('background-color', 'green');

                bindMouseHandlersToSwappingElements($div1, $div2, 'mousedown', eventMonitorObject);

                actionsAPI.dblclick($div1[0]);
            },
            function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(!eventMonitorObject.elementOneMouseupRaised);
                ok(!eventMonitorObject.elementOneClickRaised);
                ok(!eventMonitorObject.elementOneDblClickRaised);
                equal(eventMonitorObject.elementOneMousedownCount, 1);

                ok(eventMonitorObject.elementTwoMousedownRaised);
                ok(eventMonitorObject.elementTwoMouseupRaised);
                ok(eventMonitorObject.elementTwoClickRaised);
                ok(eventMonitorObject.elementTwoDblClickRaised);
                equal(eventMonitorObject.elementTwoMousedownCount, 1);
                equal(eventMonitorObject.elementTwoMouseupCount, 2);
                equal(eventMonitorObject.elementTwoClickCount, 1);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('dblclick - change element on first "mouseup" event', function () {
        var $div1              = null,
            $div2              = null,

            eventMonitorObject = createMouseMonitorEventObject();

        runAsyncTest(
            function () {
                $div1 = addDiv(100, 100).css('background-color', 'red');
                $div2 = addDiv(100, 300).css('background-color', 'green');

                bindMouseHandlersToSwappingElements($div1, $div2, 'mouseup', eventMonitorObject);

                actionsAPI.dblclick($div1[0]);
            },
            function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(eventMonitorObject.elementOneMouseupRaised);
                ok(eventMonitorObject.elementOneClickRaised);
                ok(!eventMonitorObject.elementOneDblClickRaised);
                equal(eventMonitorObject.elementOneMousedownCount, 1);
                equal(eventMonitorObject.elementOneMouseupCount, 1);
                equal(eventMonitorObject.elementOneClickCount, 1);

                ok(eventMonitorObject.elementTwoMousedownRaised);
                ok(eventMonitorObject.elementTwoMouseupRaised);
                ok(eventMonitorObject.elementTwoClickRaised);
                ok(eventMonitorObject.elementTwoDblClickRaised);
                equal(eventMonitorObject.elementTwoMousedownCount, 1);
                equal(eventMonitorObject.elementTwoMouseupCount, 1);
                equal(eventMonitorObject.elementTwoClickCount, 1);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('dblclick - change element on first "click" event', function () {
        var $div1              = null,
            $div2              = null,

            eventMonitorObject = createMouseMonitorEventObject();

        runAsyncTest(
            function () {
                $div1 = addDiv(100, 100).css('background-color', 'red');
                $div2 = addDiv(100, 300).css('background-color', 'green');

                bindMouseHandlersToSwappingElements($div1, $div2, 'click', eventMonitorObject);

                actionsAPI.dblclick($div1[0]);
            },
            function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(eventMonitorObject.elementOneMouseupRaised);
                ok(eventMonitorObject.elementOneClickRaised);
                ok(!eventMonitorObject.elementOneDblClickRaised);
                equal(eventMonitorObject.elementOneMousedownCount, 1);
                equal(eventMonitorObject.elementOneMouseupCount, 1);
                equal(eventMonitorObject.elementOneClickCount, 1);

                ok(eventMonitorObject.elementTwoMousedownRaised);
                ok(eventMonitorObject.elementTwoMouseupRaised);
                ok(eventMonitorObject.elementTwoClickRaised);
                ok(eventMonitorObject.elementTwoDblClickRaised);
                equal(eventMonitorObject.elementTwoMousedownCount, 1);
                equal(eventMonitorObject.elementTwoMouseupCount, 1);
                equal(eventMonitorObject.elementTwoClickCount, 1);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('dblclick - change element on second "mousedown" event', function () {
        var $div1              = null,
            $div2              = null,

            eventMonitorObject = createMouseMonitorEventObject();

        runAsyncTest(
            function () {
                $div1 = addDiv(100, 100).css('background-color', 'red');
                $div2 = addDiv(100, 300).css('background-color', 'green');

                bindMouseHandlersToSwappingElements($div1, $div2, 'mousedown', eventMonitorObject, false, true);

                actionsAPI.dblclick($div1[0]);
            },
            function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(eventMonitorObject.elementOneMouseupRaised);
                ok(eventMonitorObject.elementOneClickRaised);
                ok(!eventMonitorObject.elementOneDblClickRaised);
                equal(eventMonitorObject.elementOneMousedownCount, 2);
                equal(eventMonitorObject.elementOneMouseupCount, 1);
                equal(eventMonitorObject.elementOneClickCount, 1);

                ok(!eventMonitorObject.elementTwoMousedownRaised);
                ok(eventMonitorObject.elementTwoMouseupRaised);
                ok(!eventMonitorObject.elementTwoClickRaised);
                ok(!eventMonitorObject.elementTwoDblClickRaised);
                equal(eventMonitorObject.elementTwoMouseupCount, 1);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('dblclick - change element on second "mouseup" event', function () {
        var $div1              = null,
            $div2              = null,

            eventMonitorObject = createMouseMonitorEventObject();

        runAsyncTest(
            function () {
                $div1 = addDiv(100, 100).css('background-color', 'red');
                $div2 = addDiv(100, 300).css('background-color', 'green');

                bindMouseHandlersToSwappingElements($div1, $div2, 'mouseup', eventMonitorObject, false, true);

                actionsAPI.dblclick($div1[0]);
            },
            function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(eventMonitorObject.elementOneMouseupRaised);
                ok(eventMonitorObject.elementOneClickRaised);
                ok(eventMonitorObject.elementOneDblClickRaised);
                equal(eventMonitorObject.elementOneMousedownCount, 2);
                equal(eventMonitorObject.elementOneMouseupCount, 2);
                equal(eventMonitorObject.elementOneClickCount, 2);

                ok(!eventMonitorObject.elementTwoMousedownRaised);
                ok(!eventMonitorObject.elementTwoMouseupRaised);
                ok(!eventMonitorObject.elementTwoClickRaised);
                ok(!eventMonitorObject.elementTwoDblClickRaised);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('dblclick - change element on second "click" event', function () {
        var $div1              = null,
            $div2              = null,

            eventMonitorObject = createMouseMonitorEventObject();

        runAsyncTest(
            function () {
                $div1 = addDiv(100, 100).css('background-color', 'red');
                $div2 = addDiv(100, 300).css('background-color', 'green');

                bindMouseHandlersToSwappingElements($div1, $div2, 'click', eventMonitorObject, false, true);

                actionsAPI.dblclick($div1[0]);
            },
            function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(eventMonitorObject.elementOneMouseupRaised);
                ok(eventMonitorObject.elementOneClickRaised);
                ok(eventMonitorObject.elementOneDblClickRaised);
                equal(eventMonitorObject.elementOneMousedownCount, 2);
                equal(eventMonitorObject.elementOneMouseupCount, 2);
                equal(eventMonitorObject.elementOneClickCount, 2);

                ok(!eventMonitorObject.elementTwoMousedownRaised);
                ok(!eventMonitorObject.elementTwoMouseupRaised);
                ok(!eventMonitorObject.elementTwoClickRaised);
                ok(!eventMonitorObject.elementTwoDblClickRaised);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('dblclick - change element on "dblclick" event', function () {
        var $div1              = null,
            $div2              = null,

            eventMonitorObject = createMouseMonitorEventObject();

        runAsyncTest(
            function () {
                $div1 = addDiv(100, 100).css('background-color', 'red');
                $div2 = addDiv(100, 300).css('background-color', 'green');

                bindMouseHandlersToSwappingElements($div1, $div2, 'dblclick', eventMonitorObject);

                actionsAPI.dblclick($div1[0]);
            },
            function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(eventMonitorObject.elementOneMouseupRaised);
                ok(eventMonitorObject.elementOneClickRaised);
                ok(eventMonitorObject.elementOneDblClickRaised);
                equal(eventMonitorObject.elementOneMousedownCount, 2);
                equal(eventMonitorObject.elementOneMouseupCount, 2);
                equal(eventMonitorObject.elementOneClickCount, 2);

                ok(!eventMonitorObject.elementTwoMousedownRaised);
                ok(!eventMonitorObject.elementTwoMouseupRaised);
                ok(!eventMonitorObject.elementTwoClickRaised);
                ok(!eventMonitorObject.elementTwoDblClickRaised);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });


    asyncTest('type - change element on "keydown" event', function () {
        var $input1            = null,
            $input2            = null,

            eventMonitorObject = createKeyMonitorEventObject();

        runAsyncTest(
            function () {
                $input1 = addInputElement(200, 200, '');
                $input2 = addInputElement(400, 400, '');

                bindKeyHandlersToSwappingElements($input1, $input2, 'keydown', eventMonitorObject);

                actionsAPI.type($input1[0], 'a');
            },
            function () {
                ok(eventMonitorObject.elementsOneKeydownRaised);
                ok(!eventMonitorObject.elementsOneKeypressRaised);
                ok(!eventMonitorObject.elementsOneKeyupRaised);

                ok(!eventMonitorObject.elementsTwoKeydownRaised);
                ok(eventMonitorObject.elementsTwoKeypressRaised);
                ok(eventMonitorObject.elementsTwoKeyupRaised);

                equal($input1[0].value, '');
                equal($input2[0].value, 'a');
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('type - change element on "keypress" event', function () {
        var $input1            = null,
            $input2            = null,

            eventMonitorObject = createKeyMonitorEventObject();

        runAsyncTest(
            function () {
                $input1 = addInputElement(200, 200, '');
                $input2 = addInputElement(400, 400, '');

                bindKeyHandlersToSwappingElements($input1, $input2, 'keypress', eventMonitorObject);

                actionsAPI.type($input1[0], 'a');
            },
            function () {
                ok(eventMonitorObject.elementsOneKeydownRaised);
                ok(eventMonitorObject.elementsOneKeypressRaised);
                ok(!eventMonitorObject.elementsOneKeyupRaised);

                ok(!eventMonitorObject.elementsTwoKeydownRaised);
                ok(!eventMonitorObject.elementsTwoKeypressRaised);
                ok(eventMonitorObject.elementsTwoKeyupRaised);

                equal($input1[0].value, 'a');
                equal($input2[0].value, '');
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('type - change element on "keyup" event', function () {
        var $input1            = null,
            $input2            = null,

            eventMonitorObject = createKeyMonitorEventObject();

        runAsyncTest(
            function () {
                $input1 = addInputElement(200, 200, '');
                $input2 = addInputElement(400, 400, '');

                bindKeyHandlersToSwappingElements($input1, $input2, 'keyup', eventMonitorObject);

                actionsAPI.type($input1[0], 'a');
            },
            function () {
                ok(eventMonitorObject.elementsOneKeydownRaised);
                ok(eventMonitorObject.elementsOneKeypressRaised);
                ok(eventMonitorObject.elementsOneKeyupRaised);

                ok(!eventMonitorObject.elementsTwoKeydownRaised);
                ok(!eventMonitorObject.elementsTwoKeypressRaised);
                ok(!eventMonitorObject.elementsTwoKeyupRaised);

                equal($input1[0].value, 'a');
                equal($input2[0].value, '');
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('T210448: Unnecessary typing occurs if element was changed after keypress event', function () {
        var iFrameSrc    = window.QUnitGlobals.getResourceUrl('../../data/runner/iframe.html'),
            $inputIFrame = $('<input />');

        var testActions = function () {
            runAsyncTest(
                function () {
                    window.setTimeout(function () {
                        $(document).bind('keypress', function () {
                            $inputIFrame.focus();
                        });

                        actionsAPI.press('f');
                    }, 500);
                },
                function () {
                    equal($inputIFrame[0].value, browserUtils.isWebKit ||
                                                 browserUtils.isMozilla ? '' : 'f', 'iframe\'s input value is correct');
                },
                2000
            );
        };

        createIFrame($inputIFrame, iFrameSrc, testActions);
    });
});
