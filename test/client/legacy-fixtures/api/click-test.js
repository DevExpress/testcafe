var hammerhead       = window.getTestCafeModule('hammerhead');
var browserUtils     = hammerhead.utils.browser;
var featureDetection = hammerhead.utils.featureDetection;

var testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
var ERROR_TYPE           = testCafeLegacyRunner.get('../test-run-error/type');
var SETTINGS             = testCafeLegacyRunner.get('./settings').get();
var actionsAPI           = testCafeLegacyRunner.get('./api/actions');
var StepIterator         = testCafeLegacyRunner.get('./step-iterator');
var initAutomation       = testCafeLegacyRunner.get('./init-automation');

initAutomation();

var stepIterator = new StepIterator();

actionsAPI.init(stepIterator);

var correctTestWaitingTime = function (time) {
    if (featureDetection.isTouchDevice && browserUtils.isFirefox)
        return time * 2;

    return time;
};

var ELEMENT_WAITING_TIMEOUT       = 400;
var ERROR_WAITING_TIMEOUT         = ELEMENT_WAITING_TIMEOUT + 100;
var TEST_COMPLETE_WAITING_TIMEOUT = 2000;

actionsAPI.setElementAvailabilityWaitingTimeout(ELEMENT_WAITING_TIMEOUT);

$(document).ready(function () {
    var actionTargetWaitingCounter = 0;
    var actionRunCounter           = 0;

    var $el                      = null;
    var currentErrorType         = null;
    var currentErrorElement      = null;
    var currentActionSourceIndex = null;
    //constants
    var TEST_ELEMENT_CLASS       = 'testElement';

    //utils
    var asyncActionCallback;

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

    var createOption = function (parent, text) {
        return $('<option></option>').text(text)
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo(parent);
    };

    var startNext = function () {
        if (browserUtils.isIE) {
            removeTestElements();
            window.setTimeout(start, 30);
        }
        else
            start();
    };

    var runAsyncTest = function (actions, assertions, timeout) {
        var timeoutId        = null;
        var callbackFunction = function () {
            clearTimeout(timeoutId);
            assertions();
            startNext();
        };

        asyncActionCallback = function () {
            callbackFunction();
        };
        actions();
        timeoutId = setTimeout(function () {
            callbackFunction = function () {
            };
            ok(false, 'Timeout is exceeded');
            startNext();
        }, timeout);
    };

    var removeTestElements = function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
    };

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

    stepIterator.on(StepIterator.ERROR_EVENT, function (err) {
        stepIterator.state.stoppedOnFail = false;
        currentErrorType                 = err.type;
        currentActionSourceIndex         = err.__sourceIndex;

        if (err.element)
            currentErrorElement = err.element;
    });

    $('<div></div>').css({ width: 1, height: 1500, position: 'absolute' }).appendTo('body');
    $('body').css('height', '1500px');

    //tests
    QUnit.testStart(function () {
        $el                 = addInputElement('button', 'button1', Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100));
        asyncActionCallback = function () {
        };

        actionTargetWaitingCounter = 0;
        actionRunCounter           = 0;
    });

    QUnit.testDone(function () {
        if (!browserUtils.isIE)
            removeTestElements();

        SETTINGS.ENABLE_SOURCE_INDEX = false;
        currentErrorType             = null;
        currentErrorElement          = null;
        currentActionSourceIndex     = null;
    });

    module('different arguments tests');

    asyncTest('dom element as a parameter', function () {
        var clicked = false;

        runAsyncTest(
            function () {
                $el.click(function () {
                    clicked = true;
                });
                actionsAPI.click($el[0]);
            },
            function () {
                ok(clicked, 'click raised');
                equal(actionTargetWaitingCounter, 1);
                equal(actionRunCounter, 1);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('jQuery object as a parameter', function () {
        var clicked = false;

        runAsyncTest(
            function () {
                $el.click(function () {
                    clicked = true;
                });
                actionsAPI.click($el);
            },
            function () {
                ok(clicked, 'click raised');
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('jQuery object with two elements as a parameter', function () {
        var clicksCount = 0;

        runAsyncTest(
            function () {
                addInputElement('button', 'button2', 150, 150);
                var $elements = $('.button')
                    .click(function () {
                        clicksCount++;
                    });

                actionsAPI.click($elements);
            },
            function () {
                equal(clicksCount, 2, 'both elements click events were raised');
                equal(actionTargetWaitingCounter, 1);
                equal(actionRunCounter, 1);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('dom elements array as a parameter', function () {
        var firstElementClickRaised  = false;
        var secondElementClickRaised = false;

        runAsyncTest(
            function () {
                $el.css({
                    marginLeft: '120px',
                    marginTop:  '120px'
                });
                var $el2 = addInputElement('button', 'button2', 150, 150);

                $el.click(function () {
                    firstElementClickRaised = true;
                });
                $el2.click(function () {
                    secondElementClickRaised = true;
                });
                actionsAPI.click([$el[0], $el2[0]]);
            },
            function () {
                ok(firstElementClickRaised && secondElementClickRaised, 'both elements click events were raised');
                equal(actionTargetWaitingCounter, 1);
                equal(actionRunCounter, 1);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('jQuery objects array as a parameter', function () {
        var clicksCount = 0;

        runAsyncTest(
            function () {
                $el.css({
                    marginLeft: '130px',
                    marginTop:  '130px'
                });
                addInputElement('button', 'button2', 150, 150);
                var $el3 = addInputElement('input', 'input1', 170, 170);

                $('.' + TEST_ELEMENT_CLASS)
                    .click(function () {
                        clicksCount++;
                    });
                actionsAPI.click([$('.button'), $el3]);
            },
            function () {
                equal(clicksCount++, 3, 'three elements click events were raised');
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('some elements created after click on the first one', function () {
        var secondElementClicked = false;
        var thirdElementClicked  = false;
        var newTestClass         = 'newTestClass';

        $el.click(function () {
            addInputElement('button', 'button2', 150, 150)
                .addClass(newTestClass)
                .click(function () {
                    secondElementClicked = true;
                });

            addInputElement('button', 'button3', 200, 200)
                .addClass(newTestClass)
                .bind('click', function () {
                    thirdElementClicked = true;
                });
        });

        runAsyncTest(
            function () {
                actionsAPI.click(['.' + TEST_ELEMENT_CLASS, '.' + newTestClass]);
            },
            function () {
                ok(secondElementClicked, 'second element clicked');
                ok(thirdElementClicked, 'third element clicked');
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT * 2)
        );
    });

    asyncTest('function as a first argument', function () {
        var secondElementClicked = false;
        var thirdElementClicked  = false;
        var newTestClass         = 'newTestClass';

        $el.click(function () {
            addInputElement('button', 'button2', 150, 150).addClass(newTestClass).click(function () {
                secondElementClicked = true;
            });
            addInputElement('button', 'button3', 200, 200).addClass(newTestClass).click(function () {
                thirdElementClicked = true;
            });
        });
        runAsyncTest(
            function () {
                var getArguments = function () {
                    return ['.' + TEST_ELEMENT_CLASS, '.' + newTestClass];
                };

                actionsAPI.click(getArguments);
            },
            function () {
                ok(secondElementClicked, 'second element clicked');
                ok(thirdElementClicked, 'third element clicked');
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('click with positive offsets', function () {
        var eventPoint = null;

        $el.css({
            width:  '100px',
            height: '100px',
            border: '0px'
        });

        runAsyncTest(
            function () {
                $el.click(function (e) {
                    eventPoint = { x: e.pageX, y: e.pageY };
                });

                actionsAPI.click($el[0], { offsetX: 10, offsetY: 10 });
            },
            function () {
                var el            = $el[0];
                var expectedPoint = { x: el.offsetLeft + 10, y: el.offsetTop + 10 };

                deepEqual(eventPoint, expectedPoint, 'event point is correct');
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('click with negative offsets', function () {
        var eventPoint = null;

        $el.css({
            width:  '100px',
            height: '100px',
            border: '0px'
        });

        runAsyncTest(
            function () {
                $el.click(function (e) {
                    eventPoint = { x: e.pageX, y: e.pageY };
                });

                actionsAPI.click($el[0], { offsetX: -20, offsetY: -20 });
            },
            function () {
                var el            = $el[0];
                var expectedPoint = {
                    x: el.offsetLeft + el.offsetWidth - 20,
                    y: el.offsetTop + el.offsetHeight - 20
                };

                deepEqual(eventPoint, expectedPoint, 'event point is correct');
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    module('wrong arguments');

    asyncTest('expected element are not created after first click error', function () {
        SETTINGS.ENABLE_SOURCE_INDEX = true;

        asyncActionCallback = function () {
        };

        var clicked = false;

        $el.click(function () {
            clicked = true;
        });

        actionsAPI.click([$el, '#nonExistentElementId'], '#271');

        setTimeout(function () {
            ok(clicked, 'click raised');
            equal(currentErrorType, ERROR_TYPE.emptyFirstArgument, 'error type correct');
            equal(currentActionSourceIndex, 271, 'source index correct');

            startNext();
        }, correctTestWaitingTime(ERROR_WAITING_TIMEOUT * 2));
    });

    asyncTest('empty first argument raises error', function () {
        SETTINGS.ENABLE_SOURCE_INDEX = true;

        actionsAPI.click($('#nonExistentElement'), '#24');

        setTimeout(function () {
            equal(currentErrorType, ERROR_TYPE.emptyFirstArgument);
            equal(currentActionSourceIndex, 24);
            startNext();
        }, ERROR_WAITING_TIMEOUT);
    });

    asyncTest('invisible first argument raises error', function () {
        SETTINGS.ENABLE_SOURCE_INDEX = true;
        $el.css('visibility', 'hidden');

        actionsAPI.click($el, '#32');

        setTimeout(function () {
            $el.css('visibility', '');
            equal(currentErrorType, ERROR_TYPE.invisibleActionElement);
            equal(currentErrorElement, '<input id="button1" class="button testElement">');
            equal(currentActionSourceIndex, 32);

            startNext();
        }, correctTestWaitingTime(ERROR_WAITING_TIMEOUT));
    });


    module('regression');

    asyncTest('testcafe functions should not be in strict mode (GH-258)', function () {
        var exceptionRaised = false;

        runAsyncTest(
            function () {
                $el.click(function () {
                    try {
                        /*eslint-disable no-caller*/

                        var caller = arguments.callee.caller;

                        /*eslint-enable no-caller*/

                        while (caller && caller.arguments && caller.arguments.callee)
                            caller = caller.arguments.callee.caller;
                    }
                    catch (e) {
                        exceptionRaised = true;
                    }
                });

                actionsAPI.click($el);
            },
            function () {
                ok(!exceptionRaised, 'should not throw an exception');
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });

    asyncTest('click on an option element', function () {
        var select = $('<select></select>')
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo('body')[0];

        createOption(select, 'opt1');

        var option = createOption(select, 'opt2');

        runAsyncTest(
            function () {
                actionsAPI.click([select, option]);
            },
            function () {
                equal(select.selectedIndex, 1);
            },
            correctTestWaitingTime(TEST_COMPLETE_WAITING_TIMEOUT)
        );
    });
});
