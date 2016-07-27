var testCafeAutomation      = window.getTestCafeModule('testCafeAutomation');
var DragToOffsetAutomation  = testCafeAutomation.DragToOffset;
var DragToElementAutomation = testCafeAutomation.DragToElement;
var MouseOptions            = testCafeAutomation.get('../../test-run/commands/options').MouseOptions;

var testCafeCore      = window.getTestCafeModule('testCafeCore');
var position          = testCafeCore.get('./utils/position');
var preventRealEvents = testCafeCore.get('./prevent-real-events');

preventRealEvents();

var hammerhead   = window.getTestCafeModule('hammerhead');
var browserUtils = hammerhead.utils.browser;
var Promise      = hammerhead.Promise;

var wait = function (ms) {
    return new Promise(function (resolve) {
        window.setTimeout(resolve, ms);
    });
};

$(document).ready(function () {
    // NOTE: remove this after fix IE tests in iFrame
    $('body').css('border', '0px');

    // NOTE: prevent auto scrolling
    if (browserUtils.isSafari && browserUtils.hasTouchEvents) {
        var $meta = $('<meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, shrink-to-fit=no">');

        $('head').append($meta);
    }

    //constants
    var TEST_ELEMENT_CLASS = 'testElement';

    //utils
    var hasTouchEvents = browserUtils.hasTouchEvents;

    var createDraggable = function (left, top, withGloballCoord) {
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
            .bind(hasTouchEvents ? 'touchstart' : 'mousedown', function () {
                $(this).data('dragStarted', true);
            })
            .bind(hasTouchEvents ? 'touchend' : 'mouseup', function () {
                $(this).data('dragStarted', false);
            })
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo('body');

        $(document).bind(hasTouchEvents ? 'touchmove' : 'mousemove', function (e) {
            var startMouseClientPosition = position.offsetToClientCoords({
                x: e.pageX,
                y: e.pageY
            });

            var curMousePos = hasTouchEvents ? {
                x: e.originalEvent.targetTouches[0].pageX || e.originalEvent.touches[0].pageX,
                y: e.originalEvent.targetTouches[0].pageY || e.originalEvent.touches[0].pageY
            } : {
                x: withGloballCoord ? startMouseClientPosition.x : e.clientX,
                y: withGloballCoord ? startMouseClientPosition.y : e.clientY
            };

            $.each($draggable, function () {
                if ($(this).data('dragStarted')) {
                    $(this).css({
                        left: curMousePos.x - 50 + (!withGloballCoord ? $(window).scrollLeft() : 0) + 'px',
                        top:  curMousePos.y - 50 + (!withGloballCoord ? $(window).scrollTop() : 0) + 'px'
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

    //tests
    QUnit.testDone(function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
        $('body').height('').width('');
    });

    module('scrolling functional test');
    asyncTest('scroll down right', function () {
        $('body').height(1500).width(1500);

        window.setTimeout(function () {
            var draggable = createDraggable(100, 100)[0];
            var target    = createTarget(1200, 1200)[0];

            var drag = new DragToElementAutomation(draggable, target, new MouseOptions());

            drag
                .run()
                .then(function () {
                    ok(isInTarget(draggable, target), 'element is in the target');
                    start();
                });
        }, 500);
    });

    asyncTest('scroll up', function () {
        $('body').height(1400);

        window.setTimeout(function () {
            var draggable = createDraggable(100, 1300)[0];
            var target    = createTarget(100, 200)[0];

            var drag = new DragToElementAutomation(draggable, target, new MouseOptions());

            drag
                .run()
                .then(function () {
                    ok(isInTarget(draggable, target), 'element is in the target');
                    start();
                });
        }, 500);
    });

    module('other functional tests');

    asyncTest('overlapped during dragging', function () {
        var draggable = createDraggable(100, 100)[0];
        var target    = createTarget(100, 500)[0];

        createTarget(100, 300).css('zIndex', '100');

        var drag = new DragToElementAutomation(draggable, target, new MouseOptions({ offsetX: 5, offsetY: 5 }));

        drag
            .run()
            .then(function () {
                // NOTE: wait while dragging scripts finished
                return wait(200);
            })
            .then(function () {
                ok(isInTarget(draggable, target), 'element is in the target');
                start();
            });
    });

    module('regression');

    asyncTest('B253930 - Wrong playback of drag action on http://jqueryui.com/droppable/ in IE9', function () {
        var $draggable  = createDraggable(10, 10, true);
        var center      = getCenter($draggable[0]);
        var dragOffsetX = 100;
        var dragOffsetY = 100;
        var pointTo     = { x: center.x + dragOffsetX, y: center.y + dragOffsetY };

        var drag = new DragToOffsetAutomation($draggable[0], dragOffsetX, dragOffsetY, new MouseOptions({
            offsetX: 50,
            offsetY: 50
        }));

        drag
            .run()
            .then(function () {
                var elementCenter = getCenter($draggable[0]);

                equal(elementCenter.x, pointTo.x, 'element has correct x coordinate');
                equal(elementCenter.y, pointTo.y, 'element has correct y coordinate');

                start();
            });
    });

    if (!browserUtils.hasTouchEvents) {
        asyncTest('GH372-"mousemove" event sent to wrong element during dragging', function () {
            var $firstTarget  = createTarget(10, 10);
            var $secondTarget = createTarget(110, 110);
            var elementCenter = getCenter($firstTarget[0]);

            var mousedownRaised              = false;
            var firstElementMousemoveRaised  = false;
            var secondElementMousemoveRaised = false;
            var mouseupRaised                = false;

            $firstTarget.mousedown(function () {
                mousedownRaised = true;
            });

            $firstTarget.mousemove(function () {
                firstElementMousemoveRaised = true;
            });

            $secondTarget.mousemove(function () {
                secondElementMousemoveRaised = true;
            });

            $secondTarget.mouseup(function () {
                mouseupRaised = true;
            });

            var drag = new DragToOffsetAutomation($firstTarget[0], 100, 100, new MouseOptions({
                offsetX: 5,
                offsetY: 5
            }));

            drag
                .run()
                .then(function () {
                    deepEqual(getCenter($firstTarget[0]), elementCenter);

                    ok(mousedownRaised, 'mousedown event was raised on first element');
                    ok(firstElementMousemoveRaised, 'mousemove event was raised on first element');
                    ok(secondElementMousemoveRaised, 'mousemove event was raised on second element');
                    ok(mouseupRaised, 'mouseup event was raised on second element');

                    start();
                });
        });
    }
});
