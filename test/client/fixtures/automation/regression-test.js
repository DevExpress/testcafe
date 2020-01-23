const hammerhead       = window.getTestCafeModule('hammerhead');
const browserUtils     = hammerhead.utils.browser;
const featureDetection = hammerhead.utils.featureDetection;
const nativeMethods    = hammerhead.nativeMethods;
const Promise          = hammerhead.Promise;

const testCafeCore     = window.getTestCafeModule('testCafeCore');
const eventUtils       = testCafeCore.get('./utils/event');
const positionUtils    = testCafeCore.get('./utils/position');
const textSelection    = testCafeCore.get('./utils/text-selection');
const parseKeySequence = testCafeCore.get('./utils/parse-key-sequence');

const testCafeAutomation = window.getTestCafeModule('testCafeAutomation');

const ClickOptions = testCafeAutomation.get('../../test-run/commands/options').ClickOptions;
const TypeOptions  = testCafeAutomation.get('../../test-run/commands/options').TypeOptions;
const MouseOptions = testCafeAutomation.get('../../test-run/commands/options').MouseOptions;

const ClickAutomation      = testCafeAutomation.Click;
const RClickAutomation     = testCafeAutomation.RClick;
const DblClickAutomation   = testCafeAutomation.DblClick;
const HoverAutomation      = testCafeAutomation.Hover;
const TypeAutomation       = testCafeAutomation.Type;
const SelectTextAutomation = testCafeAutomation.SelectText;
const PressAutomation      = testCafeAutomation.Press;
const getOffsetOptions     = testCafeAutomation.getOffsetOptions;

testCafeCore.preventRealEvents();

$(document).ready(function () {
    //consts
    const TEST_ELEMENT_CLASS = 'testElement';

    //consts
    const body = $('body')[0];

    //utils
    const createInput = function (type) {
        return $('<input>')
            .attr('type', type || 'text')
            .attr('id', 'input')
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo('body');
    };

    const createButton = function () {
        return $('<input type="button">').addClass(TEST_ELEMENT_CLASS).appendTo('body');
    };

    $(body).css('height', 1500);
    //NOTE: problem with window.top bodyMargin in IE9 if test 'runAll'
    //because we can't determine that element is in qunit test iframe

    if (browserUtils.isIE9)
        $(window.top.document).find('body').css('marginTop', '0px');

    const createDraggable = function (currentWindow, currentDocument, left, top) {
        const curDocument = currentDocument || document;

        currentWindow = currentWindow || window;

        let lastCursorPosition = null;

        const $draggable = $('<div></div>')
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
            const curMousePos = featureDetection.isTouchDevice ? {
                x: e.originalEvent.targetTouches[0].pageX || e.originalEvent.touches[0].pageX,
                y: e.originalEvent.targetTouches[0].pageY || e.originalEvent.touches[0].pageY
            } : {
                x: e.clientX,
                y: e.clientY
            };

            $.each($draggable, function () {
                const $this = $(this);

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

        const $window = $(currentWindow);

        let windowScrollX = 0;
        let windowScrollY = 0;


        $window.scroll(function () {
            const x = $window.scrollLeft() - windowScrollX;
            const y = $window.scrollTop() - windowScrollY;

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

    const runHoverAutomation = function (element, callback) {
        const offsets      = getOffsetOptions(element);
        const hoverOptions = new MouseOptions({
            offsetX: offsets.offsetX,
            offsetY: offsets.offsetY
        });

        const hoverAutomation = new HoverAutomation(element, hoverOptions);

        hoverAutomation
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

    const runDblClickAutomation = function (el, options, callback) {
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

        const dblClickAutomation = new DblClickAutomation(el, clickOptions);

        dblClickAutomation
            .run()
            .then(callback);
    };

    const runTypeAutomation = function (element, text, options) {
        const offsets     = getOffsetOptions(element);
        const typeOptions = new TypeOptions({
            caretPos: options.caretPos,
            replace:  options.replace,
            paste:    options.paste,
            offsetX:  offsets.offsetX,
            offsetY:  offsets.offsetY
        });

        const typeAutomation = new TypeAutomation(element, text, typeOptions);

        return typeAutomation.run();
    };

    QUnit.testDone(function () {
        if (!browserUtils.isIE)
            removeTestElements();
    });

    module('regression tests');

    if (browserUtils.isIE) {
        asyncTest('click on submit button child (B236676)', function () {
            const $form         = $('<form></form>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
            const $button       = $('<button></button>').attr('type', 'submit').addClass(TEST_ELEMENT_CLASS).appendTo($form);
            const $img          = $('<img />').attr('alt', 'img').addClass(TEST_ELEMENT_CLASS).appendTo($button);

            let imgClicked    = false;
            let buttonClicked = false;
            let formSubmitted = false;

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
            const $element = createDraggable(window, document, 200, 200);

            let firstEvent = null;

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
        const getSrcElement = function (ev) {
            return ev.srcElement || ev.target;
        };

        const button1 = createButton()[0];
        const button2 = createButton()[0];

        let documentClickFirstHandlerRaised  = false;
        let documentClickSecondHandlerRaised = false;
        let button2ClickHandlerRaised        = false;

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

    asyncTest('B237672 - TesCafe should not throw an exception "Access is denied" on accessing to a content of the cross-domain iframe', function () {
        let result = false;

        const $iframe = $('<iframe></iframe>')
            .width(500)
            .height(500)
            .attr('src', 'http://www.cross.domain.com')
            .addClass(TEST_ELEMENT_CLASS);

        window.QUnitGlobals.waitForIframe($iframe[0]).then(function () {
            try {
                const iframeDocument = $iframe[0].contentWindow.document;

                nativeMethods.addEventListener.call(iframeDocument, 'click', function () {
                    throw new Error('Click handler on an iframe should not be called');
                });

                result = true;
            }
            catch (e) {
                result = false;
            }

            runClickAutomation($iframe[0], {}, function () {
                ok(result);
                startNext();
            });
        });

        $iframe.appendTo('body');
    });

    asyncTest('B237862 - Test runner - the type action does not consider maxLength of the input element.', function () {
        const initText     = 'init';
        const newText      = 'newnewnew';
        const $input       = createInput().attr('value', initText);
        const input        = $input[0];
        const resultString = initText + newText;
        const maxLength    = 7;

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
            let clickCount  = 0;
            let errorScroll = false;

            const $scrollableContainer = $('<div />')
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

            const $element = $('<div></div>')
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
        const $list       = $('<div></div>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $b          = $('<b></b>').html('text').appendTo($list);

        let clickRaised = false;


        $list[0].onclick = function () {
            clickRaised = true;
        };

        runClickAutomation($b[0], {}, function () {
            ok(clickRaised);
            startNext();
        });
    });

    asyncTest('Click on label with for attribute', function () {
        const $input = $('<input type="checkbox"/>').addClass(TEST_ELEMENT_CLASS).attr('id', 'test123').appendTo('body');
        const $label = $('<label>label</label>').addClass(TEST_ELEMENT_CLASS).attr('for', 'test123').appendTo('body');

        $input[0].checked = false;

        runClickAutomation($label[0], {}, function () {
            ok($input[0].checked);
            startNext();
        });
    });

    asyncTest('Q518957 - Test is inactive with mouse clicks and date-en-gb.js is included', function () {
        const savedDateNow = window.Date;

        window.Date.now = function () {
            return {};
        };

        const $input = $('<input type="button" />').addClass(TEST_ELEMENT_CLASS).appendTo('body');

        let completed = false;

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
        const $input = $('<input type="checkbox" />').addClass(TEST_ELEMENT_CLASS).appendTo('body');

        let changeRaised = false;

        $input[0].addEventListener('change', function () {
            changeRaised = true;
        });

        runClickAutomation($input[0], {}, function () {
            ok(changeRaised);
            startNext();
        });
    });

    asyncTest('B252929 - Wrong behavior during recording dblclick on input', function () {
        const $input = createInput();

        let dblclickCount = 0;
        let clickCount    = 0;

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
        const ROUND_BRACKET_KEY_CODE  = 57;
        const ROUND_BRACKET_CHAR_CODE = 40;

        function checkKeyCode (e) {
            equal(e.keyCode, ROUND_BRACKET_KEY_CODE);
        }

        function checkCharCode (e) {
            equal(e.keyCode, ROUND_BRACKET_CHAR_CODE);
        }

        const $input = createInput().keydown(checkKeyCode).keypress(checkCharCode).keyup(checkKeyCode);

        runTypeAutomation($input[0], '(', {})
            .then(function () {
                startNext();
            });

        const expectedAssertionCount = browserUtils.isAndroid ? 2 : 3;

        expect(expectedAssertionCount);
    });

    asyncTest('B254340 - type in input with type="email"', function () {
        const initText     = 'support@devexpress.com';
        const newText      = 'new';
        const $input       = createInput('email').attr('value', initText);
        const caretPos     = 5;
        const resultString = initText.substring(0, caretPos) + newText + initText.substring(caretPos);

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

    if (!browserUtils.isIOS && !browserUtils.isAndroid) {
        asyncTest('GH-2325 - mouse events should have e.screenX and e.screenY properties', function () {
            const promises   = [];
            const screenLeft = window.screenLeft || window.screenX;
            const screenTop  = window.screenTop || window.screenY;
            const el         = document.createElement('div');
            const mouseOutEl = document.createElement('div');

            el.innerHTML         = 'Click me';
            el.className         = TEST_ELEMENT_CLASS;
            mouseOutEl.innerHTML = 'Hover me';
            mouseOutEl.className = TEST_ELEMENT_CLASS;

            document.body.appendChild(el);
            document.body.appendChild(mouseOutEl);

            const checkEventScreenXYOptions = function (eventName) {
                let resolveFn;

                promises.push(new Promise(function (resolve) {
                    resolveFn = resolve;
                }));

                const handler = function (e) {
                    ok(e.screenX > 0);
                    ok(e.screenY > 0);
                    equal(e.screenX, e.clientX + screenLeft);
                    equal(e.screenY, e.clientY + screenTop);

                    resolveFn();
                    el.removeEventListener(eventName, handler);
                };

                return handler;
            };

            const addEventListener = function (eventName) {
                el.addEventListener(eventName, checkEventScreenXYOptions(eventName));
            };

            addEventListener('mousemove');
            addEventListener('mouseenter');
            addEventListener('mouseover');
            addEventListener('mousedown');
            addEventListener('mouseup');
            addEventListener('click');
            addEventListener('mouseout');
            addEventListener('mouseleave');
            addEventListener('contextmenu');
            addEventListener('dblclick');

            const click    = new ClickAutomation(el, { offsetX: 5, offsetY: 5 });
            const rClick   = new RClickAutomation(el, { offsetX: 5, offsetY: 5 });
            const dblClick = new DblClickAutomation(el, { offsetX: 5, offsetY: 5 });
            const mouseOut = new ClickAutomation(mouseOutEl, { offsetX: 5, offsetY: 5 });

            click.run()
                .then(function () {
                    return mouseOut.run();
                })
                .then(function () {
                    return rClick.run();
                })
                .then(function () {
                    return dblClick.run();
                })
                .then(function () {
                    Promise.all(promises).then(function () {
                        startNext();
                    });
                });
        });
    }

    if (browserUtils.isIE) {
        //TODO: fix it for other browsers
        asyncTest('Unexpected focus events are raised during click', function () {
            let input1FocusCount = 0;
            let input2FocusCount = 0;

            const $input1 = createInput().attr('id', '1').focus(function () {
                input1FocusCount++;
            });

            const $input2 = createInput().attr('id', '2').focus(function () {
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
            let input1FocusCount = 0;
            let input2FocusCount = 0;

            const $input1 = createInput().attr('id', '1').focus(function () {
                input1FocusCount++;
            });

            const $input2 = createInput().attr('id', '2').focus(function () {
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
            const initText = 'click';
            const $input   = createInput('button').attr('value', initText).css({
                position: 'absolute',
                left:     '200px',
                top:      '200px'
            });

            let log = '';

            const listenedEvents = {
                mouse:    ['mouseover', 'mouseout', 'mousedown', 'mouseup', 'click'],
                touch:    ['touchstart', 'touchend'],
                pointer:  ['pointerover', 'pointerout', 'pointerdown', 'pointerup'],
                MSevents: ['MSPointerOver', 'MSPointerOut', 'MSPointerDown', 'MSPointerUp']
            };

            const addListeners = function (el, events) {
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
        const style = [
            '<style>',
            'input {border-bottom-width: 0;}',
            'input:hover {border-bottom-width: 10px;}',
            '</style>'
        ].join('\n');

        // NOTE: we need to use a sandboxed jQuery to process the 'style' element content.
        // Since Hammerhead 8.0.0, proxying is performed on prototypes (instead of elements)
        const sandboxedJQuery = window.sandboxedJQuery.jQuery;

        sandboxedJQuery(style)
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo(body);

        const $input1 = createInput()
            .css('position', 'fixed')
            .css('margin-top', '50px')
            .appendTo(body);

        const $input2 = $input1
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
        const newText = '123';
        const $input  = createInput()
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
            const $input     = createInput('number').val('123');
            const caretPos   = 2;

            let clickCount = 0;

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
                const initText = '12345678987654321';
                const input    = createInput('number').attr('value', initText).val(initText)[0];
                const startPos = 5;
                const endPos   = 11;
                const backward = true;

                const selectTextAutomation = new SelectTextAutomation(input, endPos, startPos, {});

                selectTextAutomation
                    .run()
                    .then(function () {
                        equal(textSelection.getSelectionStart(input), startPos, 'start selection correct');
                        equal(textSelection.getSelectionEnd(input), endPos, 'end selection correct');

                        if (!window.DIRECTION_ALWAYS_IS_FORWARD)
                            equal(textSelection.hasInverseSelection(input), backward, 'selection direction correct');

                        startNext();
                    });
            });
        }

        asyncTest('T133144 - Incorrect typing into an input with type "number" in FF during test executing (without caretPos)', function () {
            const initText = '12345';
            const text     = '123';
            const newText  = initText + text;
            const $input   = createInput('number').attr('value', initText);

            runTypeAutomation($input[0], text, {})
                .then(function () {
                    equal($input[0].value, newText);
                    equal(textSelection.getSelectionStart($input[0]), newText.length, 'start selection correct');
                    equal(textSelection.getSelectionEnd($input[0]), newText.length, 'end selection correct');

                    startNext();
                });
        });

        asyncTest('T133144 - Incorrect typing into an input with type "number" in FF during test executing (with caretPos)', function () {
            const initText = '12345';
            const text     = '123';
            const $input   = createInput('number').attr('value', initText);
            const caretPos = 2;

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
            const initText = '12345';
            const text     = '678';
            const $input   = createInput('number').attr('value', initText);

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
            const $input          = createInput('number').attr('maxLength', 2);

            let inputEventCount = 0;

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
            const $input          = createInput('number').attr('maxLength', 2);
            const keySequence     = '1 2 3';
            const pressAutomation = new PressAutomation(parseKeySequence(keySequence).combinations, {});

            let inputEventCount = 0;

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
            const input = createInput('number')[0];

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
            const input = createInput('number')[0];

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
            const input = createInput('number')[0];

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
            const input = createInput('number').val('12')[0];

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
        const mockParentDimension = {
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

        const mockChildDimension = {
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
