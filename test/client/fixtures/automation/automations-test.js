var hammerhead       = window.getTestCafeModule('hammerhead');
var browserUtils     = hammerhead.utils.browser;
var featureDetection = hammerhead.utils.featureDetection;

var testCafeCore  = window.getTestCafeModule('testCafeCore');
var domUtils      = testCafeCore.get('./utils/dom');
var textSelection = testCafeCore.get('./utils/text-selection');
var position      = testCafeCore.get('./utils/position');

testCafeCore.preventRealEvents();

var testCafeAutomation     = window.getTestCafeModule('testCafeAutomation');
var ClickAutomation        = testCafeAutomation.Click;
var DblClickAutomation     = testCafeAutomation.DblClick;
var SelectTextAutomation   = testCafeAutomation.SelectText;
var TypeAutomation         = testCafeAutomation.Type;
var PressAutomation        = testCafeAutomation.Press;
var DragToOffsetAutomation = testCafeAutomation.DragToOffset;

var ClickOptions = testCafeAutomation.get('../../test-run/commands/options').ClickOptions;
var TypeOptions  = testCafeAutomation.get('../../test-run/commands/options').TypeOptions;
var MouseOptions = testCafeAutomation.get('../../test-run/commands/options').MouseOptions;

var parseKeySequence = testCafeCore.get('./utils/parse-key-sequence');
var getOffsetOptions = testCafeAutomation.getOffsetOptions;


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

    var DRAGGABLE_BIND_FLAG      = 'tc-dbf-c56a4d91';
    var CURSOR_POSITION_PROPERTY = 'tc-cpp-ac4a65d4';
    var SCROLL_POSITION_PROPERTY = 'tc-spp-ac4a65d4';
    var DRAGGABLE_CLASS          = 'draggable';
    var DRAG_STARTED_PROPERTY    = 'dragStarted';

    var initDraggable = function (win, doc, $el) {
        var $doc = $(doc);
        var $win = $(win);

        if (!$doc.data(DRAGGABLE_BIND_FLAG)) {
            $doc.data(DRAGGABLE_BIND_FLAG, true);
            $doc.data(CURSOR_POSITION_PROPERTY, null);

            $doc.bind(featureDetection.isTouchDevice ? 'touchmove' : 'mousemove', function (e) {
                var curMousePos = featureDetection.isTouchDevice ? {
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
                var x = $win.scrollLeft() - $win.data(SCROLL_POSITION_PROPERTY).x;
                var y = $win.scrollTop() - $win.data(SCROLL_POSITION_PROPERTY).y;

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
        var start  = textSelection.getSelectionStart(element);
        var result = document.activeElement === element && start === startSelection;

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
        var pressAutomation = new PressAutomation(parseKeySequence(keys).combinations, {});

        pressAutomation
            .run()
            .then(callback);
    };

    var runClickAutomation = function (el, options, callback) {
        var offsets      = getOffsetOptions(el, options.offsetX, options.offsetY);
        var clickOptions = new ClickOptions({
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

        var clickAutomation = new ClickAutomation(el, clickOptions);

        clickAutomation
            .run()
            .then(callback);
    };

    var runTypeAutomation = function (element, text, callback) {
        var offsets     = getOffsetOptions(element);
        var typeOptions = new TypeOptions({
            offsetX: offsets.offsetX,
            offsetY: offsets.offsetY
        });

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
    asyncTest('run click playback', function () {
        var $input     = createTextInput();
        var clickCount = 0;

        $input.click(function () {
            clickCount++;
        });

        runClickAutomation($input[0], {}, function () {
            equal(clickCount, 1);
            startNext();
        });
    });

    asyncTest('run dblclick playback', function () {
        var $input        = createTextInput();
        var dblclickCount = 0;
        var clickCount    = 0;

        $input.dblclick(function () {
            dblclickCount++;
        });

        $input.click(function () {
            clickCount++;
        });

        var offsets      = getOffsetOptions($input[0]);
        var clickOptions = new ClickOptions({
            offsetX: offsets.offsetX,
            offsetY: offsets.offsetY,

            modifiers: {}
        });

        var dblClickAutomation = new DblClickAutomation($input[0], clickOptions);

        dblClickAutomation
            .run()
            .then(function () {
                equal(clickCount, 2);
                equal(dblclickCount, 1);
                startNext();
            });
    });

    asyncTest('run drag playback', function () {
        var $draggable  = createDraggable();
        var dragOffsetX = 10;
        var dragOffsetY = -100;
        var center      = position.findCenter($draggable[0]);
        var pointTo     = { x: center.x + dragOffsetX, y: center.y + dragOffsetY };

        var dragAutomation = new DragToOffsetAutomation($draggable[0], dragOffsetX, dragOffsetY, new MouseOptions());

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

        var selectTextAutomation = new SelectTextAutomation($input[0], 10, 2, {});

        selectTextAutomation
            .run()
            .then(function () {
                checkSelection($input[0], 2, 10, true);
                startNext(300);
            });
    });

    asyncTest('run select playback in textarea', function () {
        var $textarea = createTextarea();
        var value     = '123456789\nabcd\nefjtybllsjaLJS';

        $textarea[0].value       = value;
        $textarea[0].textContent = value;
        $textarea.text(value);

        var selectTextAutomation = new SelectTextAutomation($textarea[0], 2, value.length - 5, {});

        selectTextAutomation
            .run()
            .then(function () {
                checkSelection($textarea[0], 2, value.length - 5, false);
                startNext();
            });
    });

    asyncTest('run press playback', function () {
        var initText = 'init';
        var newText  = 'ini';
        var input    = createTextInput()[0];
        var keys     = 'backspace';

        runTypeAutomation(input, initText, function () {
            equal(input.value, initText);
            runPressAutomation(keys, function () {
                equal(input.value, newText);
                startNext();
            });
        });
    });

    asyncTest('run type playback', function () {
        var initText = 'init';
        var newText  = 'new';
        var $input   = createTextInput().attr('value', initText);

        runTypeAutomation($input[0], newText, function () {
            equal($input[0].value, initText + newText);
            startNext();
        });
    });

    asyncTest('press down in textarea', function () {
        var initText  = 'Textarea\rfor test\r123456789';
        var $textarea = createTextarea().val(initText);
        var keys      = 'down';

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
        var initText  = 'Textarea\rfor test\r123456789';
        var $textarea = createTextarea().val(initText);
        var keys      = 'up';


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
        var initText  = 'abc\n123\n123456789';
        var $textarea = createTextarea().val(initText);

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
        var initText  = 'Textarea\rfor test\r123456789';
        var $textarea = createTextarea().val(initText);

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
        var $input               = createTextInput();
        var clickCount           = 0;
        var errorScroll          = false;
        var $scrollableContainer = $('<div />')
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

        var scrollHandler = function () {
            if (clickCount === 1)
                errorScroll = true;
        };

        var bindScrollHandlers = function () {
            $scrollableContainer.bind('scroll', scrollHandler);
            $(window).bind('scroll', scrollHandler);
        };

        var unbindScrollHandlers = function () {
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
        var input       = createTextInput()[0];
        var focusRaised = false;

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
        var initText = '1';
        var newText  = '123';
        var $input   = createTextInput().attr('value', initText);

        $input[0]['onkeydown'] = preventDefault;

        runTypeAutomation($input[0], newText, function () {
            equal($input[0].value, initText);
            startNext();
        });
    });

    module('Regression');
    asyncTest('T191234 - Press Enter key on a textbox element doesn\'t raise report\'s element updating during test running', function () {
        var input       = createTextInput()[0];
        var changeCount = 0;
        var keys        = 'enter';

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
