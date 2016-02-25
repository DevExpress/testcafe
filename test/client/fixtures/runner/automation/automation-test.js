var hammerhead   = window.getTestCafeModule('hammerhead');
var browserUtils = hammerhead.utils.browser;

var testCafeCore  = window.getTestCafeModule('testCafeCore');
var domUtils      = testCafeCore.get('./utils/dom');
var textSelection = testCafeCore.get('./utils/text-selection');
var position      = testCafeCore.get('./utils/position');

var testCafeRunner             = window.getTestCafeModule('testCafeRunner');
var automation                 = testCafeRunner.get('./automation/automation');
var DragOptions                = testCafeRunner.get('./automation/options/drag');
var clickPlaybackAutomation    = testCafeRunner.get('./automation/playback/click');
var dblClickPlaybackAutomation = testCafeRunner.get('./automation/playback/dblclick');
var DragAutomation             = testCafeRunner.get('./automation/playback/drag');
var selectPlaybackAutomation   = testCafeRunner.get('./automation/playback/select');
var SelectOptions              = testCafeRunner.get('./automation/options/select');
var SelectAutomation           = testCafeRunner.get('./automation/playback/select');
var typePlaybackAutomation     = testCafeRunner.get('./automation/playback/type');
var PressAutomation            = testCafeRunner.get('./automation/playback/press');
var parseKeyString             = testCafeRunner.get('./automation/playback/press/parse-key-string');

QUnit.begin(function () {
    automation.init();
});

$(document).ready(function () {
    //consts
    var TEST_ELEMENT_CLASS = 'testElement';

    //utils
    var createTextInput = function () {
        return $('<input type="text">').attr('id', 'input').addClass(TEST_ELEMENT_CLASS).appendTo('body');
    };

    var createTextarea = function () {
        return $('<textarea>').attr('id', 'textarea').addClass(TEST_ELEMENT_CLASS).appendTo('body').css('height', 200);
    };

    $('body').css('height', 1500);
    //NOTE: problem with window.top bodyMargin in IE9 if test 'runAll'
    //because we can't determine that element is in qunit test iframe
    if (browserUtils.isIE9)
        $(window.top.document).find('body').css('marginTop', '0px');

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
                var x = $win.scrollLeft() - $win.data(SCROLL_POSITION_PROPERTY).x,
                    y = $win.scrollTop() - $win.data(SCROLL_POSITION_PROPERTY).y;

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
        currentDocument = currentDocument || document;
        currentWindow   = currentWindow || window;

        var $draggable = $('<div></div>')
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

    var startNext = function (ms) {
        if (browserUtils.isIE) {
            removeTestElements();
            window.setTimeout(start, ms || 30);
        }
        else
            start();
    };

    var removeTestElements = function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
    };

    var checkEditorSelection = function (element, startSelection, endSelection, selectionInversed) {
        var start  = textSelection.getSelectionStart(element),
            result = document.activeElement === element && start === startSelection;

        if (result && typeof endSelection !== 'undefined')
            result = textSelection.getSelectionEnd(element) === endSelection;

        if (result && typeof selectionInversed !== 'undefined')
            result = textSelection.hasInverseSelection(element) === selectionInversed;

        return result;
    };

    var checkSelection = function (el, start, end, inverse) {
        equal(domUtils.getActiveElement(), el, 'selected element is active');
        equal(textSelection.getSelectionStart(el), start, 'start selection correct');
        equal(textSelection.getSelectionEnd(el), end, 'end selection correct');
        equal(textSelection.hasInverseSelection(el), inverse, 'selection direction correct');
    };

    var preventDefault = function (e) {
        var ev = e || window.event;
        if (ev.preventDefault)
            ev.preventDefault();
        else
            ev.returnValue = false;
    };

    var runPressAutomation = function (keys, callback) {
        var pressAutomation = new PressAutomation(parseKeyString(keys).combinations);

        pressAutomation
            .run()
            .then(callback);
    };

    QUnit.testDone(function () {
        if (!browserUtils.isIE)
            removeTestElements();
    });

    //tests
    asyncTest('run click playback', function () {
        var $input     = createTextInput(),
            clickCount = 0;

        $input.click(function () {
            clickCount++;
        });

        clickPlaybackAutomation($input[0], {}, function () {
            equal(clickCount, 1);
            startNext();
        });
    });

    asyncTest('run dblclick playback', function () {
        var $input        = createTextInput(),
            dblclickCount = 0,
            clickCount    = 0;

        $input.dblclick(function () {
            dblclickCount++;
        });

        $input.click(function () {
            clickCount++;
        });

        dblClickPlaybackAutomation($input[0], {}, function () {
            equal(clickCount, 2);
            equal(dblclickCount, 1);
            startNext();
        });
    });

    asyncTest('run drag playback', function () {
        var $draggable  = createDraggable(),
            dragOffsetX = 10,
            dragOffsetY = -100,
            center      = position.findCenter($draggable[0]),
            pointTo     = { x: center.x + dragOffsetX, y: center.y + dragOffsetY };

        var dragOptions = new DragOptions();

        dragOptions.dragOffsetX = dragOffsetX;
        dragOptions.dragOffsetY = dragOffsetY;

        var dragAutomation = new DragAutomation($draggable[0], dragOptions);

        dragAutomation
            .run()
            .then(function () {
                deepEqual(position.findCenter($draggable[0]), pointTo);
                startNext();
            });
    });

    asyncTest('run select playback in input', function () {
        var $input = createTextInput();

        $input[0].value = '123456789qwertyuiop';

        var selectOptions = new SelectOptions();

        selectOptions.startPos = 10;
        selectOptions.endPos   = 2;

        var selectAutomation = new SelectAutomation($input[0], selectOptions);

        selectAutomation
            .run()
            .then(function () {
                checkSelection($input[0], 2, 10, true);
                startNext(300);
            });
    });

    asyncTest('run select playback in textarea', function () {
        var $textarea = createTextarea(),
            value     = '123456789\nabcd\nefjtybllsjaLJS';

        $textarea[0].value       = value;
        $textarea[0].textContent = value;
        $textarea.text(value);

        var selectOptions = new SelectOptions();

        selectOptions.startPos = 2;
        selectOptions.endPos   = value.length - 5;

        var selectAutomation = new SelectAutomation($textarea[0], selectOptions);

        selectAutomation
            .run()
            .then(function () {
                checkSelection($textarea[0], 2, value.length - 5, false);
                startNext();
            });
    });

    asyncTest('run press playback', function () {
        var initText = 'init',
            newText  = 'ini',
            input    = createTextInput()[0],
            keys     = 'backspace';

        typePlaybackAutomation(input, initText, {}, function () {
            runPressAutomation(keys, function () {
                equal(input.value, newText);
                startNext();
            });
        });
    });

    asyncTest('run type playback', function () {
        var initText = 'init',
            newText  = 'new',
            $input   = createTextInput().attr('value', initText);

        typePlaybackAutomation($input[0], newText, {}, function () {
            equal($input[0].value, initText + newText);
            startNext();
        });
    });

    asyncTest('press down in textarea', function () {
        var initText  = 'Textarea\rfor test\r123456789',
            $textarea = createTextarea().val(initText),
            keys      = 'down';

        window.async.series({
            'Click on textarea': function (callback) {
                clickPlaybackAutomation($textarea[0], { caretPos: 5 }, callback);
            },
            'First press down':  function (callback) {
                ok(checkEditorSelection($textarea[0], 5));

                runPressAutomation(keys, callback);
            },
            'Second press down': function (callback) {
                ok(checkEditorSelection($textarea[0], 14));

                runPressAutomation(keys, callback);
            },
            'Third press down':  function (callback) {
                ok(checkEditorSelection($textarea[0], 23));

                runPressAutomation(keys, callback);
            },
            'Check selection':   function () {
                ok(checkEditorSelection($textarea[0], $textarea[0].value.length));
                startNext();
            }
        });
    });

    asyncTest('press up in textarea', function () {
        var initText  = 'Textarea\rfor test\r123456789',
            $textarea = createTextarea().val(initText),
            keys      = 'up';


        window.async.series({
            'Click on textarea': function (callback) {
                clickPlaybackAutomation($textarea[0], { caretPos: 23 }, callback);
            },
            'First press up':    function (callback) {
                ok(checkEditorSelection($textarea[0], 23));

                runPressAutomation(keys, callback);
            },
            'Second press up':   function (callback) {
                ok(checkEditorSelection($textarea[0], 14));

                runPressAutomation(keys, callback);
            },
            'Third press up':    function (callback) {
                ok(checkEditorSelection($textarea[0], 5));

                runPressAutomation(keys, callback);
            },
            'Check selection':   function () {
                ok(checkEditorSelection($textarea[0], 0));
                startNext();
            }
        });
    });

    asyncTest('press home in textarea', function () {
        var initText  = 'abc\n123\n123456789',
            $textarea = createTextarea().val(initText);

        window.async.series({
            'Click on textarea': function (callback) {
                clickPlaybackAutomation($textarea[0], { caretPos: 5 }, callback);
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
        var initText  = 'Textarea\rfor test\r123456789',
            $textarea = createTextarea().val(initText);

        window.async.series({
            'Click on textarea': function (callback) {
                clickPlaybackAutomation($textarea[0], { caretPos: 15 }, callback);
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
        var $input               = createTextInput(),
            clickCount           = 0,
            errorScroll          = false,
            $scrollableContainer = $('<div />')
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

        var scrollHandler        = function () {
                if (clickCount === 1) {
                    errorScroll = true;
                }
            },
            bindScrollHandlers   = function () {
                $scrollableContainer.bind('scroll', scrollHandler);
                $(window).bind('scroll', scrollHandler);
            },
            unbindScrollHandlers = function () {
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
                clickPlaybackAutomation($input[0], {}, callback);
            },

            'Second Click': function (callback) {
                equal(clickCount, 1);
                bindScrollHandlers();

                clickPlaybackAutomation($input[0], {}, callback);
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
        var input       = createTextInput()[0],
            focusRaised = false;

        input['onmousedown'] = preventDefault;

        input['onfocus'] = function () {
            focusRaised = true;
        };

        clickPlaybackAutomation(input, {}, function () {
            equal(focusRaised, false);
            notEqual(document.activeElement, input);
            startNext();
        });
    });

    asyncTest('input text doesn\'t changed on type if keydown event prevented', function () {
        var initText = '1',
            newText  = '123',
            $input   = createTextInput().attr('value', initText);

        $input[0]['onkeydown'] = preventDefault;

        typePlaybackAutomation($input[0], newText, {}, function () {
            equal($input[0].value, initText);
            startNext();
        });
    });

    module('Regression');
    asyncTest('T191234 - Press Enter key on a textbox element doesn\'t raise report\'s element updating during test running', function () {
        var input       = createTextInput()[0],
            changeCount = 0,
            keys        = 'enter';

        input.addEventListener('change', function () {
            changeCount++;
        });

        typePlaybackAutomation(input, 'a', {}, function () {
            equal(document.activeElement, input);
            equal(changeCount, 0);

            runPressAutomation(keys, function () {
                equal(document.activeElement, input);
                equal(changeCount, browserUtils.isIE ? 0 : 1);

                runPressAutomation(keys, function () {
                    equal(document.activeElement, input);
                    equal(changeCount, browserUtils.isIE ? 0 : 1);
                    start();
                })
            });
        });
    });
});
