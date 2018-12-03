const hammerhead       = window.getTestCafeModule('hammerhead');
const browserUtils     = hammerhead.utils.browser;
const featureDetection = hammerhead.utils.featureDetection;

const testCafeCore  = window.getTestCafeModule('testCafeCore');
const domUtils      = testCafeCore.get('./utils/dom');
const textSelection = testCafeCore.get('./utils/text-selection');
const position      = testCafeCore.get('./utils/position');

testCafeCore.preventRealEvents();

const testCafeAutomation     = window.getTestCafeModule('testCafeAutomation');
const ClickAutomation        = testCafeAutomation.Click;
const DblClickAutomation     = testCafeAutomation.DblClick;
const SelectTextAutomation   = testCafeAutomation.SelectText;
const TypeAutomation         = testCafeAutomation.Type;
const PressAutomation        = testCafeAutomation.Press;
const DragToOffsetAutomation = testCafeAutomation.DragToOffset;

const ClickOptions = testCafeAutomation.get('../../test-run/commands/options').ClickOptions;
const TypeOptions  = testCafeAutomation.get('../../test-run/commands/options').TypeOptions;
const MouseOptions = testCafeAutomation.get('../../test-run/commands/options').MouseOptions;

const parseKeySequence = testCafeCore.get('./utils/parse-key-sequence');
const getOffsetOptions = testCafeAutomation.getOffsetOptions;


$(document).ready(function () {
    //consts
    const TEST_ELEMENT_CLASS = 'testElement';

    //utils
    const createTextInput = function () {
        return $('<input type="text">').attr('id', 'input').addClass(TEST_ELEMENT_CLASS).appendTo('body');
    };

    const createTextarea = function () {
        return $('<textarea>').attr('id', 'textarea').addClass(TEST_ELEMENT_CLASS).appendTo('body').css('height', 200);
    };

    $('body').css('height', 1500);
    //NOTE: problem with window.top bodyMargin in IE9 if test 'runAll'
    //because we can't determine that element is in qunit test iframe
    if (browserUtils.isIE9)
        $(window.top.document).find('body').css('marginTop', '0px');

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
        currentDocument = currentDocument || document;
        currentWindow   = currentWindow || window;

        const $draggable = $('<div></div>')
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
            .appendTo($(currentDocument).find('body'));

        initDraggable(currentWindow, currentDocument, $draggable);

        return $draggable;
    };

    const startNext = function (ms) {
        if (browserUtils.isIE) {
            removeTestElements();
            window.setTimeout(start, ms || 30);
        }
        else
            start();
    };

    const removeTestElements = function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
    };

    const checkEditorSelection = function (element, startSelection, endSelection, selectionInversed) {
        const start = textSelection.getSelectionStart(element);
        let result  = document.activeElement === element && start === startSelection;

        if (result && typeof endSelection !== 'undefined')
            result = textSelection.getSelectionEnd(element) === endSelection;

        if (result && typeof selectionInversed !== 'undefined')
            result = textSelection.hasInverseSelection(element) === selectionInversed;

        return result;
    };

    const checkSelection = function (el, start, end, inverse) {
        equal(domUtils.getActiveElement(), el, 'selected element is active');
        equal(textSelection.getSelectionStart(el), start, 'start selection correct');
        equal(textSelection.getSelectionEnd(el), end, 'end selection correct');

        if (!window.DIRECTION_ALWAYS_IS_FORWARD)
            equal(textSelection.hasInverseSelection(el), inverse, 'selection direction correct');
    };

    const preventDefault = function (e) {
        const ev = e || window.event;

        if (ev.preventDefault)
            ev.preventDefault();
        else
            ev.returnValue = false;
    };

    const runPressAutomation = function (keys, callback) {
        const pressAutomation = new PressAutomation(parseKeySequence(keys).combinations, {});

        pressAutomation
            .run()
            .then(callback);
    };

    const runClickAutomation = function (el, options, callback) {
        const offsets      = getOffsetOptions(el, options.offsetX, options.offsetY);
        const clickOptions = new ClickOptions({
            offsetX:  offsets.offsetX,
            offsetY:  offsets.offsetY,
            caretPos: options.caretPos,

            modifiers: {
                ctrl:  options.ctrl,
                alt:   options.ctrl,
                shift: options.shift,
                meta:  options.meta
            }
        });

        const clickAutomation = new ClickAutomation(el, clickOptions);

        clickAutomation
            .run()
            .then(callback);
    };

    const runTypeAutomation = function (element, text, callback) {
        const offsets     = getOffsetOptions(element);
        const typeOptions = new TypeOptions({
            offsetX: offsets.offsetX,
            offsetY: offsets.offsetY
        });

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
    asyncTest('run click playback', function () {
        const $input   = createTextInput();
        let clickCount = 0;

        $input.click(function () {
            clickCount++;
        });

        runClickAutomation($input[0], {}, function () {
            equal(clickCount, 1);
            startNext();
        });
    });

    asyncTest('run dblclick playback', function () {
        const $input        = createTextInput();
        let dblclickCount = 0;
        let clickCount    = 0;

        $input.dblclick(function () {
            dblclickCount++;
        });

        $input.click(function () {
            clickCount++;
        });

        const offsets      = getOffsetOptions($input[0]);
        const clickOptions = new ClickOptions({
            offsetX: offsets.offsetX,
            offsetY: offsets.offsetY,

            modifiers: {}
        });

        const dblClickAutomation = new DblClickAutomation($input[0], clickOptions);

        dblClickAutomation
            .run()
            .then(function () {
                equal(clickCount, 2);
                equal(dblclickCount, 1);
                startNext();
            });
    });

    asyncTest('run drag playback', function () {
        const $draggable  = createDraggable();
        const dragOffsetX = 10;
        const dragOffsetY = -100;
        const center      = position.findCenter($draggable[0]);
        const pointTo     = { x: center.x + dragOffsetX, y: center.y + dragOffsetY };

        const dragAutomation = new DragToOffsetAutomation($draggable[0], dragOffsetX, dragOffsetY, new MouseOptions({ offsetX: 0, offsetY: 0 }));

        dragAutomation
            .run()
            .then(function () {
                deepEqual(position.findCenter($draggable[0]), pointTo);
                startNext();
            });
    });

    asyncTest('run select playback in input', function () {
        const $input = createTextInput();

        $input[0].value = '123456789qwertyuiop';

        const selectTextAutomation = new SelectTextAutomation($input[0], 10, 2, {});

        selectTextAutomation
            .run()
            .then(function () {
                checkSelection($input[0], 2, 10, true);
                startNext(300);
            });
    });

    asyncTest('run select playback in textarea', function () {
        const $textarea = createTextarea();
        const value     = '123456789\nabcd\nefjtybllsjaLJS';

        $textarea[0].value       = value;
        $textarea[0].textContent = value;
        $textarea.text(value);

        const selectTextAutomation = new SelectTextAutomation($textarea[0], 2, value.length - 5, {});

        selectTextAutomation
            .run()
            .then(function () {
                checkSelection($textarea[0], 2, value.length - 5, false);
                startNext();
            });
    });

    asyncTest('run press playback', function () {
        const initText = 'init';
        const newText  = 'ini';
        const input    = createTextInput()[0];
        const keys     = 'backspace';

        runTypeAutomation(input, initText, function () {
            equal(input.value, initText);
            runPressAutomation(keys, function () {
                equal(input.value, newText);
                startNext();
            });
        });
    });

    asyncTest('run type playback', function () {
        const initText = 'init';
        const newText  = 'new';
        const $input   = createTextInput().attr('value', initText);

        runTypeAutomation($input[0], newText, function () {
            equal($input[0].value, initText + newText);
            startNext();
        });
    });

    asyncTest('press down in textarea', function () {
        const initText  = 'Textarea\rfor test\r123456789';
        const $textarea = createTextarea().val(initText);
        const keys      = 'down';

        window.async.series({
            'Click on textarea': function (callback) {
                runClickAutomation($textarea[0], { caretPos: 5 }, function () {
                    callback();
                });
            },

            'First press down': function (callback) {
                ok(checkEditorSelection($textarea[0], 5));

                runPressAutomation(keys, callback);
            },

            'Second press down': function (callback) {
                ok(checkEditorSelection($textarea[0], 14));

                runPressAutomation(keys, callback);
            },

            'Third press down': function (callback) {
                ok(checkEditorSelection($textarea[0], 23));

                runPressAutomation(keys, callback);
            },

            'Check selection': function () {
                ok(checkEditorSelection($textarea[0], $textarea[0].value.length));
                startNext();
            }
        });
    });

    asyncTest('press up in textarea', function () {
        const initText  = 'Textarea\rfor test\r123456789';
        const $textarea = createTextarea().val(initText);
        const keys      = 'up';


        window.async.series({
            'Click on textarea': function (callback) {
                runClickAutomation($textarea[0], { caretPos: 23 }, function () {
                    callback();
                });
            },

            'First press up': function (callback) {
                ok(checkEditorSelection($textarea[0], 23));

                runPressAutomation(keys, callback);
            },

            'Second press up': function (callback) {
                ok(checkEditorSelection($textarea[0], 14));

                runPressAutomation(keys, callback);
            },

            'Third press up': function (callback) {
                ok(checkEditorSelection($textarea[0], 5));

                runPressAutomation(keys, callback);
            },

            'Check selection': function () {
                ok(checkEditorSelection($textarea[0], 0));
                startNext();
            }
        });
    });

    asyncTest('press home in textarea', function () {
        const initText  = 'abc\n123\n123456789';
        const $textarea = createTextarea().val(initText);

        window.async.series({
            'Click on textarea': function (callback) {
                runClickAutomation($textarea[0], { caretPos: 5 }, function () {
                    callback();
                });
            },

            'Press home': function (callback) {
                ok(checkEditorSelection($textarea[0], 5));

                runPressAutomation('home', callback);
            },

            'Check selection': function () {
                ok(checkEditorSelection($textarea[0], 4));
                startNext();
            }
        });
    });

    asyncTest('press end in textarea', function () {
        const initText  = 'Textarea\rfor test\r123456789';
        const $textarea = createTextarea().val(initText);

        window.async.series({
            'Click on textarea': function (callback) {
                runClickAutomation($textarea[0], { caretPos: 15 }, function () {
                    callback();
                });
            },

            'Press end': function (callback) {
                ok(checkEditorSelection($textarea[0], 15));

                runPressAutomation('end', callback);
            },

            'Check selection': function () {
                ok(checkEditorSelection($textarea[0], 17));
                startNext();
            }
        });
    });

    module('checking the require scrolling');

    asyncTest('click element with scroll then click body near to first click does not raise scroll again', function () {
        const $input               = createTextInput();
        let clickCount           = 0;
        let errorScroll          = false;
        const $scrollableContainer = $('<div />')
            .css({
                position: 'absolute',
                left:     '50px',
                top:      '1200px',
                border:   '1px solid black',
                overflow: 'scroll'
            })
            .width(200)
            .height(150)
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo($('body'));

        $input.css({ marginTop: '400px' });
        $input.appendTo($scrollableContainer);

        const scrollHandler = function () {
            if (clickCount === 1)
                errorScroll = true;
        };

        const bindScrollHandlers = function () {
            $scrollableContainer.bind('scroll', scrollHandler);
            $(window).bind('scroll', scrollHandler);
        };

        const unbindScrollHandlers = function () {
            $scrollableContainer.unbind('scroll', scrollHandler);
            $(window).unbind('scroll', scrollHandler);
        };

        $input.click(function () {
            clickCount++;
        });

        $input.bind('mousedown', function () {
            unbindScrollHandlers();
        });

        bindScrollHandlers();

        window.async.series({
            'First Click': function (callback) {
                runClickAutomation($input[0], {}, function () {
                    callback();
                });
            },

            'Second Click': function (callback) {
                equal(clickCount, 1);
                bindScrollHandlers();

                runClickAutomation($input[0], {}, function () {
                    callback();
                });
            },

            'Check assertions': function () {
                equal(clickCount, 2);
                ok(!errorScroll);
                startNext();
            }
        });
    });

    module('check preventing events');

    asyncTest('focus event doesn\'t raised on click if mousedown event prevented', function () {
        const input       = createTextInput()[0];
        let focusRaised   = false;

        input['onmousedown'] = preventDefault;

        input['onfocus'] = function () {
            focusRaised = true;
        };

        runClickAutomation(input, {}, function () {
            equal(focusRaised, false);
            notEqual(document.activeElement, input);
            startNext();
        });
    });

    asyncTest('input text doesn\'t changed on type if keydown event prevented', function () {
        const initText = '1';
        const newText  = '123';
        const $input   = createTextInput().attr('value', initText);

        $input[0]['onkeydown'] = preventDefault;

        runTypeAutomation($input[0], newText, function () {
            equal($input[0].value, initText);
            startNext();
        });
    });

    module('Regression');
    asyncTest('T191234 - Press Enter key on a textbox element doesn\'t raise report\'s element updating during test running', function () {
        const input       = createTextInput()[0];
        const keys        = 'enter';

        let changeCount = 0;

        input.addEventListener('change', function () {
            changeCount++;
        });

        runTypeAutomation(input, 'a', function () {
            equal(document.activeElement, input);
            equal(changeCount, 0);

            runPressAutomation(keys, function () {
                equal(document.activeElement, input);
                equal(changeCount, browserUtils.isIE ? 0 : 1);

                runPressAutomation(keys, function () {
                    equal(document.activeElement, input);
                    equal(changeCount, browserUtils.isIE ? 0 : 1);
                    start();
                });
            });
        });
    });
});
