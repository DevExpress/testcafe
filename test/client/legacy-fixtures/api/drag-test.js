const hammerhead       = window.getTestCafeModule('hammerhead');
const browserUtils     = hammerhead.utils.browser;
const featureDetection = hammerhead.utils.featureDetection;

const testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
const ERROR_TYPE           = testCafeLegacyRunner.get('../test-run-error/type');
const SETTINGS             = testCafeLegacyRunner.get('./settings').get();
const actionsAPI           = testCafeLegacyRunner.get('./api/actions');
const StepIterator         = testCafeLegacyRunner.get('./step-iterator');
const initAutomation       = testCafeLegacyRunner.get('./init-automation');

initAutomation();

const stepIterator = new StepIterator();

actionsAPI.init(stepIterator);

const correctTestWaitingTime = function (time) {
    if (featureDetection.isTouchDevice && browserUtils.isFirefox)
        return time * 2;

    return time;
};

$(document).ready(function () {
    // NOTE: remove this after fix IE tests in iFrame
    $('body').css('border', '0px');

    // NOTE: prevent auto scrolling
    if (browserUtils.isSafari && featureDetection.isTouchDevice) {
        const $meta = $('<meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, shrink-to-fit=no">');

        $('head').append($meta);
    }

    let actionTargetWaitingCounter = 0;
    let actionRunCounter           = 0;

    let currentErrorType   = null;
    let currentSourceIndex = null;

    //constants
    const TEST_ELEMENT_CLASS = 'testElement';

    //utils
    let asyncActionCallback;

    const isTouchDevice = featureDetection.isTouchDevice;

    const createDraggable = function (left, top) {
        const $draggable = $('<div></div>')
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
            const curMousePos = isTouchDevice ? {
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

    const createTarget = function (left, top) {
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

    const getCenter = function (element) {
        return {
            x: Math.floor(element.offsetLeft + element.offsetWidth / 2),
            y: Math.floor(element.offsetTop + element.offsetHeight / 2)
        };
    };

    const isInTarget = function (element, target) {
        const elementCenter = getCenter(element);
        const targetCenter  = getCenter(target);

        return elementCenter.x === targetCenter.x && elementCenter.y === targetCenter.y;
    };

    const runAsyncTest = function (actions, assertions, timeout) {
        let timeoutId        = null;
        let callbackFunction = function () {
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
        const seriesActionsRun = function (elements, callback) {
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
        const $draggable = createDraggable(0, 0);
        const $target    = createTarget(100, 100);

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
        const $draggable = createDraggable(0, 0);
        const $target    = createTarget(100, 100);

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
        const $draggable  = createDraggable(0, 0).attr('id', 'first');
        const $draggable2 = createDraggable(100, 300).attr('id', 'second');
        const $target     = createTarget(170, 170);

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
        const $draggable = createDraggable(0, 0);
        const $target    = createTarget(100, 100);

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
        const draggableClassName = 'draggable';
        const $target            = createTarget(170, 170);

        createDraggable(0, 0).addClass(draggableClassName);
        createDraggable(100, 300).addClass(draggableClassName);

        const $draggableElements = $('.' + draggableClassName);

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
        const className = 'draggable';
        const $target   = createTarget(170, 170);

        createDraggable(0, 0).addClass(className);
        createDraggable(100, 300).addClass(className);

        const $draggableElements = $('.' + className);

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
        const targetClassName = 'target';
        const $draggable      = createDraggable(0, 0);
        const $firstTarget    = createTarget(100, 100).addClass(targetClassName);

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
        const $draggable  = createDraggable(10, 10);
        const center      = getCenter($draggable[0]);
        const dragOffsetX = 100;
        const dragOffsetY = 100;
        const pointTo     = { x: center.x + dragOffsetX, y: center.y + dragOffsetY };

        runAsyncTest(
            function () {
                actionsAPI.drag($draggable[0], dragOffsetX, dragOffsetY);
            },
            function () {
                const elementCenter = getCenter($draggable[0]);

                equal(elementCenter.x, pointTo.x, 'element has correct x coordinate');
                equal(elementCenter.y, pointTo.y, 'element has correct y coordinate');
            },
            correctTestWaitingTime(5000)
        );
    });

    asyncTest('drag with offset when the second and third arguments are coordinates', function () {
        const $draggable      = createDraggable(10, 10);
        const draggableOffset = $draggable.offset();
        const dragOffsetX     = 100;
        const dragOffsetY     = 100;
        const offsetX         = 40;
        const offsetY         = 40;
        const pointTo         = {
            x: draggableOffset.left + offsetX + dragOffsetX,
            y: draggableOffset.top + offsetY + dragOffsetY
        };

        runAsyncTest(
            function () {
                actionsAPI.drag($draggable[0], dragOffsetX, dragOffsetY, { offsetX: offsetX, offsetY: offsetY });
            },
            function () {
                const elementCenter = getCenter($draggable[0]);

                equal(elementCenter.x, pointTo.x, 'element has correct x coordinate');
                equal(elementCenter.y, pointTo.y, 'element has correct y coordinate');
            },
            correctTestWaitingTime(5000)
        );
    });

    asyncTest('non-numeric x or y argument raises an error', function () {
        const $draggable = createDraggable(0, 0);

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
        const $draggable      = createDraggable(10, 10);
        const draggableOffset = $draggable.offset();
        const dragOffsetX     = 99.8;
        const dragOffsetY     = 100.3;
        const offsetX         = 40;
        const offsetY         = 40;
        const pointTo         = {
            x: draggableOffset.left + offsetX + Math.round(dragOffsetX),
            y: draggableOffset.top + offsetY + Math.round(dragOffsetY)
        };

        runAsyncTest(
            function () {
                actionsAPI.drag($draggable[0], dragOffsetX, dragOffsetY, { offsetX: offsetX, offsetY: offsetY });
            },
            function () {
                const elementCenter = getCenter($draggable[0]);

                equal(elementCenter.x, pointTo.x, 'element has correct x coordinate');
                equal(elementCenter.y, pointTo.y, 'element has correct y coordinate');
            },
            correctTestWaitingTime(5000)
        );
    });

    asyncTest('drag_ function calling with empty second argument raises error', function () {
        const $draggable = createDraggable(0, 0);

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
        const $draggable = createDraggable(0, 0);
        const $target    = createTarget(50, 50);

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
