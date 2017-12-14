var hammerhead       = window.getTestCafeModule('hammerhead');
var browserUtils     = hammerhead.utils.browser;
var featureDetection = hammerhead.utils.featureDetection;
var nativeMethods    = hammerhead.nativeMethods;

var testCafeCore     = window.getTestCafeModule('testCafeCore');
var eventUtils       = testCafeCore.get('./utils/event');
var positionUtils    = testCafeCore.get('./utils/position');
var textSelection    = testCafeCore.get('./utils/text-selection');
var parseKeySequence = testCafeCore.get('./utils/parse-key-sequence');

var testCafeAutomation = window.getTestCafeModule('testCafeAutomation');

var ClickOptions = testCafeAutomation.get('../../test-run/commands/options').ClickOptions;
var TypeOptions  = testCafeAutomation.get('../../test-run/commands/options').TypeOptions;
var MouseOptions = testCafeAutomation.get('../../test-run/commands/options').MouseOptions;

var ClickAutomation      = testCafeAutomation.Click;
var DblClickAutomation   = testCafeAutomation.DblClick;
var HoverAutomation      = testCafeAutomation.Hover;
var TypeAutomation       = testCafeAutomation.Type;
var SelectTextAutomation = testCafeAutomation.SelectText;
var PressAutomation      = testCafeAutomation.Press;
var getOffsetOptions     = testCafeAutomation.getOffsetOptions;

testCafeCore.preventRealEvents();

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

    var createDraggable = function (currentWindow, currentDocument, left, top) {
        var curDocument = currentDocument || document;

        currentWindow = currentWindow || window;

        var lastCursorPosition = null;

        var $draggable = $('<div></div>')
            .attr('id', 'draggable')
            .addClass(TEST_ELEMENT_CLASS)
            .css({
                width:           '60px',
                height:          '60px',
                position:        'absolute',
                backgroundColor: 'grey',
                left:            left ? left + 'px' : '100px',
                top:             top ? top + 'px' : '850px',
                zIndex:          5
            })
            .bind(featureDetection.isTouchDevice ? 'touchstart' : 'mousedown', function (e) {
                lastCursorPosition = featureDetection.isTouchDevice ? {
                    x: e.originalEvent.targetTouches[0].pageX || e.originalEvent.touches[0].pageX,
                    y: e.originalEvent.targetTouches[0].pageY || e.originalEvent.touches[0].pageY
                } : {
                    x: e.clientX,
                    y: e.clientY
                };
                $(this).data('dragStarted', true);
            })
            .bind(featureDetection.isTouchDevice ? 'touchend' : 'mouseup', function () {
                lastCursorPosition = null;
                $(this).data('dragStarted', false);
            })
            .appendTo($(curDocument).find('body'));

        $(curDocument).bind(featureDetection.isTouchDevice ? 'touchmove' : 'mousemove', function (e) {
            var curMousePos = featureDetection.isTouchDevice ? {
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

                return true;
            });

            lastCursorPosition = curMousePos;
        });

        var $window       = $(currentWindow);
        var windowScrollX = 0;
        var windowScrollY = 0;


        $window.scroll(function () {
            var x = $window.scrollLeft() - windowScrollX;
            var y = $window.scrollTop() - windowScrollY;

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

    var runHoverAutomation = function (element, callback) {
        var offsets      = getOffsetOptions(element);
        var hoverOptions = new MouseOptions({
            offsetX: offsets.offsetX,
            offsetY: offsets.offsetY
        });

        var hoverAutomation = new HoverAutomation(element, hoverOptions);

        hoverAutomation
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

    var runDblClickAutomation = function (el, options, callback) {
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

        var dblClickAutomation = new DblClickAutomation(el, clickOptions);

        dblClickAutomation
            .run()
            .then(callback);
    };

    var runTypeAutomation = function (element, text, options) {
        var offsets     = getOffsetOptions(element);
        var typeOptions = new TypeOptions({
            caretPos: options.caretPos,
            replace:  options.replace,
            paste:    options.paste,
            offsetX:  offsets.offsetX,
            offsetY:  offsets.offsetY
        });

        var typeAutomation = new TypeAutomation(element, text, typeOptions);

        return typeAutomation.run();
    };

    QUnit.testDone(function () {
        if (!browserUtils.isIE)
            removeTestElements();
    });

    module('regression tests');

    if (browserUtils.isIE) {
        asyncTest('click on submit button child (B236676)', function () {
            var $form         = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
            var $button       = $('<button></button>').attr('type', 'submit').addClass(TEST_ELEMENT_CLASS).appendTo($form);
            var $img          = $('<img />').attr('alt', 'img').addClass(TEST_ELEMENT_CLASS).appendTo($button);
            var imgClicked    = false;
            var buttonClicked = false;
            var formSubmitted = false;

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

            runClickAutomation($img[0], {}, function () {

                //in IE submit button's children do not receive click event if user clicks on it
                ok(formSubmitted, 'form submit received');
                ok(buttonClicked, 'button click received');
                ok(!imgClicked, 'img click not received');

                formSubmitted = buttonClicked = imgClicked = false;

                runClickAutomation($button[0], {
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
    }

    if (!featureDetection.isTouchDevice) {
        asyncTest('B236966 - TESTCafe - onmouseout event is not called during the execution of the method hover.', function () {
            var $element   = createDraggable(window, document, 200, 200);
            var firstEvent = null;

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

        var button1 = createButton()[0];
        var button2 = createButton()[0];

        var documentClickFirstHandlerRaised  = false;
        var documentClickSecondHandlerRaised = false;
        var button2ClickHandlerRaised        = false;

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

        runClickAutomation(button1, {}, function () {
            ok(documentClickFirstHandlerRaised);
            ok(documentClickSecondHandlerRaised);
            ok(button2ClickHandlerRaised);

            startNext();
        });
    });

    asyncTest('B237672 - TesCafe throw exception "Access is denied" after trying to get content of iframe in IE browsers', function () {
        var clicked = false;
        var $iframe = $('<iframe></iframe>')
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
                // do nothing
            }

            runClickAutomation($iframe[0], {}, function () {
                ok(clicked, 'click was raised');
                startNext();
            });
        });

        $iframe.appendTo('body');
    });

    asyncTest('B237862 - Test runner - the type action does not consider maxLength of the input element.', function () {
        var initText     = 'init';
        var newText      = 'newnewnew';
        var $input       = createInput().attr('value', initText);
        var input        = $input[0];
        var resultString = initText + newText;
        var maxLength    = 7;

        $input.attr('maxLength', maxLength);
        equal(parseInt($input.attr('maxLength'), 10), 7);
        input.focus();

        runTypeAutomation(input, newText, {
            caretPos: input.value.length
        })
            .then(function () {
                equal(input.value, resultString.substring(0, maxLength));
                startNext();
            });
    });

    if (!browserUtils.isIE) {
        //TODO: IE wrong detection dimension top for element if this element have height more than scrollable container
        //and element's top less than container top
        asyncTest('B237890 - Wrong scroll before second click on big element in scrollable container', function () {
            var clickCount  = 0;
            var errorScroll = false;

            var $scrollableContainer = $('<div />')
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
                .appendTo(body);

            $('<div></div>').addClass(TEST_ELEMENT_CLASS)
                .css({
                    height:          '20px',
                    width:           '20px',
                    marginTop:       2350 + 'px',
                    backgroundColor: '#ffff00'
                })
                .appendTo($scrollableContainer);

            $('<div></div>').addClass(TEST_ELEMENT_CLASS)
                .css({
                    position: 'absolute',
                    height:   '20px',
                    width:    '20px',
                    left:     '600px'
                })
                .appendTo(body);

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

            runClickAutomation($element[0], {}, function () {
                equal(clickCount, 1);
                bindScrollHandlers();

                runClickAutomation($element[0], {}, function () {
                    equal(clickCount, 2);
                    ok(!errorScroll);
                    startNext();
                });
            });
        });
    }

    asyncTest('B237763 - ASPxPageControl - Lite render - Tabs are not clicked in Firefox', function () {
        var clickRaised = false;
        var $list       = $('<div></div>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $b          = $('<b></b>').html('text').appendTo($list);

        $list[0].onclick = function () {
            clickRaised = true;
        };

        runClickAutomation($b[0], {}, function () {
            ok(clickRaised);
            startNext();
        });
    });

    asyncTest('Click on label with for attribute', function () {
        var $input = $('<input type="checkbox"/>').addClass(TEST_ELEMENT_CLASS).attr('id', 'test123').appendTo('body');
        var $label = $('<label>label</label>').addClass(TEST_ELEMENT_CLASS).attr('for', 'test123').appendTo('body');

        $input[0].checked = false;

        runClickAutomation($label[0], {}, function () {
            ok($input[0].checked);
            startNext();
        });
    });

    asyncTest('Q518957 - Test is inactive with mouse clicks and date-en-gb.js is included', function () {
        var savedDateNow = window.Date;

        window.Date.now = function () {
            return {};
        };

        var $input    = $('<input type="button" />').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var completed = false;

        runHoverAutomation($input[0], function () {
            if (!completed) {
                completed = true;
                ok('test success');
                window.Date = savedDateNow;
                startNext();
            }
        });

        window.setTimeout(function () {
            if (!completed) {
                completed = true;
                ok(false, 'timeout expired');
                window.Date.now = savedDateNow;
                startNext();
            }
        }, 2000);
    });

    asyncTest('B238560 - Change event is not raised during TestCafe test running', function () {
        var $input       = $('<input type="checkbox" />').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var changeRaised = false;

        $input[0].addEventListener('change', function () {
            changeRaised = true;
        });

        runClickAutomation($input[0], {}, function () {
            ok(changeRaised);
            startNext();
        });
    });

    asyncTest('B252929 - Wrong behavior during recording dblclick on input', function () {
        var $input        = createInput();
        var dblclickCount = 0;
        var clickCount    = 0;

        $input[0].value = 'Test cafe';

        $input.dblclick(function () {
            dblclickCount++;
        });

        $input.click(function () {
            clickCount++;
        });

        runDblClickAutomation($input[0], {
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
        var ROUND_BRACKET_KEY_CODE  = 57;
        var ROUND_BRACKET_CHAR_CODE = 40;

        function checkKeyCode (e) {
            equal(e.keyCode, ROUND_BRACKET_KEY_CODE);
        }

        function checkCharCode (e) {
            equal(e.keyCode, ROUND_BRACKET_CHAR_CODE);
        }

        var $input = createInput().keydown(checkKeyCode).keypress(checkCharCode).keyup(checkKeyCode);

        runTypeAutomation($input[0], '(', {})
            .then(function () {
                startNext();
            });

        expect(3);
    });

    asyncTest('B254340 - type in input with type="email"', function () {
        var initText     = 'support@devexpress.com';
        var newText      = 'new';
        var $input       = createInput('email').attr('value', initText);
        var caretPos     = 5;
        var resultString = initText.substring(0, caretPos) + newText + initText.substring(caretPos);

        runTypeAutomation($input[0], newText, {
            caretPos: caretPos
        })
            .then(function () {
                equal($input[0].value, resultString);
                equal(textSelection.getSelectionStart($input[0]), caretPos + newText.length, 'start selection correct');
                equal(textSelection.getSelectionEnd($input[0]), caretPos + newText.length, 'end selection correct');
                startNext();
            });
    });

    if (browserUtils.isIE) {
        //TODO: fix it for other browsers
        asyncTest('Unexpected focus events are raised during click', function () {
            var input1FocusCount = 0;
            var input2FocusCount = 0;
            var $input1          = createInput().attr('id', '1').focus(function () {
                input1FocusCount++;
            });

            var $input2 = createInput().attr('id', '2').focus(function () {
                input2FocusCount++;
                $input1[0].focus();
            });

            runClickAutomation($input2[0], {}, function () {
                equal(input1FocusCount, 1);
                equal(input2FocusCount, 1);

                startNext();
            });
        });

        asyncTest('Unexpected focus events are raised during dblclick', function () {
            var input1FocusCount = 0;
            var input2FocusCount = 0;
            var $input1          = createInput().attr('id', '1').focus(function () {
                input1FocusCount++;
            });

            var $input2 = createInput().attr('id', '2').focus(function () {
                input2FocusCount++;
                $input1[0].focus();
            });

            runDblClickAutomation($input2[0], {}, function () {
                equal(input1FocusCount, browserUtils.isIE ? 1 : 2);
                equal(input2FocusCount, browserUtils.isIE ? 1 : 2);

                startNext();
            });
        });
    }

    if (browserUtils.isIE && browserUtils.version > 9) {
        asyncTest('T109295 - User action act.click isn\'t raised by click on map', function () {
            var initText = 'click';
            var $input   = createInput('button').attr('value', initText).css({
                position: 'absolute',
                left:     '200px',
                top:      '200px'
            });

            var log            = '';
            var listenedEvents = {
                mouse:    ['mouseover', 'mouseout', 'mousedown', 'mouseup', 'click'],
                touch:    ['touchstart', 'touchend'],
                pointer:  ['pointerover', 'pointerout', 'pointerdown', 'pointerup'],
                MSevents: ['MSPointerOver', 'MSPointerOut', 'MSPointerDown', 'MSPointerUp']
            };

            var addListeners = function (el, events) {
                $.each(events, function (index, event) {
                    el.addEventListener(event, function (e) {
                        if (log !== '')
                            log += ', ';

                        log += e.type;
                    });
                });
            };

            addListeners($input[0], listenedEvents.mouse);

            if (browserUtils.version > 10)
                addListeners($input[0], listenedEvents.pointer);
            else
                addListeners($input[0], listenedEvents.MSevents);

            runClickAutomation($input[0], {}, function () {
                if (browserUtils.version > 10)
                    equal(log, 'pointerover, mouseover, pointerdown, mousedown, pointerup, mouseup, click');
                else
                    equal(log, 'MSPointerOver, mouseover, MSPointerDown, mousedown, MSPointerUp, mouseup, click');
                startNext();
            });
        });
    }

    asyncTest('T286582 - A menu item has a hover state in jssite tests, but it is not hovered', function () {
        var style = [
            '<style>',
            'input {border-bottom-width: 0;}',
            'input:hover {border-bottom-width: 10px;}',
            '</style>'
        ].join('\n');

        // NOTE: we need to use a sandboxed jQuery to process the 'style' element content.
        // Since Hammerhead 8.0.0, proxying is performed on prototypes (instead of elements)
        var sandboxedJQuery = window.sandboxedJQuery.jQuery;

        sandboxedJQuery(style)
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

        runClickAutomation($input1[0], {}, function () {
            strictEqual($input1.css('border-bottom-width'), '10px');
            $input1.css('margin-top', '0px');

            runClickAutomation($input2[0], {}, function () {
                strictEqual($input1.css('border-bottom-width'), '0px');
                startNext();
            });
        });
    });

    asyncTest('B254020 - act.type in input type="number" does not type sometimes to input on motorolla Xoom pad.', function () {
        var newText = '123';
        var $input  = createInput()
            .attr('placeholder', 'Type here...')
            .css('-webkit-user-modify', 'read-write-plaintext-only');

        runTypeAutomation($input[0], newText, {})
            .then(function () {
                equal($input[0].value, newText);
                equal(textSelection.getSelectionStart($input[0]), newText.length, 'start selection correct');
                equal(textSelection.getSelectionEnd($input[0]), newText.length, 'end selection correct');
                startNext();
            });
    });

    module('regression tests with input type="number"');

    if (!browserUtils.isIE9) {
        asyncTest('B254340 - click on input with type="number"', function () {
            var $input     = createInput('number').val('123');
            var caretPos   = 2;
            var clickCount = 0;

            $input.click(function () {
                clickCount++;
            });

            runClickAutomation($input[0], {
                caretPos: caretPos
            }, function () {
                equal(textSelection.getSelectionStart($input[0]), caretPos, 'start selection correct');
                equal(textSelection.getSelectionEnd($input[0]), caretPos, 'end selection correct');
                equal(clickCount, 1);
                startNext();
            });
        });

        if (!browserUtils.isFirefox) {
            asyncTest('B254340 - select in input with type="number"', function () {
                var initText = '12345678987654321';
                var input    = createInput('number').attr('value', initText).val(initText)[0];
                var startPos = 5;
                var endPos   = 11;
                var backward = true;

                var selectTextAutomation = new SelectTextAutomation(input, endPos, startPos, {});

                selectTextAutomation
                    .run()
                    .then(function () {
                        equal(textSelection.getSelectionStart(input), startPos, 'start selection correct');
                        equal(textSelection.getSelectionEnd(input), endPos, 'end selection correct');
                        equal(textSelection.hasInverseSelection(input), backward, 'selection direction correct');

                        startNext();
                    });
            });
        }

        asyncTest('T133144 - Incorrect typing into an input with type "number" in FF during test executing (without caretPos)', function () {
            var initText = '12345';
            var text     = '123';
            var newText  = initText + text;
            var $input   = createInput('number').attr('value', initText);

            runTypeAutomation($input[0], text, {})
                .then(function () {
                    equal($input[0].value, newText);
                    equal(textSelection.getSelectionStart($input[0]), newText.length, 'start selection correct');
                    equal(textSelection.getSelectionEnd($input[0]), newText.length, 'end selection correct');

                    startNext();
                });
        });

        asyncTest('T133144 - Incorrect typing into an input with type "number" in FF during test executing (with caretPos)', function () {
            var initText = '12345';
            var text     = '123';
            var $input   = createInput('number').attr('value', initText);
            var caretPos = 2;

            runTypeAutomation($input[0], text, {
                caretPos: caretPos
            })
                .then(function () {
                    equal($input[0].value, initText.substring(0, caretPos) + text + initText.substring(caretPos));
                    equal(textSelection.getSelectionStart($input[0]), caretPos +
                                                                      text.length, 'start selection correct');

                    equal(textSelection.getSelectionEnd($input[0]), caretPos + text.length, 'end selection correct');

                    startNext();
                });
        });

        asyncTest('T133144 - Incorrect typing into an input with type "number" in FF during test executing (with replace)', function () {
            var initText = '12345';
            var text     = '678';
            var $input   = createInput('number').attr('value', initText);

            runTypeAutomation($input[0], text, {
                replace: true
            })
                .then(function () {
                    equal($input[0].value, text);
                    equal(textSelection.getSelectionStart($input[0]), text.length, 'start selection correct');
                    equal(textSelection.getSelectionEnd($input[0]), text.length, 'end selection correct');

                    startNext();
                });
        });

        asyncTest('T138385 - input type="number" leave out "maxlength" attribute (act.type)', function () {
            var $input          = createInput('number').attr('maxLength', 2);
            var inputEventCount = 0;

            $input.bind('input', function () {
                inputEventCount++;
            });

            runTypeAutomation($input[0], '123', {})
                .then(function () {
                    equal(inputEventCount, 3);
                    equal($input.val(), browserUtils.isIE ? '12' : '123');

                    startNext();
                });
        });

        asyncTest('T138385 - input type "number" leave out "maxlength" attribute (act.press)', function () {
            var $input          = createInput('number').attr('maxLength', 2);
            var inputEventCount = 0;
            var keySequence     = '1 2 3';
            var pressAutomation = new PressAutomation(parseKeySequence(keySequence).combinations, {});

            $input.bind('input', function () {
                inputEventCount++;
            });

            $input[0].focus();

            pressAutomation
                .run()
                .then(function () {
                    equal(inputEventCount, 3);
                    equal($input.val(), browserUtils.isIE ? '12' : '123');

                    startNext();
                });
        });

        asyncTest('B254340 - type letters in input with type="number" (symbol in start)', function () {
            var input = createInput('number')[0];

            runTypeAutomation(input, '+12', {})
                .then(function () {
                    equal(input.value, '12');
                    input.value = '';

                    return runTypeAutomation(input, '-12', {});
                })
                .then(function () {
                    equal(input.value, '-12');
                    input.value = '';

                    return runTypeAutomation(input, '.12', {});
                })
                .then(function () {
                    equal(input.value, '.12');
                    input.value = '';

                    return runTypeAutomation(input, '+-12', {});
                })
                .then(function () {
                    equal(input.value, '-12');
                    input.value = '';

                    return runTypeAutomation(input, 'a12', {});
                })
                .then(function () {
                    equal(input.value, '12');
                    input.value = '';

                    return runTypeAutomation(input, '$12', {});
                })
                .then(function () {
                    equal(input.value, '12');

                    startNext();
                });
        });

        asyncTest('B254340 - type letters in input with type="number" (symbol in the middle)', function () {
            var input = createInput('number')[0];

            runTypeAutomation(input, '1+2', {})
                .then(function () {
                    equal(input.value, '12');
                    input.value = '';

                    return runTypeAutomation(input, '1-2', {});
                })
                .then(function () {
                    equal(input.value, '12');
                    input.value = '';

                    return runTypeAutomation(input, '1.2', {});
                })
                .then(function () {
                    equal(input.value, '1.2');
                    input.value = '';

                    return runTypeAutomation(input, '1+-2', {});
                })
                .then(function () {
                    equal(input.value, '12');
                    input.value = '';

                    return runTypeAutomation(input, '1a2', {});
                })
                .then(function () {
                    equal(input.value, '12');
                    input.value = '';

                    return runTypeAutomation(input, '1$2', {});
                })
                .then(function () {
                    equal(input.value, '12');
                    document.body.removeChild(input);
                    startNext();
                });
        });

        asyncTest('B254340 - type letters in input with type="number" (symbol in the end)', function () {
            var input = createInput('number')[0];

            runTypeAutomation(input, '12+', {})
                .then(function () {
                    equal(input.value, '12');
                    input.value = '';

                    return runTypeAutomation(input, '12-', {});
                })
                .then(function () {
                    equal(input.value, '12');
                    input.value = '';

                    return runTypeAutomation(input, '12.', {});
                })
                .then(function () {
                    equal(input.value, '12');
                    input.value = '';

                    return runTypeAutomation(input, '12+-', {});
                })
                .then(function () {
                    equal(input.value, '12');
                    input.value = '';

                    return runTypeAutomation(input, '12a', {});
                })
                .then(function () {
                    equal(input.value, '12');
                    input.value = '';

                    return runTypeAutomation(input, '12$', {});
                })
                .then(function () {
                    equal(input.value, '12');
                    document.body.removeChild(input);

                    startNext();
                });
        });

        asyncTest('B254340 - type letters in input with type="number" (one symbol)', function () {
            var input = createInput('number').val('12')[0];

            runTypeAutomation(input, '+', { caretPos: 0 })
                .then(function () {
                    equal(input.value, '12');
                    input.value = '12';

                    return runTypeAutomation(input, '-', { caretPos: 0 });
                })
                .then(function () {
                    equal(input.value, '-12');
                    input.value = '12';

                    return runTypeAutomation(input, '.', { caretPos: 0 });
                })
                .then(function () {
                    equal(input.value, '.12');
                    input.value = '12';

                    return runTypeAutomation(input, '+-', { caretPos: 0 });
                })
                .then(function () {
                    equal(input.value, '-12');
                    input.value = '12';

                    return runTypeAutomation(input, '$', { caretPos: 0 });
                })
                .then(function () {
                    equal(input.value, '12');
                    input.value = '12';

                    return runTypeAutomation(input, '-12', { caretPos: 0 });
                })
                .then(function () {
                    equal(input.value, '-1212');
                    document.body.removeChild(input);

                    startNext();
                });
        });
    }

    test('Scrolling works wrong in specific scenario in IE (gh-2002)', function () {
        var mockParentDimension = {
            top:    0,
            bottom: 782,
            height: 782,
            left:   0,
            right:  1423,
            width:  1423,

            border: {
                top:    0,
                right:  0,
                bottom: 0,
                left:   0
            },

            scroll: {
                left: 0,
                top:  255
            },

            scrollbar: {
                bottom: 0,
                right:  0
            }
        };

        var mockChildDimension = {
            top:    3.91999983787566,
            bottom: 777.91999983787566,
            height: 774,
            left:   571.5,
            right:  991.5,
            width:  420,

            border: {
                top:    2,
                right:  2,
                bottom: 2,
                left:   2
            },

            scroll: {
                left: 0,
                top:  0
            },

            scrollbar: {
                bottom: 0,
                right:  0
            }
        };

        deepEqual(positionUtils.calcRelativePosition(mockChildDimension, mockParentDimension), {
            top:    4,
            right:  431,
            bottom: 4,
            left:   572
        });
    });
});
