const hammerhead       = window.getTestCafeModule('hammerhead');
const browserUtils     = hammerhead.utils.browser;
const featureDetection = hammerhead.utils.featureDetection;
const Promise          = hammerhead.Promise;

const testCafeCore = window.getTestCafeModule('testCafeCore');
const styleUtils   = testCafeCore.styleUtils;

const testCafeAutomation = window.getTestCafeModule('testCafeAutomation');
const getOffsetOptions   = testCafeAutomation.getOffsetOptions;
const ClickAutomation    = testCafeAutomation.Click;
const ClickOptions       = testCafeAutomation.ClickOptions;
const cursor             = testCafeAutomation.cursor;

testCafeCore.preventRealEvents();

const isSafariGreaterThan15 = browserUtils.isSafari && parseFloat(browserUtils.fullVersion) >= '15.0';
const isMobileSafari        = browserUtils.isSafari && featureDetection.isTouchDevice;
const nextTestDelay         = browserUtils.isIE ? 30 : 200;
const TEST_RESULT_TIMEOUT   = featureDetection.isTouchDevice ? 2500 : 500;

$(document).ready(function () {
    let $el = null;

    //constants
    const TEST_ELEMENT_CLASS       = 'testElement';
    const TEST_DIV_CONTAINER_CLASS = 'testContainer';

    const isIOS = browserUtils.isIOS;

    //utils
    const addInputElement = function (type, id, x, y) {
        const elementString = ['<input type="', type, '" id="', id, '" value="', id, '" />'].join('');

        return $(elementString)
            .css({
                position:   'absolute',
                marginLeft: x + 'px',
                marginTop:  y + 'px',
            })
            .addClass(type)
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo('body');
    };

    const createDiv = function () {
        return $('<div />');
    };

    const addDiv = function (x, y) {
        return createDiv()
            .css({
                position: 'absolute',
                left:     x,
                top:      y,
                border:   '1px solid black',
            })
            .width(150)
            .height(150)
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo('body');
    };

    const addContainer = function (width, height, outerElement) {
        return createDiv()
            .css({
                border:   '1px solid black',
                padding:  '5px',
                overflow: 'auto',
            })
            .width(width)
            .height(height)
            .addClass(TEST_ELEMENT_CLASS)
            .addClass(TEST_DIV_CONTAINER_CLASS)
            .appendTo(outerElement);
    };

    const startNext = function () {
        if (browserUtils.isIE || isMobileSafari) {
            removeTestElements();
            window.setTimeout(start, nextTestDelay);
        }
        else
            start();
    };

    const removeTestElements = function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
    };

    const preventEventAndClick = function (eventNameToPrevent) {
        const raisedEvents = [];

        const events = [
            'ontouchstart',
            'ontouchend',
            'ontouchmove',
            'onmousedown',
            'onmousemove',
            'onmouseup',
            'onclick',
        ];

        events.forEach(function (eventName) {
            $el[0][eventName] = function (e) {
                if (eventName === eventNameToPrevent)
                    e.preventDefault();

                raisedEvents.push(eventName);
            };
        });

        const click = new ClickAutomation($el[0], new ClickOptions(), window, cursor);

        return click
            .run()
            .then(function () {
                return raisedEvents;
            });
    };

    $('<div></div>').css({ width: 1, height: 1500, position: 'absolute' }).appendTo('body');
    $('body').css('height', '1500px');

    //tests
    QUnit.testStart(function () {
        $el = addInputElement('button', 'button1', Math.floor(Math.random() * 100), Math.floor(Math.random() * 100));
    });

    QUnit.testDone(function () {
        if (!browserUtils.isIE)
            removeTestElements();
    });

    module('dom events tests');

    asyncTest('mouse events raised', function () {
        let mousedownRaised = false;
        let mouseupRaised   = false;
        let clickRaised     = false;


        $el.mousedown(function () {
            mousedownRaised = true;
            ok(!mouseupRaised && !clickRaised, 'mousedown event was raised first');
        });

        $el.mouseup(function () {
            mouseupRaised = true;
            ok(mousedownRaised && !clickRaised, 'mouseup event was raised second');
        });

        $el.click(function () {
            clickRaised = true;
            ok(mousedownRaised && mouseupRaised, 'click event was raised third ');
        });

        const click = new ClickAutomation($el[0], new ClickOptions({ offsetX: 5, offsetY: 5 }), window, cursor);

        click
            .run()
            .then(function () {
                ok(mousedownRaised && mousedownRaised && clickRaised, 'mouse events were raised');
                startNext();
            });
    });

    if (!featureDetection.isTouchDevice) {
        asyncTest('over and move events on elements during moving', function () {
            let overed  = false;
            let entered = false;
            let moved   = false;

            $el
                .css({
                    marginTop:  '100px',
                    marginLeft: '100px',
                    zIndex:     2,
                })
                .mouseover(function () {
                    overed = true;
                })
                .mouseenter(function () {
                    //B234358
                    entered = true;
                })
                .mousemove(function () {
                    moved = true;
                });

            const click = new ClickAutomation($el[0], new ClickOptions({ offsetX: 5, offsetY: 5 }), window, cursor);

            click
                .run()
                .then(function () {
                    ok(overed && moved && entered, 'mouse moving events were raised');
                    startNext();
                });
        });
    }

    module('click on scrollable element in some scrolled containers');

    asyncTest('scroll down and click with offset', function () {
        let clicked = false;

        removeTestElements();

        const $div1            = addContainer(500, 200, 'body');
        const $div2            = addContainer(450, 510, $div1);
        const $div3            = addContainer(400, 620, $div2);
        const $div4            = addContainer(350, 1230, $div3);
        const offsetY          = 2350;
        const containerBorders = styleUtils.getBordersWidth($div4[0]);
        const containerPadding = styleUtils.getElementPadding($div4[0]);

        createDiv()
            .addClass(TEST_ELEMENT_CLASS)
            .css({
                marginTop:       offsetY - containerPadding.top - containerBorders.top + 'px',
                width:           '100%',
                height:          '1px',
                backgroundColor: '#ff0000',
            })
            .bind('mousedown', function () {
                clicked = true;
            })
            .appendTo($div4);

        createDiv()
            .addClass(TEST_ELEMENT_CLASS)
            .css({
                height:          '20px',
                width:           '20px',
                marginTop:       50 + 'px',
                backgroundColor: '#ffff00',
            })
            .appendTo($div4);

        const click = new ClickAutomation($div4[0], new ClickOptions({ offsetX: 100, offsetY: offsetY }), window, cursor);

        click
            .run()
            .then(function () {
                ok(clicked, 'click was raised');
                startNext();
            });
    });

    // TODO: Stabilize the test in Chrome with macOS and Windows
    (browserUtils.isChrome && !browserUtils.isAndroid ? QUnit.skip : asyncTest)('an active input should be blurred and a parent of a disabled input should be focused after a click on the disabled input', function () {
        const activeInput         = document.createElement('input');
        const disabledInput       = document.createElement('input');
        const disabledInputParent = document.createElement('div');

        disabledInput.setAttribute('disabled', 'disabled');
        disabledInputParent.setAttribute('tabindex', '0');

        activeInput.className = disabledInputParent.className = TEST_ELEMENT_CLASS;

        document.body.appendChild(activeInput);
        document.body.appendChild(disabledInputParent);
        disabledInputParent.appendChild(disabledInput);

        let isActiveInputFocused         = false;
        let isActiveInputBlurred         = false;
        let isDisabledInputParentFocused = false;

        activeInput.onfocus = function () {
            isActiveInputFocused = true;
        };

        activeInput.onblur = function () {
            isActiveInputBlurred = true;
        };

        disabledInputParent.onfocus = function () {
            isDisabledInputParentFocused = true;
        };

        activeInput.focus();

        const click = new ClickAutomation(disabledInput, new ClickOptions({ offsetX: 5, offsetY: 5 }), window, cursor);

        click
            .run()
            .then(function () {
                ok(isActiveInputFocused);
                ok(isActiveInputBlurred);
                ok(isDisabledInputParentFocused);

                startNext();
            });
    });

    asyncTest('scroll up and click with offset', function () {
        let clicked = false;

        removeTestElements();

        const $div1            = addContainer(500, 200, 'body');
        const $div2            = addContainer(450, 510, $div1);
        const $div3            = addContainer(400, 620, $div2);
        const $div4            = addContainer(350, 1230, $div3);
        const offsetY          = 50;
        const containerBorders = styleUtils.getBordersWidth($div4[0]);
        const containerPadding = styleUtils.getElementPadding($div4[0]);

        createDiv()
            .addClass(TEST_ELEMENT_CLASS)
            .css({
                marginTop:       offsetY - containerPadding.top - containerBorders.top + 'px',
                width:           '100%',
                height:          '1px',
                backgroundColor: '#ff0000',
            })
            .bind('mousedown', function () {
                clicked = true;
            })
            .appendTo($div4);

        createDiv()
            .addClass(TEST_ELEMENT_CLASS)
            .css({
                height:          '20px',
                width:           '20px',
                marginTop:       2350 + 'px',
                backgroundColor: '#ffff00',
            })
            .appendTo($div4);

        $div1.scrollTop(322);
        $div2.scrollTop(322);
        $div3.scrollTop(322);
        $div4.scrollTop(1186);

        const click = new ClickAutomation($div4[0], new ClickOptions({ offsetX: 100, offsetY: offsetY }), window, cursor);

        click
            .run()
            .then(function () {
                ok(clicked, 'click was raised');
                startNext();
            });
    });

    module('other functional tests');

    asyncTest('scroll to already visible element', function () {
        removeTestElements();

        addContainer(1, 5000, 'body');

        const target = addContainer(20, 10, 'body');

        addContainer(1, 5000, 'body');

        target.css({
            backgroundColor: '#ff0000',
        });

        hammerhead.nativeMethods.scrollTo.call(window, 0, 5050);

        const click = new ClickAutomation(target[0], {
            offsetX: 10,
            offsetY: 5,
        }, window, cursor);

        const windowY = styleUtils.getScrollTop(document);

        setTimeout(function () {
            click
                .run()
                .then(function () {
                    equal(styleUtils.getScrollTop(document), windowY, 'scroll position should not change');
                    startNext();
                });
        }, TEST_RESULT_TIMEOUT);
    });

    asyncTest('scroll to already visible but obscured element', function () {
        removeTestElements();

        addContainer(1, 5000, 'body');

        const target = addContainer(20, 10, 'body');

        addContainer(1, 5000, 'body');

        const fixed = addContainer(1000, 1000, 'body');
        let clicked = false;

        target.css({
            backgroundColor: '#ff0000',
        }).bind('mousedown', function () {
            clicked = true;
        });

        fixed.css({
            backgroundColor: '#00ff00',
            position:        'fixed',
            top:             1,
            left:            1,
            right:           1,
            height:          100,
        });

        hammerhead.nativeMethods.scrollTo.call(window, 0, 5050);

        const click = new ClickAutomation(target[0], {
            offsetX: 10,
            offsetY: 5,
        }, window, cursor);

        const windowY = styleUtils.getScrollTop(document);

        setTimeout(function () {
            click
                .run()
                .then(function () {
                    notEqual(styleUtils.getScrollTop(document), windowY, 'scroll position should change');
                    ok(clicked, 'click was raised');
                    startNext();
                });
        }, TEST_RESULT_TIMEOUT);
    });

    asyncTest('click on element in scrolled container', function () {
        let clicked = false;

        const $div = addDiv(200, 200)
            .width(150)
            .height(150)
            .css({
                overflow: 'scroll',
            });

        const $button = $('<input type="button">')
            .addClass(TEST_ELEMENT_CLASS)
            .css({ marginTop: '400px', marginLeft: '80px' })
            .bind('mousedown', function () {
                clicked = true;
            })
            .appendTo($div);

        const click = new ClickAutomation($button[0], new ClickOptions({ offsetX: 5, offsetY: 5 }), window, cursor);

        click
            .run()
            .then(function () {
                ok(clicked, 'click was raised');
                startNext();
            });
    });

    asyncTest('click after scrolling', function () {
        let clicked = false;

        $el.css({ 'marginTop': '1000px' })
            .click(function () {
                clicked = true;
            });

        const click = new ClickAutomation($el[0], new ClickOptions({ offsetX: 5, offsetY: 5 }), window, cursor);

        click
            .run()
            .then(function () {
                ok(clicked, 'click after scrolling was raised');

                //moving scroll to start position for a next test
                const restoreScrollClick = new ClickAutomation(addDiv(200, 500)[0],
                    new ClickOptions({
                        offsetX: 5,
                        offsetY: 5,
                    }), window, cursor);

                return restoreScrollClick.run();
            })
            .then(function () {
                start();
            });
    });

    // TODO: stabilize test on iOS
    (isIOS ? QUnit.skip : asyncTest)('focusing on click', function () {
        let focused = false;

        $el.css({ display: 'none' });

        const $input = addInputElement('text', 'input', 150, 150);

        $input.focus(function () {
            focused = true;
        });


        const click = new ClickAutomation($input[0], new ClickOptions({ offsetX: 5, offsetY: 5 }), window, cursor);

        click
            .run()
            .then(function () {
                ok(focused, 'clicked element focused');
                startNext();
            });
    });

    // TODO: fix test timeout for iOS
    (isIOS ? QUnit.skip : asyncTest)('double click in the same position', function () {
        const el        = $el[0];
        let clicksCount = 0;

        $el.click(function () {
            clicksCount++;
        });

        const firstClick = new ClickAutomation(el, new ClickOptions({ offsetX: 5, offsetY: 5 }), window, cursor);

        firstClick
            .run()
            .then(function () {
                const secondClick = new ClickAutomation(el, new ClickOptions({ offsetX: 5, offsetY: 5 }), window, cursor);

                return secondClick.run();
            })
            .then(function () {
                equal(clicksCount, 2, 'click event was raised twice');

                startNext();
            });
    });

    // TODO: fix test timeout for iOS
    (isIOS ? QUnit.skip : asyncTest)('click with options keys', function () {
        let focused = false;
        let alt     = false;
        let shift   = false;
        let ctrl    = false;
        let meta    = false;

        $el.css({ display: 'none' });

        const $input = addInputElement('text', 'input', 150, 150);

        $input.focus(function () {
            focused = true;
        });

        $input.click(function (e) {
            alt   = e.altKey;
            ctrl  = e.ctrlKey;
            shift = e.shiftKey;
            meta  = e.metaKey;
        });

        const click = new ClickAutomation($input[0], new ClickOptions({
            modifiers: {
                alt:   true,
                ctrl:  true,
                shift: true,
                meta:  true,
            },

            offsetX: 5,
            offsetY: 5,
        }), window, cursor);

        click
            .run()
            .then(function () {
                ok(focused, 'clicked element focused');
                ok(alt, 'alt key is pressed');
                ok(shift, 'shift key is pressed');
                ok(ctrl, 'ctrl key is pressed');
                ok(meta, 'meta key is pressed');

                startNext();
            });
    });

    // TODO: stabilize test on iOS
    (isIOS ? QUnit.skip : asyncTest)('click on covered element', function () {
        $el.css({ display: 'none' });

        const clickOffsets = [];
        const $target      = addDiv(150, 150);
        const target       = $target[0];
        const elOffset     = $target.offset();

        addDiv(elOffset.left + 50, elOffset.top + 50)
            .css({ backgroundColor: 'red' })
            .width(50)
            .height(50);

        $target.click(function (e) {
            clickOffsets.push({ x: Math.floor(e.pageX - elOffset.left), y: Math.floor(e.pageY - elOffset.top) });
        });

        Promise.resolve()
            .then(function () {
                const click = new ClickAutomation(target, new ClickOptions({ offsetX: 75, offsetY: 75, isDefaultOffset: true }), window, cursor);

                return click.run();
            })
            .then(function () {
                const click = new ClickAutomation(target, new ClickOptions({ offsetX: 75, offsetY: 75, isDefaultOffset: true }), window, cursor);

                addDiv(elOffset.left, elOffset.top)
                    .css({ backgroundColor: 'red' })
                    .width(80)
                    .height(80);

                return click.run();
            })
            .then(function () {
                const click = new ClickAutomation(target, new ClickOptions({ offsetX: 75, offsetY: 75, isDefaultOffset: true }), window, cursor);

                addDiv(elOffset.left + 70, elOffset.top)
                    .css({ backgroundColor: 'red' })
                    .width(80)
                    .height(80);

                return click.run();
            })
            .then(function () {
                const click = new ClickAutomation(target, new ClickOptions({ offsetX: 75, offsetY: 75, isDefaultOffset: true }), window, cursor);

                addDiv(elOffset.left, elOffset.top + 70)
                    .css({ backgroundColor: 'red' })
                    .width(80)
                    .height(80);

                return click.run();
            })
            .then(function () {
                deepEqual(clickOffsets[0], { x: 37, y: 37 }, 'click in the upper left corner');
                deepEqual(clickOffsets[1], { x: 112, y: 37 }, 'click in the upper right corner');
                deepEqual(clickOffsets[2], { x: 37, y: 112 }, 'click in the lower left corner');
                deepEqual(clickOffsets[3], { x: 112, y: 112 }, 'click in the lower right corner');

                startNext();
            });
    });

    asyncTest('cancel bubble', function () {
        let divClicked = false;
        let btnClicked = false;

        $el.css({ marginTop: '100px', marginLeft: '100px' });

        $el[0].onclick = function (e) {
            e              = e || window.event;
            e.cancelBubble = true;
            btnClicked     = true;
        };

        const $div = addDiv(100, 100)
            .width(150)
            .height(150)
            .click(function () {
                divClicked = true;
            });

        $el.appendTo($div);

        const click = new ClickAutomation($el[0], new ClickOptions({ offsetX: 5, offsetY: 5 }), window, cursor);

        click
            .run()
            .then(function () {
                equal(btnClicked, true, 'button clicked');
                equal(divClicked, false, 'bubble canceled');

                startNext();
            });
    });

    // TODO: fix test timeout on iOS
    (isIOS ? QUnit.skip : asyncTest)('click on outer element raises event for inner element', function () {
        let divClicked = false;
        let btnClicked = false;

        const $div = addDiv(400, 400)
            .width(70)
            .height(30)
            .click(function () {
                divClicked = true;
            });

        $el
            .css({
                marginTop:  '10px',
                marginLeft: '10px',
                position:   'relative',
            })
            .click(function () {
                btnClicked = true;
            })
            .appendTo($div);

        const click = new ClickAutomation($div[0], new ClickOptions({ offsetX: 15, offsetY: 15 }), window, cursor);

        click
            .run()
            .then(function () {
                equal(btnClicked, true, 'button clicked');
                equal(divClicked, true, 'div clicked');

                startNext();
            });
    });

    // TODO: stabilize test on iOS
    (isIOS ? QUnit.skip : asyncTest)('click with positive offsets', function () {
        let eventPoint = null;

        $el.css({
            width:  '100px',
            height: '100px',
            border: '0px',
        });

        const el = $el[0];

        const handler = function (e) {
            eventPoint = { x: e.pageX, y: e.pageY };
        };

        el.addEventListener('click', handler);

        const offsets = getOffsetOptions($el[0], 20, 20);

        const click = new ClickAutomation($el[0], new ClickOptions({
            offsetX: offsets.offsetX,
            offsetY: offsets.offsetY,
        }), window, cursor);

        click.run()
            .then(function () {
                el.removeEventListener('click', handler);

                const expectedPoint = { x: el.offsetLeft + 20, y: el.offsetTop + 20 };

                equal(JSON.stringify(eventPoint), JSON.stringify(expectedPoint));

                startNext();
            });
    });

    // TODO: stabilize test on iOS
    (isIOS ? QUnit.skip : asyncTest)('click with negative offsets', function () {
        let eventPoint = null;

        $el.css({
            width:  '100px',
            height: '100px',
            border: '0px',
        });

        const el = $el[0];

        const handler = function (e) {
            eventPoint = { x: e.pageX, y: e.pageY };
        };

        el.addEventListener('click', handler);

        const offsets = getOffsetOptions($el[0], -20, -20);

        const click = new ClickAutomation($el[0], new ClickOptions({
            offsetX: offsets.offsetX,
            offsetY: offsets.offsetY,
        }), window, cursor);

        click.run()
            .then(function () {
                el.removeEventListener('click', handler);

                const expectedPoint = {
                    x: el.offsetLeft + el.offsetWidth - 20,
                    y: el.offsetTop + el.offsetHeight - 20,
                };

                equal(JSON.stringify(eventPoint), JSON.stringify(expectedPoint));

                startNext();
            });
    });

    // TODO: stabilize test on iOS
    (isIOS ? QUnit.skip : asyncTest)('click on label with custom focus/selection handlers bound to checkbox', function () {
        let changed = false;

        const textarea = document.createElement('textarea');
        const checkbox = document.createElement('input');
        const label    = document.createElement('label');

        document.body.appendChild(textarea);
        document.body.appendChild(checkbox);
        document.body.appendChild(label);

        checkbox.id     = 'checkbox';
        label.innerHTML = 'label';

        textarea.className = TEST_ELEMENT_CLASS;
        checkbox.className = TEST_ELEMENT_CLASS;
        label.className    = TEST_ELEMENT_CLASS;

        checkbox.setAttribute('type', 'checkbox');
        label.setAttribute('for', checkbox.id);

        checkbox.addEventListener('change', function () {
            changed = !changed;
        });

        textarea.addEventListener('focus', function () {
            textarea.setSelectionRange(1, 2);
        });

        textarea.value = '11';

        const onTextAreaFocusPromise = new Promise(function (resolve) {
            textarea.addEventListener('focus', resolve);
        });

        const clickAutomation = new ClickAutomation(label, { }, window, cursor);

        textarea.focus();

        onTextAreaFocusPromise
            .then(function () {
                return clickAutomation.run();
            })
            .then(function () {
                ok(changed, 'change');
                ok(checkbox.checked, 'checked');

                return clickAutomation
                    .run()
                    .then(function () {
                        notOk(changed, 'not change');
                        notOk(checkbox.checked, 'not checked');

                        startNext();
                    });
            });
    });

    if (!browserUtils.isIE) {
        asyncTest('click and mouseup events should have equal `timeStamp` properties', function () {
            const target = document.createElement('div');

            target.className    = TEST_ELEMENT_CLASS;
            target.style.width  = '10px';
            target.style.height = '10px';

            document.body.appendChild(target);

            let mouseUpTimeStamp = null;
            let clickTimeStamp   = null;

            target.addEventListener('mouseup', function (e) {
                mouseUpTimeStamp = e.timeStamp;
            });

            target.addEventListener('click', function (e) {
                clickTimeStamp = e.timeStamp;
            });

            const clickAutomation = new ClickAutomation(target, { }, window, cursor);

            return clickAutomation
                .run()
                .then(function () {
                    ok(typeof mouseUpTimeStamp === 'number');
                    ok(typeof clickTimeStamp === 'number');

                    equal(mouseUpTimeStamp, clickTimeStamp);

                    startNext();
                });
        });
    }


    module('regression');

    asyncTest('GH-4709 - Fails to click on svg element', function () {
        const div   = document.createElement('div');
        let clicked = false;

        div.innerHTML        = '<svg><circle cx=\'50\' cy=\'50\' r=\'40\' stroke=\'black\' stroke-width=\'3\' fill=\'red\'></circle></svg>';
        div.className        = TEST_ELEMENT_CLASS;
        div.style.paddingTop = '200px';

        const svg = div.childNodes[0];

        svg.style.width  = '80px';
        svg.style.height = '80px';

        document.body.appendChild(div);

        svg.addEventListener('click', function () {
            clicked = true;
        });

        const clickBody = new ClickAutomation(document.body, { offsetX: 1, offsetY: 1 }, window, cursor);
        const clickSvg  = new ClickAutomation(svg, { offsetX: 40, offsetY: 40 }, window, cursor);

        // NOTE: we need to move cursor to any element before the clicking on svg to reproduce the issue
        clickBody
            .run()
            .then(function () {
                return clickSvg.run();
            })
            .then(function () {
                equal(clicked, true);
                startNext();
            });
    });

    asyncTest('Q558721 - Test running hangs if element is hidden in non-scrollable container', function () {
        let clickRaised = false;

        const $container  = $('<div></div>')
            .addClass(TEST_ELEMENT_CLASS)
            .css({
                width:      100,
                height:     100,
                overflow:   'hidden',
                border:     '1px solid green',
                marginLeft: 50,
            })
            .appendTo('body');

        const $button = $('<button>Button</button>')
            .css({
                position: 'relative',
                left:     -60,
            }).appendTo($container);

        $(document).click(function () {
            clickRaised = true;
        });

        const click = new ClickAutomation($button[0], new ClickOptions({ offsetX: 10, offsetY: 10 }), window, cursor);

        click
            .run()
            .then(function () {
                equal(clickRaised, true, 'button clicked');
                startNext();
            });
    });

    asyncTest('B253520 - Blur event is not raised during click playback if previous active element becomes invisible via css on mousedown handler in IE9', function () {
        const $input           = $('<input type="text"/>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $button          = $('<input type="button"/>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        let inputBlurHandled   = false;

        const waitUntilCssApply = function () {
            if ($input[0].getBoundingClientRect().width > 0) {
                const timeout      = 2;
                const startSeconds = new Date().getSeconds();
                const endSeconds   = (startSeconds + timeout) % 60;

                while ($input[0].getBoundingClientRect().width > 0) {
                    if (new Date().getSeconds() > endSeconds)
                        break;
                }
            }
        };

        $input.blur(function () {
            inputBlurHandled = true;
        });

        $button.mousedown(function () {
            $input.css('display', 'none');
            //sometimes (in IE9 for example) element becomes invisible not immediately after css set, we should stop our code and wait
            waitUntilCssApply();
        });

        $input[0].focus();

        const click = new ClickAutomation($button[0], new ClickOptions({ offsetX: 5, offsetY: 5 }), window, cursor);

        click
            .run()
            .then(function () {
                ok(inputBlurHandled, 'check that input blur event was handled');
                startNext();
            });
    });

    asyncTest('mouseup should be called asynchronously after mousedown', function () {
        let timeoutCalled = false;
        let mouseupCalled = false;

        $el.bind('mousedown', function () {
            window.setTimeout(function () {
                timeoutCalled = true;
            }, 0);
        });

        $el.bind('mouseup', function () {
            mouseupCalled = true;
            ok(timeoutCalled, 'check timeout setted in mousedown handler was called before mouseup');
        });

        const click = new ClickAutomation($el[0], new ClickOptions({ offsetX: 5, offsetY: 5 }), window, cursor);

        click
            .run()
            .then(function () {
                ok(mouseupCalled, 'check mouseup was called');
                startNext();
            });
    });

    asyncTest('T163678 - A Click action on a link with a line break does not work', function () {
        const $box    = $('<div></div>').css('width', '128px').appendTo($('body'));
        const $link   = $('<a href="javascript:void(0);">why do I have to break</a>').appendTo($box);
        let clicked   = false;

        $box.addClass(TEST_ELEMENT_CLASS);
        $link.click(function () {
            clicked = true;
        });

        const click = new ClickAutomation($link[0], new ClickOptions({ offsetX: 5, offsetY: 5 }), window, cursor);

        click
            .run()
            .then(function () {
                ok(clicked, 'check mouseup was called');
                startNext();
            });
    });

    // NOTE: We turn off some tests due to an issue in Safari 15.
    // Need to check these tests on the next Safari versions (15.3 and later).
    if (!isSafariGreaterThan15) {
        asyncTest('T224332 - TestCafe problem with click on links in popup menu (click on link with span inside without offset)', function () {
            const $box  = $('<div></div>').css('width', '128px').appendTo($('body'));
            const $link = $('<a href="javascript:void(0);"></a>').appendTo($box);

            $('<span>why do I have to break</span>').appendTo($link);

            let clicked = false;

            $('input').remove();
            $box.addClass(TEST_ELEMENT_CLASS);

            $link.click(function () {
                clicked = true;
            });

            const click = new ClickAutomation($link[0], new ClickOptions(), window, cursor);

            click
                .run()
                .then(function () {
                    ok(clicked, 'check mouseup was called');
                    startNext();
                });
        });

        asyncTest('T224332 - TestCafe problem with click on links in popup menu (click on span inside the link without offset)', function () {
            const $box    = $('<div></div>').css('width', '128px').appendTo($('body'));
            const $link   = $('<a href="javascript:void(0);"></a>').appendTo($box);
            const $span   = $('<span>why do I have to break</span>').appendTo($link);

            let clicked = false;

            $box.addClass(TEST_ELEMENT_CLASS);

            $link.click(function () {
                clicked = true;
            });

            const click = new ClickAutomation($span[0], new ClickOptions(), window, cursor);

            click
                .run()
                .then(function () {
                    ok(clicked, 'check mouseup was called');
                    startNext();
                });
        });
    }

    asyncTest('T191183 - pointer event properties are fixed', function () {
        let mousedownRaised = false;
        let mouseupRaised   = false;
        let clickRaised     = false;

        $el
            .mousedown(function (e) {
                mousedownRaised = true;

                equal(e.button, 0);

                if (!browserUtils.isSafari)
                    equal(e.buttons, 1);

                ok(!mouseupRaised && !clickRaised, 'mousedown event was raised first');
            })
            .mouseup(function (e) {
                mouseupRaised = true;

                equal(e.button, 0);

                if (!browserUtils.isSafari)
                    equal(e.buttons, 0);

                ok(mousedownRaised && !clickRaised, 'mouseup event was raised second');
            })
            .click(function (e) {
                clickRaised = true;

                equal(e.button, 0);

                if (!browserUtils.isSafari)
                    equal(e.buttons, 0);

                ok(mousedownRaised && mouseupRaised, 'click event was raised third ');
            });

        const pointerHandler = function (e) {
            equal(e.pointerType, browserUtils.version > 10 ? 'mouse' : 4);
            equal(e.button, 0);

            if (e.type === 'pointerdown')
                equal(e.buttons, 1);

            if (e.type === 'pointerup')
                equal(e.buttons, 0);
        };

        if (browserUtils.isIE && browserUtils.version > 11) {
            $el[0].onpointerdown = pointerHandler;
            $el[0].onpointerup   = pointerHandler;
        }
        else {
            $el[0].onmspointerdown = pointerHandler;
            $el[0].onmspointerup   = pointerHandler;
        }

        if (browserUtils.isIE)
            expect(16);
        else if (browserUtils.isSafari)
            expect(7);
        else
            expect(10);

        const click = new ClickAutomation($el[0], new ClickOptions({ offsetX: 5, offsetY: 5 }), window, cursor);

        click
            .run()
            .then(function () {
                ok(mousedownRaised && mousedownRaised && clickRaised, 'mouse events were raised');
                startNext();
            });
    });

    asyncTest('T253883 - Playback - It is impossible to type a password', function () {
        $el.css({ display: 'none' });

        const $label = $('<label></label>')
            .attr('for', 'input').addClass(TEST_ELEMENT_CLASS)
            .appendTo('body');

        $('<span>label for input</span>')
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo($label);

        const $input = $('<input />')
            .attr('id', 'input')
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo($label);

        const click = new ClickAutomation($input[0], new ClickOptions({ offsetX: 5, offsetY: 5 }), window, cursor);

        click
            .run()
            .then(function () {
                equal(document.activeElement, $input[0]);
                startNext();
            });
    });

    asyncTest('T299665 - Incorrect click on image with associated map element in Mozilla', function () {
        const $map = $('<map name="map"></map>')
            .appendTo('body')
            .addClass(TEST_ELEMENT_CLASS);

        const $area = $('<area shape="rect" coords="0,0,200,200" title="Area"/>').appendTo($map);

        const $img = $('<img usemap="#map"/>')
            .attr('src', window.QUnitGlobals.getResourceUrl('../../data/runner/img.png'))
            .css({
                width:  '200px',
                height: '200px',
            })
            .appendTo('body')
            .addClass(TEST_ELEMENT_CLASS);

        function clickHandler (e) {
            if (this === e.target)
                $(this).data('clicked', true);
        }

        $('#button1').remove();

        $area.click(clickHandler);
        $img.click(clickHandler);


        window.setTimeout(function () {
            const click = new ClickAutomation($area[0], new ClickOptions({ offsetX: 10, offsetY: 10 }), window, cursor);

            click
                .run()
                .then(function () {
                    ok($area.data('clicked'), 'area element was clicked');
                    notOk($img.data('clicked'), 'img element was not clicked');

                    startNext();
                });
            // This test under Firefox MacOS takes a little more time.
        }, TEST_RESULT_TIMEOUT + 200);
    });

    module('touch devices test');
    if (featureDetection.isTouchDevice) {
        asyncTest('touch event on click', function () {
            const events = {
                ontouchstart: false,
                ontouchend:   false,
                onmousedown:  false,
                onmouseup:    false,
                onclick:      false,
            };

            const bind = function (eventName) {
                $el[0][eventName] = function () {
                    events[eventName] = true;
                };
            };

            Object.keys(events).forEach(bind);

            const click = new ClickAutomation($el[0], new ClickOptions({ offsetX: 5, offsetY: 5 }), window, cursor);

            click
                .run()
                .then(function () {
                    Object.keys(events).forEach(function (event) {
                        ok(events[event], event + ' raised');
                    });

                    startNext();
                });
        });

        asyncTest('event touch lists length (T170088)', function () {
            const raisedEvents = [];

            const touchEventHandler = function (ev) {
                raisedEvents.push(ev.type);
                equal(ev.touches.length, ev.type === 'touchend' ? 0 : 1);
                equal(ev.targetTouches.length, ev.type === 'touchend' ? 0 : 1);
                equal(ev.changedTouches.length, 1);
            };

            $el[0].ontouchstart = $el[0].ontouchmove = $el[0].ontouchend = touchEventHandler;

            const click = new ClickAutomation($el[0], new ClickOptions({ offsetX: 5, offsetY: 5 }), window, cursor);

            click
                .run()
                .then(function () {
                    ok(raisedEvents.indexOf('touchstart') >= 0);
                    ok(raisedEvents.indexOf('touchend') >= 0);

                    startNext();
                });
        });

        asyncTest('click should not raise touchmove', function () {
            const raisedEvents = [];

            const touchEventHandler = function (ev) {
                raisedEvents.push(ev.type);
            };

            const element = $el[0];

            document.body.addEventListener('touchmove', touchEventHandler);
            element.addEventListener('touchmove', touchEventHandler);

            element.addEventListener('touchstart', touchEventHandler);
            element.addEventListener('touchend', touchEventHandler);

            const click = new ClickAutomation(element, new ClickOptions(), window, cursor);

            click
                .run()
                .then(function () {
                    deepEqual(raisedEvents, ['touchstart', 'touchend']);

                    startNext();
                });
        });

        asyncTest('mouse or click events should not be raised if touch events were cancelled', function () {
            const expectedRaisedEvents = ['ontouchstart', 'ontouchend'];

            window.async.series({
                'ontouchstart': function (cb) {
                    preventEventAndClick('ontouchstart')
                        .then(function (actualRaisedEvents) {
                            deepEqual(actualRaisedEvents, expectedRaisedEvents);

                            cb();
                        });
                },

                'ontouchend': function () {
                    preventEventAndClick('ontouchend')
                        .then(function (actualRaisedEvents) {
                            deepEqual(actualRaisedEvents, expectedRaisedEvents);

                            startNext();
                        });
                },
            });
        });
    }
});
