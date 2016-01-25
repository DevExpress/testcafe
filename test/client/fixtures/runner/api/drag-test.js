var hammerhead   = window.getTestCafeModule('hammerhead');
var browserUtils = hammerhead.utils.browser;

var testCafeCore = window.getTestCafeModule('testCafeCore');
var SETTINGS     = testCafeCore.get('./settings').get();
var ERROR_TYPE   = testCafeCore.ERROR_TYPE;
var position     = testCafeCore.get('./utils/position');

var testCafeRunner = window.getTestCafeModule('testCafeRunner');
var actionsAPI     = testCafeRunner.get('./api/actions');
var automation     = testCafeRunner.get('./automation/automation');
var StepIterator   = testCafeRunner.get('./step-iterator');

automation.init();

var stepIterator = new StepIterator();
actionsAPI.init(stepIterator);

var correctTestWaitingTime = function (time) {
    if (browserUtils.isTouchDevice && browserUtils.isFirefox)
        return time * 2;

    return time;
};

$(document).ready(function () {
    // NOTE: remove this after fix IE tests in iFrame
    $('body').css('border', '0px');

    // NOTE: prevent auto scrolling
    if (browserUtils.isSafari && browserUtils.hasTouchEvents) {
        var $meta = $('<meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, shrink-to-fit=no">');
        $('head').append($meta);
    }

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

    stepIterator.on(StepIterator.ERROR_EVENT, function (err) {
        stepIterator.state.stoppedOnFail = false;
        currentErrorType                 = err.type;
        currentSourceIndex               = err.__sourceIndex;
    });

    var currentErrorType   = null,
        currentSourceIndex = null,
        //constants
        TEST_ELEMENT_CLASS = 'testElement',

        //utils
        asyncActionCallback,
        hasTouchEvents     = browserUtils.hasTouchEvents,
        getValueFromPx     = function (px) {
            return parseInt(px.replace('px', ''));
        },

        createDraggable    = function (left, top, withGloballCoord) {
            var startPos,
                startMousePos,
                $draggable = $('<div></div>')
                    .css({
                        width:           '100px',
                        height:          '100px',
                        position:        'absolute',
                        backgroundColor: 'grey',
                        left:            left + 'px',
                        top:             top + 'px',
                        zIndex:          5
                    }).bind(hasTouchEvents ? 'touchstart' : 'mousedown', function (e) {
                        var startMouseClientPosition = position.offsetToClientCoords({
                            x: e.pageX,
                            y: e.pageY
                        });

                        startPos      = {
                            x: getValueFromPx($draggable.css('left')),
                            y: getValueFromPx($draggable.css('top'))
                        };
                        startMousePos = hasTouchEvents ? {
                            x: e.originalEvent.targetTouches[0].pageX || e.originalEvent.touches[0].pageX,
                            y: e.originalEvent.targetTouches[0].pageY || e.originalEvent.touches[0].pageY
                        } : {
                            x: withGloballCoord ? startMouseClientPosition.x : e.clientX,
                            y: withGloballCoord ? startMouseClientPosition.y : e.clientY
                        };
                        $(this).data('dragStarted', true);
                    })
                    .bind(hasTouchEvents ? 'touchend' : 'mouseup', function (e) {
                        $(this).data('dragStarted', false);
                    })
                    .addClass(TEST_ELEMENT_CLASS)
                    .appendTo('body');
            $(document).bind(hasTouchEvents ? 'touchmove' : 'mousemove', function (e) {
                var startMouseClientPosition = position.offsetToClientCoords({
                        x: e.pageX,
                        y: e.pageY
                    }),

                    curMousePos              = hasTouchEvents ? {
                        x: e.originalEvent.targetTouches[0].pageX || e.originalEvent.touches[0].pageX,
                        y: e.originalEvent.targetTouches[0].pageY || e.originalEvent.touches[0].pageY
                    } : {
                        x: withGloballCoord ? startMouseClientPosition.x : e.clientX,
                        y: withGloballCoord ? startMouseClientPosition.y : e.clientY
                    };
                $.each($draggable, function () {
                    if ($(this).data('dragStarted')) {
                        $(this).css({
                            left: (curMousePos.x - 50 + (!withGloballCoord ? $(window).scrollLeft() : 0)) + 'px',
                            top:  (curMousePos.y - 50 + (!withGloballCoord ? $(window).scrollTop() : 0)) + 'px'
                        });
                    }
                });
            });
            return $draggable;

        },

        createTarget       = function (left, top) {
            return $('<div id="div"></div>')
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
        },

        getCenter          = function (element) {
            return {
                x: Math.floor(element.offsetLeft + element.offsetWidth / 2),
                y: Math.floor(element.offsetTop + element.offsetHeight / 2)
            }
        },

        isInTarget         = function (element, target) {
            var elementCenter = getCenter(element),
                targetCenter  = getCenter(target);
            return (elementCenter.x === targetCenter.x) && (elementCenter.y === targetCenter.y);
        },

        runAsyncTest       = function (actions, assertions, timeout) {
            var callbackFunction = function () {
                clearTimeout(timeoutId);
                assertions();
                start();
            };
            asyncActionCallback  = function () {
                callbackFunction();
            };
            actions();
            var timeoutId        = window.setTimeout(function () {
                callbackFunction = function () {
                };
                ok(false, 'Timeout is exceeded');
                start();
            }, timeout);
        };

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
        var $draggable = createDraggable(0, 0),
            $target    = createTarget(100, 100);
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
        var $draggable = createDraggable(0, 0),
            $target    = createTarget(100, 100);
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
        var $draggable  = createDraggable(0, 0).attr('id', 'first'),
            $draggable2 = createDraggable(100, 300).attr('id', 'second'),
            $target     = createTarget(170, 170);
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
        var $draggable = createDraggable(0, 0),
            $target    = createTarget(100, 100);
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
        var draggableClassName = 'draggable',
            $target            = createTarget(170, 170);
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
        var className          = 'draggable',
            $target            = createTarget(170, 170);
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
        var targetClassName = 'target',
            $draggable      = createDraggable(0, 0),
            $firstTarget    = createTarget(100, 100).addClass(targetClassName);
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
        var $draggable  = createDraggable(10, 10),
            center      = getCenter($draggable[0]),
            dragOffsetX = 100,
            dragOffsetY = 100,
            pointTo     = { x: center.x + dragOffsetX, y: center.y + dragOffsetY };

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
        var $draggable      = createDraggable(10, 10),
            draggableOffset = $draggable.offset(),
            dragOffsetX     = 100,
            dragOffsetY     = 100,
            offsetX         = 40,
            offsetY         = 40,
            pointTo         = {
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

    asyncTest('not int x or y argument raise error', function () {
        var $draggable               = createDraggable(0, 0);
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

    asyncTest('drag_ function calling with empty second argument raises error', function () {
        var $draggable               = createDraggable(0, 0);
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

    module('scrolling functional test');
    asyncTest('scroll down right', function () {
        $('body').height(1500).width(1500);

        window.setTimeout(function () {
            var draggable = createDraggable(100, 100)[0];
            var target    = createTarget(1200, 1200)[0];

            runAsyncTest(
                function () {
                    window.setTimeout(function () {
                        actionsAPI.drag(draggable, target);
                    }, 500);
                },
                function () {
                    ok(isInTarget(draggable, target), 'element is in the target');
                },
                correctTestWaitingTime(8000)
            );
        }, 500);
    });

    asyncTest('scroll up', function () {
        $('body').height(1400);

        window.setTimeout(function () {
            var draggable = createDraggable(100, 1300)[0];
            var target    = createTarget(100, 200)[0];

            runAsyncTest(
                function () {
                    window.setTimeout(function () {
                        actionsAPI.drag(draggable, target);
                    }, 500);
                },
                function () {
                    ok(isInTarget(draggable, target), 'element is in the target');
                },
                correctTestWaitingTime(8000)
            );
        }, 500);
    });

    module('other functional tests');

    asyncTest('overlapped during dragging', function () {
        var draggable = createDraggable(100, 100)[0],
            target    = createTarget(100, 500)[0];

        createTarget(100, 300).css('zIndex', '100');

        runAsyncTest(
            function () {
                actionsAPI.drag(draggable, target);
            },
            function () {
                ok(isInTarget(draggable, target), 'element is in the target');
            },
            correctTestWaitingTime(3000)
        );
    });

    module('regression');

    asyncTest('B236553 - The act.drag() function hangs the test when offsetX/offsetY parameters are passed', function () {
        var $draggable = createDraggable(0, 0),
            $target    = createTarget(50, 50);
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

    asyncTest('B253930 - Wrong playback of drag action on http://jqueryui.com/droppable/ in IE9', function () {
        var $draggable  = createDraggable(10, 10, true),
            center      = getCenter($draggable[0]),
            dragOffsetX = 100,
            dragOffsetY = 100,
            pointTo     = { x: center.x + dragOffsetX, y: center.y + dragOffsetY };

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
});
