var hammerhead   = window.getTestCafeModule('hammerhead');
var browserUtils = hammerhead.utils.browser;

var testCafeCore  = window.getTestCafeModule('testCafeCore');
var position      = testCafeCore.get('./utils/position');
var textSelection = testCafeCore.get('./utils/text-selection');

var testCafeRunner         = window.getTestCafeModule('testCafeRunner');
var automation             = testCafeRunner.get('./automation/automation');
var MouseOptions           = testCafeRunner.get('../../test-run/commands/options').MouseOptions;
var ClickOptions           = testCafeRunner.get('../../test-run/commands/options').ClickOptions;
var TypeOptions            = testCafeRunner.get('../../test-run/commands/options').TypeOptions;
var RClickAutomation       = testCafeRunner.get('./automation/playback/rclick');
var ClickAutomation        = testCafeRunner.get('./automation/playback/click');
var DblClickAutomation     = testCafeRunner.get('./automation/playback/dblclick');
var DragToOffsetAutomation = testCafeRunner.get('./automation/playback/drag/to-offset');
var TypeAutomation         = testCafeRunner.get('./automation/playback/type');

automation.init();

$(document).ready(function () {
    //consts
    var TEST_ELEMENT_CLASS = 'testElement';

    //utils
    var createTextInput = function () {
        return $('<input type="text">').attr('id', 'input').addClass(TEST_ELEMENT_CLASS).appendTo('body');
    };

    $('body').css('height', 1500);

    var createDiv = function (x, y, width, height, color) {
        return $('<div></div>')
            .addClass(TEST_ELEMENT_CLASS)
            .css({
                width:           width + 'px',
                height:          height + 'px',
                position:        'absolute',
                backgroundColor: color ? color : 'grey',
                left:            x ? x + 'px' : '100px',
                top:             y ? y + 'px' : '850px'
            })
            .appendTo($('body'));
    };

    var DRAGGABLE_BIND_FLAG      = 'tc-dbf-c56a4d91',
        CURSOR_POSITION_PROPERTY = 'tc-cpp-ac4a65d4',
        SCROLL_POSITION_PROPERTY = 'tc-spp-ac4a65d4',
        DRAGGABLE_CLASS          = 'draggable',
        DRAG_STARTED_PROPERTY    = 'dragStarted';

    var initDraggable = function (win, doc, $el) {
        var $doc = $(doc),
            $win = $(win);
        if (!$doc.data(DRAGGABLE_BIND_FLAG)) {
            $doc.data(DRAGGABLE_BIND_FLAG, true);
            $doc.data(CURSOR_POSITION_PROPERTY, null);

            $doc.bind(browserUtils.hasTouchEvents ? 'touchmove' : 'mousemove', function (e) {
                var curMousePos = browserUtils.hasTouchEvents ? {
                    x: e.originalEvent.targetTouches[0].pageX || e.originalEvent.touches[0].pageX,
                    y: e.originalEvent.targetTouches[0].pageY || e.originalEvent.touches[0].pageY
                } : {
                    x: e.clientX,
                    y: e.clientY
                };

                $.each($doc.find('.' + DRAGGABLE_CLASS), function () {
                    var $this = $(this);

                    if ($(this).data(DRAG_STARTED_PROPERTY)) {
                        $this.css({
                            left: Math.round($this.position().left) + curMousePos.x -
                                  $doc.data(CURSOR_POSITION_PROPERTY).x,
                            top:  Math.round($this.position().top) + curMousePos.y -
                                  $doc.data(CURSOR_POSITION_PROPERTY).y
                        });
                        return false;
                    }
                });

                $doc.data(CURSOR_POSITION_PROPERTY, curMousePos);
            });
        }

        if (!$win.data(DRAGGABLE_BIND_FLAG)) {
            $win.data(DRAGGABLE_BIND_FLAG, true);
            $win.data(SCROLL_POSITION_PROPERTY, {
                x: 0,
                y: 0
            });

            $win.scroll(function () {
                var curScrollTop = $win.scrollTop(),
                    x            = $win.scrollLeft() - $win.data(SCROLL_POSITION_PROPERTY).x,
                    y            = $win.scrollTop() - $win.data(SCROLL_POSITION_PROPERTY).y;

                $win.data(SCROLL_POSITION_PROPERTY).x = $win.scrollLeft();
                $win.data(SCROLL_POSITION_PROPERTY).y = $win.scrollTop();

                $.each($doc.find('.' + DRAGGABLE_CLASS), function () {
                    var $this = $(this);

                    if ($(this).data(DRAG_STARTED_PROPERTY)) {
                        $this.css({
                            left: $this.position().left + x,
                            top:  $this.position().top + y
                        });
                        return false;
                    }
                });
            });
        }

        $el.addClass(DRAGGABLE_CLASS);

        $el.bind(browserUtils.hasTouchEvents ? 'touchstart' : 'mousedown', function (e) {
            doc[CURSOR_POSITION_PROPERTY] = browserUtils.hasTouchEvents ? {
                x: e.originalEvent.targetTouches[0].pageX || e.originalEvent.touches[0].pageX,
                y: e.originalEvent.targetTouches[0].pageY || e.originalEvent.touches[0].pageY
            } : {
                x: e.clientX,
                y: e.clientY
            };

            $doc.data(CURSOR_POSITION_PROPERTY, doc[CURSOR_POSITION_PROPERTY]);

            $(this).data(DRAG_STARTED_PROPERTY, true);
        });

        $el.bind(browserUtils.hasTouchEvents ? 'touchend' : 'mouseup', function () {
            doc[CURSOR_POSITION_PROPERTY] = null;
            $(this).data(DRAG_STARTED_PROPERTY, false);
        });
    };

    var createDraggable = function (currentWindow, currentDocument, x, y) {
        var curDocument        = currentDocument || document,
            currentWindow      = currentWindow || window,
            lastCursorPosition = null,
            $draggable         = $('<div></div>')
                .attr('id', 'draggable')
                .addClass(TEST_ELEMENT_CLASS)
                .css({
                    width:           '60px',
                    height:          '60px',
                    position:        'absolute',
                    backgroundColor: 'grey',
                    left:            x ? x + 'px' : '100px',
                    top:             y ? y + 'px' : '850px',
                    zIndex:          5
                })
                .appendTo($(curDocument).find('body'));

        initDraggable(currentWindow, curDocument, $draggable);

        return $draggable;
    };

    var startNext = function () {
        if (browserUtils.isIE) {
            removeTestElements();
            window.setTimeout(start, 30);
        }
        else
            start();
    };

    var removeTestElements = function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
    };

    var runTypeAutomation = function (element, text, options, callback) {
        var typeOptions    = new TypeOptions(options);
        var typeAutomation = new TypeAutomation(element, text, typeOptions);

        typeAutomation
            .run()
            .then(callback);
    };

    QUnit.testDone(function () {
        if (!browserUtils.isIE)
            removeTestElements();
    });

    //tests
    module('actions with out of element\'s bounds offsets');

    asyncTest('Click playback', function () {
        var $smallDiv       = createDiv(200, 200, 50, 50, 'red'),
            $bigDiv         = createDiv(150, 150, 150, 150, 'grey'),
            clickSmallCount = 0,
            clickBigCount   = 0,
            offsetX         = $smallDiv.width() + 10,
            offsetY         = $smallDiv.height() + 10;

        $smallDiv.css('zIndex', '5');

        $smallDiv.click(function () {
            clickSmallCount++;
        });

        $bigDiv.bind('mousedown', function (e) {
            var smallDivPos       = position.getOffsetPosition($smallDiv[0]),
                smallDivPosClient = position.offsetToClientCoords({
                    x: smallDivPos.left + offsetX,
                    y: smallDivPos.top + offsetY
                });
            equal(e.clientX, smallDivPosClient.x);
            equal(e.clientY, smallDivPosClient.y);
        });

        $bigDiv.click(function () {
            clickBigCount++;
        });

        var clickOptions = new ClickOptions({
            offsetX: offsetX,
            offsetY: offsetY
        });

        var clickAutomation = new ClickAutomation($smallDiv[0], clickOptions);

        clickAutomation
            .run()
            .then(function () {
                equal(clickSmallCount, 0);
                equal(clickBigCount, 1);
                expect(4);
                startNext();
            });
    });

    asyncTest('RClick playback', function () {
        var $smallDiv       = createDiv(200, 200, 50, 50, 'red'),
            $bigDiv         = createDiv(150, 150, 150, 150, 'grey'),
            clickSmallCount = 0,
            clickBigCount   = 0,
            offsetX         = $smallDiv.width() + 10,
            offsetY         = $smallDiv.height() + 10;

        $smallDiv.css('zIndex', '5');

        $smallDiv.contextmenu(function () {
            clickSmallCount++;
        });

        $bigDiv.bind('mousedown', function (e) {
            var smallDivPos       = position.getOffsetPosition($smallDiv[0]),
                smallDivPosClient = position.offsetToClientCoords({
                    x: smallDivPos.left + offsetX,
                    y: smallDivPos.top + offsetY
                });
            equal(e.clientX, smallDivPosClient.x);
            equal(e.clientY, smallDivPosClient.y);
        });

        $bigDiv.contextmenu(function () {
            clickBigCount++;
        });

        var clickOptions = new ClickOptions({
            offsetX: offsetX,
            offsetY: offsetY
        });

        var rClickAutomation = new RClickAutomation($smallDiv[0], clickOptions);

        rClickAutomation
            .run()
            .then(function () {
                equal(clickSmallCount, 0);
                equal(clickBigCount, 1);
                expect(4);
                startNext();
            });
    });

    asyncTest('DblClick playback', function () {
        var $smallDiv       = createDiv(200, 200, 50, 50, 'red'),
            $bigDiv         = createDiv(150, 150, 150, 150, 'grey'),
            clickSmallCount = 0,
            clickBigCount   = 0,
            offsetX         = $smallDiv.width() + 10,
            offsetY         = $smallDiv.height() + 10;

        var mousedownHandler = function (e) {
            var smallDivPos       = position.getOffsetPosition($smallDiv[0]),
                smallDivPosClient = position.offsetToClientCoords({
                    x: smallDivPos.left + offsetX,
                    y: smallDivPos.top + offsetY
                });
            equal(e.clientX, smallDivPosClient.x);
            equal(e.clientY, smallDivPosClient.y);
        };

        $smallDiv.css('zIndex', '5');

        $smallDiv.dblclick(function () {
            clickSmallCount++;
        });

        $bigDiv.bind('mousedown', mousedownHandler);

        $bigDiv.dblclick(function () {
            clickBigCount++;
        });

        var clickOptions = new ClickOptions({
            offsetX:   offsetX,
            offsetY:   offsetY,
            modifiers: {}
        });

        var dblClickAutomation = new DblClickAutomation($smallDiv[0], clickOptions);

        dblClickAutomation
            .run()
            .then(function () {
                equal(clickSmallCount, 0);
                equal(clickBigCount, 1);
                expect(6);
                startNext();
            });
    });

    asyncTest('Type playback', function () {
        var inputText           = 'input with text',
            typpingText         = 'testtext',
            newInputText        = '',
            startCursorPos      = 0,
            $input              = createTextInput()
                .attr('value', inputText),
            inputOffset         = position.getOffsetPosition($input[0]),
            inputCursorPosition = 5,
            offsetX             = $input.width() + 50,
            offsetY             = $input.height() + 50,
            typeOptions         = {
                offsetX:  offsetX,
                offsetY:  offsetY,
                caretPos: inputCursorPosition
            },
            $div                = createDiv(inputOffset.left, inputOffset.top + $input.height(), $input.width() +
                                                                                                 100, 100, 'red');

        $div.click(function () {
            $input.focus();
            startCursorPos = textSelection.getSelectionStart($input[0]);
            newInputText   = inputText.substring(0, startCursorPos) + typpingText + inputText.substring(startCursorPos);
        });

        runTypeAutomation($input[0], typpingText, typeOptions, function () {
            equal($input[0].value, newInputText);
            equal(textSelection.getSelectionStart($input[0]), startCursorPos + typpingText.length);
            startNext();
        });
    });

    asyncTest('Type playback with too large offset', function () {
        var inputText           = 'input with text',
            typpingText         = 'testtext',
            $input              = createTextInput().attr('value', inputText),
            startCursorPos      = textSelection.getSelectionStart($input[0]),
            inputCursorPosition = 5,
            offsetX             = $input.width() + 50,
            offsetY             = $input.height() + 50,
            typeOptions         = {
                offsetX:  offsetX,
                offsetY:  offsetY,
                caretPos: inputCursorPosition
            };

        runTypeAutomation($input[0], typpingText, typeOptions, function () {
            equal($input[0].value, inputText);
            equal(textSelection.getSelectionStart($input[0]), startCursorPos);
            startNext();
        });
    });

    asyncTest('Drag playback', function () {
        var $smallDraggable      = createDraggable(window, document, 200, 200),
            smallDraggableOffset = position.getOffsetPosition($smallDraggable[0]),

            $bigDraggable        = createDraggable(window, document, 150, 150),
            bigDraggableOffset   = position.getOffsetPosition($bigDraggable[0]),

            dragOffsetX          = 10,
            dragOffsetY          = -100,
            offsetX              = $smallDraggable.width() + 10,
            offsetY              = $smallDraggable.height() + 10;

        var handler = function (e) {
            var smallDraggablePos       = position.getOffsetPosition($smallDraggable[0]),
                smallDraggablePosClient = position.offsetToClientCoords({
                    x: smallDraggablePos.left + offsetX,
                    y: smallDraggablePos.top + offsetY
                });
            equal(e.clientX, smallDraggablePosClient.x + dragOffsetX, 'mousedown clientX correct');
            equal(e.clientY, smallDraggablePosClient.y + dragOffsetY, 'mousedown clientY correct');
        };

        if (!browserUtils.hasTouchEvents) {
            $bigDraggable.bind('mousedown', function (e) {
                var smallDraggablePos       = position.getOffsetPosition($smallDraggable[0]),
                    smallDraggablePosClient = position.offsetToClientCoords({
                        x: smallDraggablePos.left + offsetX,
                        y: smallDraggablePos.top + offsetY
                    });
                equal(e.clientX, smallDraggablePosClient.x, 'mousedown clientX correct');
                equal(e.clientY, smallDraggablePosClient.y, 'mousedown clientY correct');
            });
            $bigDraggable.bind('mouseup', handler);
            $bigDraggable.bind('click', handler);
        }

        $bigDraggable.css({
            width:  150 + 'px',
            height: 150 + 'px'
        });

        $smallDraggable.css({
            width:           50 + 'px',
            height:          50 + 'px',
            zIndex:          15,
            backgroundColor: 'red'
        });

        var mouseOptions = new MouseOptions({
            offsetX: offsetX,
            offsetY: offsetY
        });

        var dragAutomation = new DragToOffsetAutomation($smallDraggable[0], dragOffsetX, dragOffsetY, mouseOptions);

        dragAutomation
            .run()
            .then(function () {
                deepEqual(position.getOffsetPosition($smallDraggable[0]), smallDraggableOffset);
                equal(position.getOffsetPosition($bigDraggable[0]).left, bigDraggableOffset.left + dragOffsetX);
                equal(position.getOffsetPosition($bigDraggable[0]).top, bigDraggableOffset.top + dragOffsetY);

                expect(browserUtils.hasTouchEvents ? 3 : 9);

                startNext();
            });
    });
});
