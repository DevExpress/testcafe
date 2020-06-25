const hammerhead       = window.getTestCafeModule('hammerhead');
const browserUtils     = hammerhead.utils.browser;
const featureDetection = hammerhead.utils.featureDetection;

const testCafeCore  = window.getTestCafeModule('testCafeCore');
const position      = testCafeCore.positionUtils;
const textSelection = testCafeCore.textSelection;

testCafeCore.preventRealEvents();

const testCafeAutomation     = window.getTestCafeModule('testCafeAutomation');
const ClickOptions           = testCafeAutomation.ClickOptions;
const TypeOptions            = testCafeAutomation.TypeOptions;
const MouseOptions           = testCafeAutomation.MouseOptions;
const ClickAutomation        = testCafeAutomation.Click;
const RClickAutomation       = testCafeAutomation.RClick;
const DblClickAutomation     = testCafeAutomation.DblClick;
const DragToOffsetAutomation = testCafeAutomation.DragToOffset;
const TypeAutomation         = testCafeAutomation.Type;


$(document).ready(function () {
    //consts
    const TEST_ELEMENT_CLASS = 'testElement';

    //utils
    const createTextInput = function () {
        return $('<input type="text">').attr('id', 'input').addClass(TEST_ELEMENT_CLASS).appendTo('body');
    };

    $('body').css('height', 1500);

    const createDiv = function (x, y, width, height, color) {
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

    const DRAGGABLE_BIND_FLAG      = 'tc-dbf-c56a4d91';
    const CURSOR_POSITION_PROPERTY = 'tc-cpp-ac4a65d4';
    const SCROLL_POSITION_PROPERTY = 'tc-spp-ac4a65d4';
    const DRAGGABLE_CLASS          = 'draggable';
    const DRAG_STARTED_PROPERTY    = 'dragStarted';

    const initDraggable = function (win, doc, $el) {
        const $doc = $(doc);
        const $win = $(win);

        if (!$doc.data(DRAGGABLE_BIND_FLAG)) {
            $doc.data(DRAGGABLE_BIND_FLAG, true);
            $doc.data(CURSOR_POSITION_PROPERTY, null);

            $doc.bind(featureDetection.isTouchDevice ? 'touchmove' : 'mousemove', function (e) {
                const curMousePos = featureDetection.isTouchDevice ? {
                    x: e.originalEvent.targetTouches[0].pageX || e.originalEvent.touches[0].pageX,
                    y: e.originalEvent.targetTouches[0].pageY || e.originalEvent.touches[0].pageY
                } : {
                    x: e.clientX,
                    y: e.clientY
                };

                $.each($doc.find('.' + DRAGGABLE_CLASS), function () {
                    const $this = $(this);

                    if ($(this).data(DRAG_STARTED_PROPERTY)) {
                        $this.css({
                            left: Math.round($this.position().left) + curMousePos.x -
                                  $doc.data(CURSOR_POSITION_PROPERTY).x,

                            top: Math.round($this.position().top) + curMousePos.y -
                                 $doc.data(CURSOR_POSITION_PROPERTY).y
                        });

                        return false;
                    }

                    return true;
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
                const x = $win.scrollLeft() - $win.data(SCROLL_POSITION_PROPERTY).x;
                const y = $win.scrollTop() - $win.data(SCROLL_POSITION_PROPERTY).y;

                $win.data(SCROLL_POSITION_PROPERTY).x = $win.scrollLeft();
                $win.data(SCROLL_POSITION_PROPERTY).y = $win.scrollTop();

                $.each($doc.find('.' + DRAGGABLE_CLASS), function () {
                    const $this = $(this);

                    if ($(this).data(DRAG_STARTED_PROPERTY)) {
                        $this.css({
                            left: $this.position().left + x,
                            top:  $this.position().top + y
                        });
                        return false;
                    }

                    return true;
                });
            });
        }

        $el.addClass(DRAGGABLE_CLASS);

        $el.bind(featureDetection.isTouchDevice ? 'touchstart' : 'mousedown', function (e) {
            doc[CURSOR_POSITION_PROPERTY] = featureDetection.isTouchDevice ? {
                x: e.originalEvent.targetTouches[0].pageX || e.originalEvent.touches[0].pageX,
                y: e.originalEvent.targetTouches[0].pageY || e.originalEvent.touches[0].pageY
            } : {
                x: e.clientX,
                y: e.clientY
            };

            $doc.data(CURSOR_POSITION_PROPERTY, doc[CURSOR_POSITION_PROPERTY]);

            $(this).data(DRAG_STARTED_PROPERTY, true);
        });

        $el.bind(featureDetection.isTouchDevice ? 'touchend' : 'mouseup', function () {
            doc[CURSOR_POSITION_PROPERTY] = null;
            $(this).data(DRAG_STARTED_PROPERTY, false);
        });
    };

    const createDraggable = function (currentWindow, currentDocument, x, y) {
        const curDocument = currentDocument || document;
        const curindow    = currentWindow || window;
        const $draggable  = $('<div></div>')
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

        initDraggable(curindow, curDocument, $draggable);

        return $draggable;
    };

    const startNext = function () {
        if (browserUtils.isIE) {
            removeTestElements();
            window.setTimeout(start, 30);
        }
        else
            start();
    };

    const removeTestElements = function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
    };

    const runTypeAutomation = function (element, text, options, callback) {
        const typeOptions    = new TypeOptions(options);
        const typeAutomation = new TypeAutomation(element, text, typeOptions);

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
        const $smallDiv       = createDiv(200, 200, 50, 50, 'red');
        const $bigDiv         = createDiv(150, 150, 150, 150, 'grey');
        const offsetX         = $smallDiv.width() + 10;
        const offsetY         = $smallDiv.height() + 10;

        let clickSmallCount = 0;
        let clickBigCount   = 0;


        $smallDiv.css('zIndex', '5');

        $smallDiv.click(function () {
            clickSmallCount++;
        });

        $bigDiv.bind('mousedown', function (e) {
            const smallDivPos       = position.getOffsetPosition($smallDiv[0]);
            const smallDivPosClient = position.offsetToClientCoords({
                x: smallDivPos.left + offsetX,
                y: smallDivPos.top + offsetY
            });

            equal(e.clientX, smallDivPosClient.x);
            equal(e.clientY, smallDivPosClient.y);
        });

        $bigDiv.click(function () {
            clickBigCount++;
        });

        const clickOptions = new ClickOptions({
            offsetX: offsetX,
            offsetY: offsetY
        });

        const clickAutomation = new ClickAutomation($smallDiv[0], clickOptions);

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
        const $smallDiv       = createDiv(200, 200, 50, 50, 'red');
        const $bigDiv         = createDiv(150, 150, 150, 150, 'grey');
        const offsetX         = $smallDiv.width() + 10;
        const offsetY         = $smallDiv.height() + 10;

        let clickSmallCount = 0;
        let clickBigCount   = 0;

        $smallDiv.css('zIndex', '5');

        $smallDiv.contextmenu(function () {
            clickSmallCount++;
        });

        $bigDiv.bind('mousedown', function (e) {
            const smallDivPos       = position.getOffsetPosition($smallDiv[0]);
            const smallDivPosClient = position.offsetToClientCoords({
                x: smallDivPos.left + offsetX,
                y: smallDivPos.top + offsetY
            });

            equal(e.clientX, smallDivPosClient.x);
            equal(e.clientY, smallDivPosClient.y);
        });

        $bigDiv.contextmenu(function () {
            clickBigCount++;
        });

        const clickOptions = new ClickOptions({
            offsetX: offsetX,
            offsetY: offsetY
        });

        const rClickAutomation = new RClickAutomation($smallDiv[0], clickOptions);

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
        const $smallDiv       = createDiv(200, 200, 50, 50, 'red');
        const $bigDiv         = createDiv(150, 150, 150, 150, 'grey');
        const offsetX         = $smallDiv.width() + 10;
        const offsetY         = $smallDiv.height() + 10;

        let clickSmallCount = 0;
        let clickBigCount   = 0;

        const mousedownHandler = function (e) {
            const smallDivPos       = position.getOffsetPosition($smallDiv[0]);
            const smallDivPosClient = position.offsetToClientCoords({
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

        const clickOptions = new ClickOptions({
            offsetX:   offsetX,
            offsetY:   offsetY,
            modifiers: {}
        });

        const dblClickAutomation = new DblClickAutomation($smallDiv[0], clickOptions);

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
        const inputText      = 'input with text';
        const typingText     = 'testtext';

        const $input = createTextInput()
            .attr('value', inputText);

        let newInputText   = '';
        let startCursorPos = 0;

        const inputOffset         = position.getOffsetPosition($input[0]);
        const inputCursorPosition = 5;
        const offsetX             = $input.width() + 50;
        const offsetY             = $input.height() + 50;

        const typeOptions = {
            offsetX:  offsetX,
            offsetY:  offsetY,
            caretPos: inputCursorPosition
        };

        const $div = createDiv(inputOffset.left, inputOffset.top + $input.height(), $input.width() +
                                                                                  100, 100, 'red');

        $div.click(function () {
            $input.focus();
            startCursorPos = textSelection.getSelectionStart($input[0]);
            newInputText   = inputText.substring(0, startCursorPos) + typingText + inputText.substring(startCursorPos);
        });

        runTypeAutomation($input[0], typingText, typeOptions, function () {
            equal($input[0].value, newInputText);
            equal(textSelection.getSelectionStart($input[0]), startCursorPos + typingText.length);
            startNext();
        });
    });

    asyncTest('Type playback with too large offset', function () {
        const inputText           = 'input with text';
        const typpingText         = 'testtext';
        const $input              = createTextInput().attr('value', inputText);
        const startCursorPos      = textSelection.getSelectionStart($input[0]);
        const inputCursorPosition = 5;
        const offsetX             = $input.width() + 50;
        const offsetY             = $input.height() + 50;
        const typeOptions         = {
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
        const $smallDraggable      = createDraggable(window, document, 200, 200);
        const smallDraggableOffset = position.getOffsetPosition($smallDraggable[0]);

        const $bigDraggable      = createDraggable(window, document, 150, 150);
        const bigDraggableOffset = position.getOffsetPosition($bigDraggable[0]);

        const dragOffsetX = 10;
        const dragOffsetY = -100;
        const offsetX     = $smallDraggable.width() + 10;
        const offsetY     = $smallDraggable.height() + 10;

        const handler = function (e) {
            const smallDraggablePos       = position.getOffsetPosition($smallDraggable[0]);
            const smallDraggablePosClient = position.offsetToClientCoords({
                x: smallDraggablePos.left + offsetX,
                y: smallDraggablePos.top + offsetY
            });

            equal(e.clientX, smallDraggablePosClient.x + dragOffsetX, 'mousedown clientX correct');
            equal(e.clientY, smallDraggablePosClient.y + dragOffsetY, 'mousedown clientY correct');
        };

        if (!featureDetection.isTouchDevice) {
            $bigDraggable.bind('mousedown', function (e) {
                const smallDraggablePos       = position.getOffsetPosition($smallDraggable[0]);
                const smallDraggablePosClient = position.offsetToClientCoords({
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

        const mouseOptions = new MouseOptions({
            offsetX: offsetX,
            offsetY: offsetY
        });

        const dragAutomation = new DragToOffsetAutomation($smallDraggable[0], dragOffsetX, dragOffsetY, mouseOptions);

        dragAutomation
            .run()
            .then(function () {
                deepEqual(position.getOffsetPosition($smallDraggable[0]), smallDraggableOffset);
                equal(position.getOffsetPosition($bigDraggable[0]).left, bigDraggableOffset.left + dragOffsetX);
                equal(position.getOffsetPosition($bigDraggable[0]).top, bigDraggableOffset.top + dragOffsetY);

                expect(featureDetection.isTouchDevice ? 3 : 9);

                startNext();
            });
    });
});
