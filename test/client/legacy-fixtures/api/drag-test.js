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

$(document).ready(function () {
    // NOTE: remove this after fix IE tests in iFrame
    $('body').css('border', '0px');

    // NOTE: prevent auto scrolling
    if (browserUtils.isSafari && featureDetection.isTouchDevice) {
        var $meta = $('<meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, shrink-to-fit=no">');

        $('head').append($meta);
    }

    var actionTargetWaitingCounter = 0;
    var actionRunCounter           = 0;

    var currentErrorType   = null;
    var currentSourceIndex = null;
    //constants
    var TEST_ELEMENT_CLASS = 'testElement';

    //utils
    var asyncActionCallback;
    var isTouchDevice = featureDetection.isTouchDevice;

    var createDraggable = function (left, top) {
        var $draggable = $('<div></div>')
            .css({
                width:           '100px',
                height:          '100px',
                position:        'absolute',
                backgroundColor: 'grey',
                left:            left + 'px',
                top:             top + 'px',
                zIndex:          5
            })
            .bind(isTouchDevice ? 'touchstart' : 'mousedown', function () {
                $(this).data('dragStarted', true);
            })
            .bind(isTouchDevice ? 'touchend' : 'mouseup', function () {
                $(this).data('dragStarted', false);
            })
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo('body');

        $(document).bind(isTouchDevice ? 'touchmove' : 'mousemove', function (e) {
            var curMousePos = isTouchDevice ? {
                x: e.originalEvent.targetTouches[0].pageX || e.originalEvent.touches[0].pageX,
                y: e.originalEvent.targetTouches[0].pageY || e.originalEvent.touches[0].pageY
            } : {
                x: e.clientX,
                y: e.clientY
            };

            $.each($draggable, function () {
                if ($(this).data('dragStarted')) {
                    $(this).css({
                        left: curMousePos.x - 50 + $(window).scrollLeft() + 'px',
                        top:  curMousePos.y - 50 + $(window).scrollTop() + 'px'
                    });
                }
            });
        });

        return $draggable;
    };

    var createTarget = function (left, top) {
        return $('<div></div>')
            .css({
                width:           '120px',
                height:          '120px',
                position:        'absolute',
                backgroundColor: 'red',
                left:            left + 'px',
                top:             top + 'px'
            })
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo('body');
    };

    var getCenter = function (element) {
        return {
            x: Math.floor(element.offsetLeft + element.offsetWidth / 2),
            y: Math.floor(element.offsetTop + element.offsetHeight / 2)
        };
    };

    var isInTarget = function (element, target) {
        var elementCenter = getCenter(element);
        var targetCenter  = getCenter(target);

        return elementCenter.x === targetCenter.x && elementCenter.y === targetCenter.y;
    };

    var runAsyncTest = function (actions, assertions, timeout) {
        var timeoutId        = null;
        var callbackFunction = function () {
            clearTimeout(timeoutId);
            assertions();
            start();
        };

        asyncActionCallback = function () {
            callbackFunction();
        };
        actions();
        timeoutId = window.setTimeout(function () {
            callbackFunction = function () {
            };
            ok(false, 'Timeout is exceeded');
            start();
        }, timeout);
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
        currentSourceIndex               = err.__sourceIndex;
    });

    //tests
    QUnit.testStart(function () {
        actionTargetWaitingCounter = 0;
        actionRunCounter           = 0;
    });

    QUnit.testDone(function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
        $('body').height('').width('');
        currentErrorType             = null;
        asyncActionCallback          = null;
        currentSourceIndex           = null;
        SETTINGS.ENABLE_SOURCE_INDEX = false;
    });

    module('first argument tests');

    asyncTest('domElement as first argument', function () {
        var $draggable = createDraggable(0, 0);
        var $target    = createTarget(100, 100);

        runAsyncTest(
            function () {
                actionsAPI.drag($draggable[0], $target[0]);
            },
            function () {
                ok(isInTarget($draggable[0], $target[0]), 'element is in the target');
                equal(actionTargetWaitingCounter, 1);
                equal(actionRunCounter, 1);
            },
            correctTestWaitingTime(3000)
        );
    });

    asyncTest('dragging with startOffset', function () {
        var $draggable = createDraggable(0, 0);
        var $target    = createTarget(100, 100);

        runAsyncTest(
            function () {
                actionsAPI.drag($draggable[0], $target[0], { offsetX: 40, offsetY: 40 });
            },
            function () {
                ok(isInTarget($draggable[0], $target[0]), 'element is in the target');
            },
            correctTestWaitingTime(3000)
        );
    });

    asyncTest('domElements array as first argument', function () {
        var $draggable  = createDraggable(0, 0).attr('id', 'first');
        var $draggable2 = createDraggable(100, 300).attr('id', 'second');
        var $target     = createTarget(170, 170);

        runAsyncTest(
            function () {
                actionsAPI.drag([$draggable[0], $draggable2[0]], $target[0]);
            },
            function () {
                ok(isInTarget($draggable[0], $target[0]), 'first element is in the target');
                ok(isInTarget($draggable2[0], $target[0]), 'second element is in the target');
                equal(actionTargetWaitingCounter, 1);
                equal(actionRunCounter, 1);
            },
            correctTestWaitingTime(5000)
        );
    });

    asyncTest('jQuery object as first argument', function () {
        var $draggable = createDraggable(0, 0);
        var $target    = createTarget(100, 100);

        runAsyncTest(
            function () {
                actionsAPI.drag($draggable, $target[0]);
            },
            function () {
                ok(isInTarget($draggable[0], $target[0]), 'element is in the target');
            },
            correctTestWaitingTime(4000)
        );
    });

    asyncTest('jQuery object with two elements as first argument', function () {
        var draggableClassName = 'draggable';
        var $target            = createTarget(170, 170);

        createDraggable(0, 0).addClass(draggableClassName);
        createDraggable(100, 300).addClass(draggableClassName);

        var $draggableElements = $('.' + draggableClassName);

        runAsyncTest(
            function () {
                actionsAPI.drag($draggableElements, $target[0]);
            },
            function () {
                ok(isInTarget($draggableElements[0], $target[0]), 'first element is in the target');
                ok(isInTarget($draggableElements[1], $target[0]), 'second element is in the target');
            },
            correctTestWaitingTime(5000)
        );
    });

    module('second argument test');
    asyncTest('jQuery object with one element as a second argument', function () {
        var className = 'draggable';
        var $target   = createTarget(170, 170);

        createDraggable(0, 0).addClass(className);
        createDraggable(100, 300).addClass(className);

        var $draggableElements = $('.' + className);

        runAsyncTest(
            function () {
                actionsAPI.drag($draggableElements, $target);
            },
            function () {
                ok(isInTarget($draggableElements[0], $target[0]), 'first element is in the target');
                ok(isInTarget($draggableElements[1], $target[0]), 'second element is in the target');
            },
            correctTestWaitingTime(4000)
        );
    });

    asyncTest('jQuery object with several elements as a second argument (drop to first)', function () {
        var targetClassName = 'target';
        var $draggable      = createDraggable(0, 0);
        var $firstTarget    = createTarget(100, 100).addClass(targetClassName);

        createTarget(150, 150).addClass(targetClassName);

        runAsyncTest(
            function () {
                actionsAPI.drag($draggable[0], $('.' + targetClassName));
            },
            function () {
                ok(isInTarget($draggable[0], $firstTarget[0]), 'element is in the target');
            },
            correctTestWaitingTime(5000)
        );
    });

    asyncTest('x and y coordinates as second and third arguments', function () {
        var $draggable  = createDraggable(10, 10);
        var center      = getCenter($draggable[0]);
        var dragOffsetX = 100;
        var dragOffsetY = 100;
        var pointTo     = { x: center.x + dragOffsetX, y: center.y + dragOffsetY };

        runAsyncTest(
            function () {
                actionsAPI.drag($draggable[0], dragOffsetX, dragOffsetY);
            },
            function () {
                var elementCenter = getCenter($draggable[0]);

                equal(elementCenter.x, pointTo.x, 'element has correct x coordinate');
                equal(elementCenter.y, pointTo.y, 'element has correct y coordinate');
            },
            correctTestWaitingTime(5000)
        );
    });

    asyncTest('drag with offset when the second and third arguments are coordinates', function () {
        var $draggable      = createDraggable(10, 10);
        var draggableOffset = $draggable.offset();
        var dragOffsetX     = 100;
        var dragOffsetY     = 100;
        var offsetX         = 40;
        var offsetY         = 40;
        var pointTo         = {
            x: draggableOffset.left + offsetX + dragOffsetX,
            y: draggableOffset.top + offsetY + dragOffsetY
        };

        runAsyncTest(
            function () {
                actionsAPI.drag($draggable[0], dragOffsetX, dragOffsetY, { offsetX: offsetX, offsetY: offsetY });
            },
            function () {
                var elementCenter = getCenter($draggable[0]);

                equal(elementCenter.x, pointTo.x, 'element has correct x coordinate');
                equal(elementCenter.y, pointTo.y, 'element has correct y coordinate');
            },
            correctTestWaitingTime(5000)
        );
    });

    asyncTest('non-numeric x or y argument raises an error', function () {
        var $draggable = createDraggable(0, 0);

        SETTINGS.ENABLE_SOURCE_INDEX = true;
        asyncActionCallback          = function () {
        };
        actionsAPI.drag($draggable, 'abc', '@#%^^', '#211');
        window.setTimeout(function () {
            equal(currentErrorType, ERROR_TYPE.incorrectDraggingSecondArgument, 'correct error type sended');
            equal(currentSourceIndex, 211);
            start();
        }, correctTestWaitingTime(500));
    });

    asyncTest('drag with offset when the second and third arguments are fractional coordinates', function () {
        var $draggable      = createDraggable(10, 10);
        var draggableOffset = $draggable.offset();
        var dragOffsetX     = 99.8;
        var dragOffsetY     = 100.3;
        var offsetX         = 40;
        var offsetY         = 40;
        var pointTo         = {
            x: draggableOffset.left + offsetX + Math.round(dragOffsetX),
            y: draggableOffset.top + offsetY + Math.round(dragOffsetY)
        };

        runAsyncTest(
            function () {
                actionsAPI.drag($draggable[0], dragOffsetX, dragOffsetY, { offsetX: offsetX, offsetY: offsetY });
            },
            function () {
                var elementCenter = getCenter($draggable[0]);

                equal(elementCenter.x, pointTo.x, 'element has correct x coordinate');
                equal(elementCenter.y, pointTo.y, 'element has correct y coordinate');
            },
            correctTestWaitingTime(5000)
        );
    });

    asyncTest('drag_ function calling with empty second argument raises error', function () {
        var $draggable = createDraggable(0, 0);

        SETTINGS.ENABLE_SOURCE_INDEX = true;
        asyncActionCallback          = function () {
        };
        actionsAPI.drag($draggable, null, '#803');
        window.setTimeout(function () {
            equal(currentErrorType, ERROR_TYPE.incorrectDraggingSecondArgument, 'correct error type sended');
            equal(currentSourceIndex, 803);
            start();
        }, correctTestWaitingTime(500));
    });

    module('Regression');

    asyncTest('B236553 - The act.drag() function hangs the test when offsetX/offsetY parameters are passed', function () {
        var $draggable = createDraggable(0, 0);
        var $target    = createTarget(50, 50);

        runAsyncTest(
            function () {
                actionsAPI.drag($draggable[0], $target[0], { offsetX: 10.2, offsetY: 10.6 });
            },
            function () {
                ok(isInTarget($draggable[0], $target[0]), 'element is in the target');
            },
            correctTestWaitingTime(2000)
        );
    });
});
