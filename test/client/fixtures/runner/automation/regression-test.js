var hammerhead    = window.getTestCafeModule('hammerhead');
var browserUtils  = hammerhead.utils.browser;
var nativeMethods = hammerhead.nativeMethods;

var testCafeCore  = window.getTestCafeModule('testCafeCore');
var domUtils      = testCafeCore.get('./utils/dom');
var eventUtils    = testCafeCore.get('./utils/event');
var textSelection = testCafeCore.get('./utils/text-selection');

var testCafeRunner             = window.getTestCafeModule('testCafeRunner');
var automation                 = testCafeRunner.get('./automation/automation');
var mouseUtils                 = testCafeRunner.get('./utils/mouse');
var MouseOptions               = testCafeRunner.get('./automation/options/mouse');
var clickPlaybackAutomation    = testCafeRunner.get('./automation/playback/click');
var dblClickPlaybackAutomation = testCafeRunner.get('./automation/playback/dblclick');
var HoverAutomation            = testCafeRunner.get('./automation/playback/hover');
var typePlaybackAutomation     = testCafeRunner.get('./automation/playback/type');
var SelectOptions              = testCafeRunner.get('./automation/options/select');
var SelectAutomation           = testCafeRunner.get('./automation/playback/select');
var PressAutomation            = testCafeRunner.get('./automation/playback/press');
var parseKeyString             = testCafeRunner.get('./automation/playback/press/parse-key-string');

automation.init();

$(document).ready(function () {
    //consts
    var TEST_ELEMENT_CLASS = 'testElement';

    //vars
    var body = $('body')[0];

    //utils
    var createInput = function (type) {
        return $('<input>')
            .attr('type', type || 'text')
            .attr('id', 'input')
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo('body');
    };

    var createButton = function () {
        return $('<input type="button">').addClass(TEST_ELEMENT_CLASS).appendTo('body');
    };

    $(body).css('height', 1500);
    //NOTE: problem with window.top bodyMargin in IE9 if test 'runAll'
    //because we can't determine that element is in qunit test iframe
    if (browserUtils.isIE9)
        $(window.top.document).find('body').css('marginTop', '0px');

    var createDraggable = function (currentWindow, currentDocument, x, y) {
        var curDocument = currentDocument || document;
        currentWindow   = currentWindow || window;

        var lastCursorPosition = null,
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
                }).bind(browserUtils.hasTouchEvents ? 'touchstart' : 'mousedown', function (e) {
                    lastCursorPosition = browserUtils.hasTouchEvents ? {
                        x: e.originalEvent.targetTouches[0].pageX || e.originalEvent.touches[0].pageX,
                        y: e.originalEvent.targetTouches[0].pageY || e.originalEvent.touches[0].pageY
                    } : {
                        x: e.clientX,
                        y: e.clientY
                    };
                    $(this).data('dragStarted', true);
                })

                .bind(browserUtils.hasTouchEvents ? 'touchend' : 'mouseup', function () {
                    lastCursorPosition = null;
                    $(this).data('dragStarted', false);
                })
                .appendTo($(curDocument).find('body'));

        $(curDocument).bind(browserUtils.hasTouchEvents ? 'touchmove' : 'mousemove', function (e) {
            var curMousePos    = browserUtils.hasTouchEvents ? {
                x: e.originalEvent.targetTouches[0].pageX || e.originalEvent.touches[0].pageX,
                y: e.originalEvent.targetTouches[0].pageY || e.originalEvent.touches[0].pageY
            } : {
                x: e.clientX,
                y: e.clientY
            };
            $.each($draggable, function () {
                var $this = $(this);
                if ($(this).data('dragStarted')) {

                    $this.css({
                        left: Math.round($this.position().left) + curMousePos.x - lastCursorPosition.x,
                        top:  Math.round($this.position().top) + curMousePos.y - lastCursorPosition.y
                    });
                    return false;
                }
            });
            lastCursorPosition = curMousePos;
        });

        var $window       = $(currentWindow),
            windowScrollX = 0,
            windowScrollY = 0;


        $window.scroll(function () {
            var x         = $window.scrollLeft() - windowScrollX,
                y         = $window.scrollTop() - windowScrollY;
            windowScrollX = $window.scrollLeft();
            windowScrollY = $window.scrollTop();

            if ($draggable.data('dragStarted')) {
                $draggable.css({
                    left: $draggable.position().left + x,
                    top:  $draggable.position().top + y
                });
            }
        });

        return $draggable;
    };

    var runHoverAutomation = function (element, callback) {
        var hoverOptions = new MouseOptions();
        var offsets      = mouseUtils.getOffsetOptions(element);

        hoverOptions.offsetX = offsets.offsetX;
        hoverOptions.offsetY = offsets.offsetY;

        var hoverAutomation = new HoverAutomation(element, hoverOptions);

        hoverAutomation
            .run()
            .then(callback);
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

    QUnit.testDone(function () {
        if (!browserUtils.isIE)
            removeTestElements();
    });

    module('regression tests');

    if (browserUtils.isIE)
        asyncTest('click on submit button child (B236676)', function () {
            var $form         = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
                $button       = $('<button></button>').attr('type', 'submit').addClass(TEST_ELEMENT_CLASS).appendTo($form),
                $img          = $('<img />').attr('alt', 'img').addClass(TEST_ELEMENT_CLASS).appendTo($button),
                imgClicked    = false,
                buttonClicked = false,
                formSubmitted = false;

            $form.submit(function (ev) {
                formSubmitted = true;
                eventUtils.preventDefault(ev);
                return false;
            });

            $button.click(function () {
                buttonClicked = true;
            });

            $img.click(function () {
                imgClicked = true;
            });

            clickPlaybackAutomation($img[0], {}, function () {

                //in IE submit button's children do not receive click event if user clicks on it
                ok(formSubmitted, 'form submit received');
                ok(buttonClicked, 'button click received');
                ok(!imgClicked, 'img click not received');

                formSubmitted = buttonClicked = imgClicked = false;

                clickPlaybackAutomation($button[0], {
                    offsetX: Math.round($button[0].offsetWidth / 2),
                    offsetY: Math.round($button[0].offsetHeight / 2)
                }, function () {
                    ok(formSubmitted, 'form submit received');
                    ok(buttonClicked, 'button click received');
                    ok(!imgClicked, 'img click not received');
                    startNext();
                });
            });
        });

    if (!browserUtils.hasTouchEvents) {
        asyncTest('B236966 - TESTCafe - onmouseout event is not called during the execution of the method hover.', function () {
            var $element   = createDraggable(window, document, 200, 200),
                firstEvent = null;

            $element.bind('mouseover', function () {
                if (!firstEvent)
                    firstEvent = 'mouseover';
            });

            $element.bind('mousemove', function () {
                if (!firstEvent)
                    firstEvent = 'mousemove';
            });

            runHoverAutomation($element[0], function () {
                equal(firstEvent, browserUtils.isIE ? 'mousemove' : 'mouseover');
                startNext();
            });
        });
    }

    asyncTest('B237084 - Client instance works incorrect after "enter" key has been pressed on the focused control', function () {
        var getSrcElement = function (ev) {
            return ev.srcElement || ev.target;
        };

        var button1                          = createButton()[0],
            button2                          = createButton()[0],

            documentClickFirstHandlerRaised  = false,
            documentClickSecondHandlerRaised = false,
            button2ClickHandlerRaised        = false;

        document.addEventListener('click', function (ev) {
            if (getSrcElement(ev) === button1) {
                documentClickFirstHandlerRaised = true;
                button2.click();
            }
        });

        document.addEventListener('click', function (ev) {
            if (getSrcElement(ev) === button1)
                documentClickSecondHandlerRaised = true;
        });

        button2.addEventListener('click', function () {
            button2ClickHandlerRaised = true;
        });

        clickPlaybackAutomation(button1, {}, function () {
            ok(documentClickFirstHandlerRaised);
            ok(documentClickSecondHandlerRaised);
            ok(button2ClickHandlerRaised);

            startNext();
        });
    });

    asyncTest('B237672 - TesCafe throw exception "Access is denied" after trying to get content of iframe in IE browsers', function () {
        var clicked = false,
            $iframe = $('<iframe></iframe>')
                .width(500)
                .height(500)
                .attr('src', 'http://www.cross.domain.com')
                .addClass(TEST_ELEMENT_CLASS)
                .click(function () {
                    clicked = true;
                });

        window.QUnitGlobals.waitForIframe($iframe[0]).then(function () {
            try {
                //NOTE: for not ie
                var iframeBody = $iframe[0].contentWindow.document;
                nativeMethods.addEventListener.call(iframeBody, 'click', function () {
                    clicked = true;
                });
            }
            catch (e) {
            }

            clickPlaybackAutomation($iframe[0], {}, function () {
                ok(clicked, 'click was raised');
                startNext();
            });
        });

        $iframe.appendTo('body');
    });

    asyncTest('B237862 - Test runner - the type action does not consider maxLength of the input element.', function () {
        var initText     = 'init',
            newText      = 'newnewnew',
            $input       = createInput().attr('value', initText),
            input        = $input[0],
            resultString = initText + newText,
            maxLength    = 7;

        $input.attr('maxLength', maxLength);
        equal(parseInt($input.attr('maxLength')), 7);
        input.focus();

        typePlaybackAutomation(input, newText, {
            caretPos: input.value.length
        }, function () {
            equal(input.value, resultString.substring(0, maxLength));
            startNext();
        });
    });

    if (!browserUtils.isIE) {
        //TODO: IE wrong detection dimension top for element if this element have height more than scrollable container
        //and element's top less than container top
        asyncTest('B237890 - Wrong scroll before second click on big element in scrollable container', function () {
            var clickCount           = 0,
                errorScroll          = false,

                $scrollableContainer = $('<div />')
                    .css({
                        position: 'absolute',
                        left:     '200px',
                        top:      '250px',
                        border:   '1px solid black',
                        overflow: 'scroll'
                    })
                    .width(250)
                    .height(200)
                    .addClass(TEST_ELEMENT_CLASS)
                    .appendTo($('body')[0]);

            $('<div></div>').addClass(TEST_ELEMENT_CLASS)
                .css({
                    height:          '20px',
                    width:           '20px',
                    marginTop:       2350 + 'px',
                    backgroundColor: '#ffff00'
                })
                .appendTo($scrollableContainer);

            var scrollHandler        = function () {
                    if (clickCount === 1)
                        errorScroll = true;
                },
                bindScrollHandlers   = function () {
                    $scrollableContainer.bind('scroll', scrollHandler);
                    $(window).bind('scroll', scrollHandler);
                },
                unbindScrollHandlers = function () {
                    $scrollableContainer.unbind('scroll', scrollHandler);
                    $(window).unbind('scroll', scrollHandler);
                };


            var $element = $('<div></div>')
                .addClass(TEST_ELEMENT_CLASS)
                .css({
                    width:           '150px',
                    height:          '400px',
                    position:        'absolute',
                    backgroundColor: 'red',
                    left:            '50px',
                    top:             '350px'
                })
                .appendTo($scrollableContainer)
                .bind('mousedown', function () {
                    unbindScrollHandlers();
                })
                .bind('click', function () {
                    clickCount++;

                });

            bindScrollHandlers();

            clickPlaybackAutomation($element[0], {}, function () {
                equal(clickCount, 1);
                bindScrollHandlers();

                clickPlaybackAutomation($element[0], {}, function () {
                    equal(clickCount, 2);
                    ok(!errorScroll);
                    startNext();
                });
            });
        });
    }

    asyncTest('B237763 - ASPxPageControl - Lite render - Tabs are not clicked in Firefox', function () {
        var clickRaised = false,
            $list       = $('<div></div>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $b          = $('<b></b>').html('text').appendTo($list);

        $list[0].onclick = function () {
            clickRaised = true;
        };

        clickPlaybackAutomation($b[0], {}, function () {
            ok(clickRaised);
            startNext();
        });
    });

    asyncTest('Click on label with for attribute', function () {
        var $input = $('<input type="checkbox"/>').addClass(TEST_ELEMENT_CLASS).attr('id', 'test123').appendTo('body'),
            $label = $('<label>label</label>').addClass(TEST_ELEMENT_CLASS).attr('for', 'test123').appendTo('body');

        $input[0].checked = false;

        clickPlaybackAutomation($label[0], {}, function () {
            ok($input[0].checked);
            startNext();
        });
    });

    asyncTest('Q518957 - Test is inactive with mouse clicks and date-en-gb.js is included', function () {
        var savedDateNow = window.Date;

        window.Date.now = function () {
            return {};
        };

        var $input    = $('<input type="button" />').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            completed = false;

        runHoverAutomation($input[0], function () {
            if (!completed) {
                completed   = true;
                ok('test success');
                window.Date = savedDateNow;
                startNext();
            }
        });

        window.setTimeout(function () {
            if (!completed) {
                completed       = true;
                ok(false, 'timeout expired');
                window.Date.now = savedDateNow;
                startNext();
            }
        }, 2000);
    });

    asyncTest('B238560 - Change event is not raised during TestCafe test running', function () {
        var $input       = $('<input type="checkbox" />').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            changeRaised = false;

        $input[0].addEventListener('change', function () {
            changeRaised = true;
        });

        clickPlaybackAutomation($input[0], {}, function () {
            ok(changeRaised);
            startNext();
        });
    });

    asyncTest('B252929 - Wrong behavior during recording dblclick on input', function () {
        var $input        = createInput(),
            dblclickCount = 0,
            clickCount    = 0;

        $input[0].value = 'Test cafe';

        $input.dblclick(function () {
            dblclickCount++;
        });

        $input.click(function () {
            clickCount++;
        });

        dblClickPlaybackAutomation($input[0], {
            caretPos: 3
        }, function () {
            equal($input[0].selectionStart, 3, 'start selection correct');
            equal($input[0].selectionEnd, 3, 'end selection correct');
            equal(clickCount, 2);
            equal(dblclickCount, 1);
            startNext();
        });
    });

    asyncTest('B253465 - Incorrect behavior when a math function is typed in ASPxSpreadsheet\'s cell', function () {
        var ROUND_BRACKET_KEY_CODE  = 57,
            ROUND_BRACKET_CHAR_CODE = 40;

        function checkKeyCode (e) {
            equal(e.keyCode, ROUND_BRACKET_KEY_CODE);
        }

        function checkCharCode (e) {
            equal(e.keyCode, ROUND_BRACKET_CHAR_CODE);
        }

        var $input = createInput().keydown(checkKeyCode).keypress(checkCharCode).keyup(checkKeyCode);

        typePlaybackAutomation($input[0], '(', {}, function () {
            startNext();
        });

        expect(3);
    });

    asyncTest('B254013 - act.type does not type points on ios6 device.', function () {
        var numberInput = $('<input type="number" />').attr('step', '0.1').addClass(TEST_ELEMENT_CLASS).appendTo('body')[0];

        typePlaybackAutomation(numberInput, '1000.5', {}, function () {
            equal(numberInput.value, 1000.5);
            startNext();
        });

        expect(1);
    });

    asyncTest('B254340 - click on input with type="number"', function () {
        var $input     = createInput('number'),
            caretPos   = 2,
            clickCount = 0;

        $input[0].value = '123';

        $input.click(function () {
            clickCount++;
        });

        clickPlaybackAutomation($input[0], {
            caretPos: caretPos
        }, function () {
            equal(textSelection.getSelectionStart($input[0]), caretPos, 'start selection correct');
            equal(textSelection.getSelectionEnd($input[0]), caretPos, 'end selection correct');
            equal(clickCount, 1);
            startNext();
        });
    });

    asyncTest('B254020 - act.type in input type="number" does not type sometimes to input on motorolla Xoom pad.', function () {
        var caretPos = 0,
            newText  = '1000.5',

            $input   = createInput('number')
                .attr('placeholder', 'Type here...')
                .attr('step', '0.1')
                .css('-webkit-user-modify', 'read-write-plaintext-only');

        typePlaybackAutomation($input[0], newText, {
            caretPos: caretPos
        }, function () {
            equal($input[0].value, newText);
            equal(textSelection.getSelectionStart($input[0]), caretPos + newText.length, 'start selection correct');
            equal(textSelection.getSelectionEnd($input[0]), caretPos + newText.length, 'end selection correct');

            startNext();
        });
    });

    //T101195 - Recording crashed after action with input type = "number" recorded in FF 29
    if (!browserUtils.isFirefox) {
        asyncTest('B254340 - type letters in input with type="number"', function () {
            var initText = '12345',
                newText  = 'aaa',
                $input   = createInput('number').attr('value', initText),
                caretPos = 3;

            typePlaybackAutomation($input[0], 'aaa', {
                caretPos: caretPos
            }, function () {
                //NOTE: when we try to set value with letters for 'input type = number' we get input.value = '' (may be we'll fix it in the future)
                if (browserUtils.isWebKit || (browserUtils.isIE && browserUtils.version > 11)) {
                    equal($input[0].value, '');
                    equal(textSelection.getSelectionStart($input[0]), 0, 'start selection correct');
                    equal(textSelection.getSelectionEnd($input[0]), 0, 'end selection correct');
                }
                else {
                    equal($input[0].value, initText.substring(0, caretPos) + newText + initText.substring(caretPos));
                    equal(textSelection.getSelectionStart($input[0]), caretPos +
                                                                      newText.length, 'start selection correct');
                    equal(textSelection.getSelectionEnd($input[0]), caretPos + newText.length, 'end selection correct');
                }
                startNext();
            });
        });

        asyncTest('B254340 - select in input with type="number"', function () {
            var initText = '12345678987654321',
                $input   = createInput('number').attr('value', initText),
                startPos = 5,
                endPos   = 11,
                backward = true;

            var selectOptions = new SelectOptions();

            selectOptions.startPos = endPos;
            selectOptions.endPos   = startPos;

            var selectAutomation = new SelectAutomation($input[0], selectOptions);

            selectAutomation
                .run()
                .then(function () {
                    equal(textSelection.getSelectionStart($input[0]), startPos, 'start selection correct');
                    equal(textSelection.getSelectionEnd($input[0]), endPos, 'end selection correct');
                    equal(textSelection.hasInverseSelection($input[0]), backward, 'selection direction correct');
                    startNext();
                });
        });
    }

    asyncTest('B254340 - type in input with type="email"', function () {
        var initText     = 'support@devexpress.com',
            newText      = 'new',
            $input       = createInput('email').attr('value', initText),
            caretPos     = 5,
            resultString = initText.substring(0, caretPos) + newText + initText.substring(caretPos);

        typePlaybackAutomation($input[0], newText, {
            caretPos: caretPos
        }, function () {
            equal($input[0].value, resultString);
            equal(textSelection.getSelectionStart($input[0]), caretPos + newText.length, 'start selection correct');
            equal(textSelection.getSelectionEnd($input[0]), caretPos + newText.length, 'end selection correct');
            startNext();
        });
    });

    if (browserUtils.isIE) {
        //TODO: fix it for other browsers
        asyncTest('Unexpected focus events are raised during click', function () {
            var input1FocusCount = 0,
                input2FocusCount = 0,
                $input1          = createInput().attr('id', '1').focus(function () {
                    input1FocusCount++;
                }),
                $input2          = createInput().attr('id', '2').focus(function () {
                    input2FocusCount++;
                    $input1[0].focus();
                });

            clickPlaybackAutomation($input2[0], {}, function () {
                equal(input1FocusCount, 1);
                equal(input2FocusCount, 1);

                startNext();
            });
        });

        asyncTest('Unexpected focus events are raised during dblclick', function () {
            var input1FocusCount = 0,
                input2FocusCount = 0,
                $input1          = createInput().attr('id', '1').focus(function () {
                    input1FocusCount++;
                }),
                $input2          = createInput().attr('id', '2').focus(function () {
                    input2FocusCount++;
                    $input1[0].focus();
                });

            dblClickPlaybackAutomation($input2[0], {}, function () {
                equal(input1FocusCount, browserUtils.isIE ? 1 : 2);
                equal(input2FocusCount, browserUtils.isIE ? 1 : 2);

                startNext();
            });
        });
    }

    if (browserUtils.isIE && browserUtils.version > 9) {
        asyncTest('T109295 - User action act.click isn\'t raised by click on map', function () {
            var initText = 'click',
                $input   = createInput('button').attr('value', initText).css({
                    position: 'absolute',
                    left:     '200px',
                    top:      '200px'
                }),
                log      = '',

                events   = {
                    mouse:    ['mouseover', 'mouseout', 'mousedown', 'mouseup', 'click'],
                    touch:    ['touchstart', 'touchend'],
                    pointer:  ['pointerover', 'pointerout', 'pointerdown', 'pointerup'],
                    MSevents: ['MSPointerOver', 'MSPointerOut', 'MSPointerDown', 'MSPointerUp']
                };

            var addListeners = function (el, events) {
                $.each(events, function (index, event) {
                    el.addEventListener(event, function (e) {
                        if (log !== '')
                            log = log + ', ';
                        log = log + e.type;
                    });
                });
            };

            addListeners($input[0], events.mouse);

            if (browserUtils.version > 10)
                addListeners($input[0], events.pointer);
            else
                addListeners($input[0], events.MSevents);


            clickPlaybackAutomation($input[0], {}, function () {
                if (browserUtils.version > 10)
                    equal(log, 'pointerover, mouseover, pointerdown, mousedown, pointerup, mouseup, click');
                else
                    equal(log, 'MSPointerOver, mouseover, MSPointerDown, mousedown, MSPointerUp, mouseup, click');
                startNext();
            });
        });
    }

    asyncTest('T133144 - Incorrect typing into an input with type "number" in FF during test executing (without caretPos)', function () {
        var initText = '12345',
            text     = '1000.5',
            newText  = initText + text,
            $input   = createInput('number').attr('value', initText).attr('step', '0.1');

        typePlaybackAutomation($input[0], text, {}, function () {
            equal($input[0].value, newText);

            equal(textSelection.getSelectionStart($input[0]), newText.length, 'start selection correct');
            equal(textSelection.getSelectionEnd($input[0]), newText.length, 'end selection correct');

            startNext();
        });
    });

    asyncTest('T133144 - Incorrect typing into an input with type "number" in FF during test executing (with caretPos)', function () {
        var initText = '12345',
            text     = '1000.5',
            $input   = createInput('number').attr('value', initText).attr('step', '0.1'),
            caretPos = 2;

        typePlaybackAutomation($input[0], text, {
            caretPos: caretPos
        }, function () {
            equal($input[0].value, initText.substring(0, caretPos) + text + initText.substring(caretPos));

            equal(textSelection.getSelectionStart($input[0]), caretPos + text.length, 'start selection correct');
            equal(textSelection.getSelectionEnd($input[0]), caretPos + text.length, 'end selection correct');

            startNext();
        });
    });

    asyncTest('T133144 - Incorrect typing into an input with type "number" in FF during test executing (with replace)', function () {
        var initText = '12345',
            text     = '-1000.5',
            $input   = createInput('number').attr('value', initText).attr('step', '0.1');

        $input.attr('min', '-5000');
        $input.attr('max', '5000');

        typePlaybackAutomation($input[0], text, {
            replace: true
        }, function () {
            equal($input[0].value, text);

            equal(textSelection.getSelectionStart($input[0]), text.length, 'start selection correct');
            equal(textSelection.getSelectionEnd($input[0]), text.length, 'end selection correct');

            startNext();
        });
    });

    asyncTest('T133144 - Incorrect typing into an input with type "number" in FF during test executing (press digits)', function () {
        var initText        = '1',
            text            = '1 2 3',
            newText         = '1123',
            $input          = createInput('number').attr('value', initText),
            pressAutomation = new PressAutomation(parseKeyString(text).combinations);

        clickPlaybackAutomation($input[0], {}, function () {
            equal(domUtils.getActiveElement(), $input[0]);

            pressAutomation
                .run()
                .then(function () {
                    equal($input[0].value, newText);

                    equal(textSelection.getSelectionStart($input[0]), newText.length, 'start selection correct');
                    equal(textSelection.getSelectionEnd($input[0]), newText.length, 'end selection correct');

                    startNext();
                });
        });
    });

    asyncTest('T235186 - Focus event handlers don\'t call for iframe\'s contenteditable body', function () {
        var focusEventCount = 0;
        var $iFrame         = $('<iframe></iframe>')
            .width(500)
            .height(500)
            .attr('src', window.QUnitGlobals.getResourceUrl('../../../data/focus-blur-change/iframe.html'))
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo('body');

        $iFrame.load(function () {
            var $iFrameBody = $($iFrame[0].contentWindow.document.body);

            $iFrameBody.attr('contenteditable', true);

            $iFrameBody.bind('focus', function () {
                focusEventCount++;
            });

            clickPlaybackAutomation($iFrameBody[0], {}, function () {
                equal(focusEventCount, 1);

                clickPlaybackAutomation($iFrameBody[0], {}, function () {
                    equal(focusEventCount, 1);
                    startNext();
                });
            });
        });
    });

    asyncTest('T286582 - A menu item has a hover state in jssite tests, but it is not hovered', function () {
        var style = [
            '<style>',
            'input {border-bottom-width: 0;}',
            'input:hover {border-bottom-width: 10px;}',
            '</style>'
        ].join('\n');

        $(style)
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo(body);

        var $input1 = createInput()
            .css('position', 'fixed')
            .css('margin-top', '50px')
            .appendTo(body);

        var $input2 = $input1
            .clone()
            .css('margin-left', '200px')
            .appendTo(body);

        clickPlaybackAutomation($input1[0], {}, function () {
            strictEqual($input1.css('border-bottom-width'), '10px');
            $input1.css('margin-top', '0px');
            clickPlaybackAutomation($input2[0], {}, function () {
                strictEqual($input1.css('border-bottom-width'), '0px');
                startNext();
            })
        })
    });
});
