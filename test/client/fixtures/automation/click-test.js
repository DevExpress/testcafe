var hammerhead       = window.getTestCafeModule('hammerhead');
var browserUtils     = hammerhead.utils.browser;
var featureDetection = hammerhead.utils.featureDetection;

var testCafeCore = window.getTestCafeModule('testCafeCore');
var styleUtils   = testCafeCore.get('./utils/style');

var testCafeAutomation = window.getTestCafeModule('testCafeAutomation');
var getOffsetOptions   = testCafeAutomation.getOffsetOptions;
var ClickAutomation    = testCafeAutomation.Click;
var ClickOptions       = testCafeAutomation.get('../../test-run/commands/options').ClickOptions;

testCafeCore.preventRealEvents();

$(document).ready(function () {
    var $el = null;

    //constants
    var TEST_ELEMENT_CLASS       = 'testElement';
    var TEST_DIV_CONTAINER_CLASS = 'testContainer';

    //utils
    var addInputElement = function (type, id, x, y) {
        var elementString = ['<input type="', type, '" id="', id, '" value="', id, '" />'].join('');

        return $(elementString)
            .css({
                position:   'absolute',
                marginLeft: x + 'px',
                marginTop:  y + 'px'
            })
            .addClass(type)
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo('body');
    };

    var createDiv = function () {
        return $('<div />');
    };

    var addDiv = function (x, y) {
        return createDiv()
            .css({
                position: 'absolute',
                left:     x,
                top:      y,
                border:   '1px solid black'
            })
            .width(150)
            .height(150)
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo('body');
    };

    var addContainer = function (width, height, outerElement) {
        return createDiv()
            .css({
                border:   '1px solid black',
                padding:  '5px',
                overflow: 'auto'
            })
            .width(width)
            .height(height)
            .addClass(TEST_ELEMENT_CLASS)
            .addClass(TEST_DIV_CONTAINER_CLASS)
            .appendTo(outerElement);
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
        var mousedownRaised = false;
        var mouseupRaised   = false;
        var clickRaised     = false;


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

        var click = new ClickAutomation($el[0], new ClickOptions({ offsetX: 5, offsetY: 5 }));

        click
            .run()
            .then(function () {
                ok(mousedownRaised && mousedownRaised && clickRaised, 'mouse events were raised');
                startNext();
            });
    });

    if (!featureDetection.isTouchDevice) {
        asyncTest('over and move events on elements during moving', function () {
            var overed  = false;
            var entered = false;
            var moved   = false;

            $el
                .css({
                    marginTop:  '100px',
                    marginLeft: '100px',
                    zIndex:     2
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

            var click = new ClickAutomation($el[0], new ClickOptions({ offsetX: 5, offsetY: 5 }));

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
        var clicked = false;

        removeTestElements();

        var $div1            = addContainer(500, 200, 'body');
        var $div2            = addContainer(450, 510, $div1);
        var $div3            = addContainer(400, 620, $div2);
        var $div4            = addContainer(350, 1230, $div3);
        var offsetY          = 2350;
        var containerBorders = styleUtils.getBordersWidth($div4[0]);
        var containerPadding = styleUtils.getElementPadding($div4[0]);

        createDiv()
            .addClass(TEST_ELEMENT_CLASS)
            .css({
                marginTop:       offsetY - containerPadding.top - containerBorders.top + 'px',
                width:           '100%',
                height:          '1px',
                backgroundColor: '#ff0000'
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
                backgroundColor: '#ffff00'
            })
            .appendTo($div4);

        var click = new ClickAutomation($div4[0], new ClickOptions({ offsetX: 100, offsetY: offsetY }));

        click
            .run()
            .then(function () {
                ok(clicked, 'click was raised');
                startNext();
            });
    });

    asyncTest('an active input should be blurred and a parent of a disabled input should be focused after a click on the disabled input', function () {
        var activeInput         = document.createElement('input');
        var disabledInput       = document.createElement('input');
        var disabledInputParent = document.createElement('div');

        disabledInput.setAttribute('disabled', 'disabled');
        disabledInputParent.setAttribute('tabindex', '0');

        activeInput.className = disabledInputParent.className = TEST_ELEMENT_CLASS;

        document.body.appendChild(activeInput);
        document.body.appendChild(disabledInputParent);
        disabledInputParent.appendChild(disabledInput);

        var isActiveInputFocused         = false;
        var isActiveInputBlurred         = false;
        var isDisabledInputParentFocused = false;

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

        var click = new ClickAutomation(disabledInput, new ClickOptions({ offsetX: 5, offsetY: 5 }));

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
        var clicked = false;

        removeTestElements();

        var $div1            = addContainer(500, 200, 'body');
        var $div2            = addContainer(450, 510, $div1);
        var $div3            = addContainer(400, 620, $div2);
        var $div4            = addContainer(350, 1230, $div3);
        var offsetY          = 50;
        var containerBorders = styleUtils.getBordersWidth($div4[0]);
        var containerPadding = styleUtils.getElementPadding($div4[0]);

        createDiv()
            .addClass(TEST_ELEMENT_CLASS)
            .css({
                marginTop:       offsetY - containerPadding.top - containerBorders.top + 'px',
                width:           '100%',
                height:          '1px',
                backgroundColor: '#ff0000'
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
                backgroundColor: '#ffff00'
            })
            .appendTo($div4);

        $div1.scrollTop(322);
        $div2.scrollTop(322);
        $div3.scrollTop(322);
        $div4.scrollTop(1186);

        var click = new ClickAutomation($div4[0], new ClickOptions({ offsetX: 100, offsetY: offsetY }));

        click
            .run()
            .then(function () {
                ok(clicked, 'click was raised');
                startNext();
            });
    });

    module('other functional tests');

    asyncTest('click on element in scrolled container', function () {
        var clicked = false;

        var $div = addDiv(200, 200)
            .width(150)
            .height(150)
            .css({
                overflow: 'scroll'
            });

        var $button = $('<input type="button">')
            .addClass(TEST_ELEMENT_CLASS)
            .css({ marginTop: '400px', marginLeft: '80px' })
            .bind('mousedown', function () {
                clicked = true;
            })
            .appendTo($div);

        var click = new ClickAutomation($button[0], new ClickOptions({ offsetX: 5, offsetY: 5 }));

        click
            .run()
            .then(function () {
                ok(clicked, 'click was raised');
                startNext();
            });
    });

    asyncTest('click after scrolling', function () {
        var clicked = false;

        $el.css({ 'marginTop': '1000px' })
            .click(function () {
                clicked = true;
            });

        var click = new ClickAutomation($el[0], new ClickOptions({ offsetX: 5, offsetY: 5 }));

        click
            .run()
            .then(function () {
                ok(clicked, 'click after scrolling was raised');

                //moving scroll to start position for a next test
                var restoreScrollClick = new ClickAutomation(addDiv(200, 500)[0], new ClickOptions({
                    offsetX: 5,
                    offsetY: 5
                }));

                return restoreScrollClick.run();
            })
            .then(function () {
                start();
            });
    });

    asyncTest('focusing on click', function () {
        var focused = false;

        $el.css({ display: 'none' });

        var $input = addInputElement('text', 'input', 150, 150);

        $input.focus(function () {
            focused = true;
        });


        var click = new ClickAutomation($input[0], new ClickOptions({ offsetX: 5, offsetY: 5 }));

        click
            .run()
            .then(function () {
                ok(focused, 'clicked element focused');
                startNext();
            });
    });

    asyncTest('double click in the same position', function () {
        var clicksCount = 0;
        var el          = $el[0];

        $el.click(function () {
            clicksCount++;
        });

        var firstClick = new ClickAutomation(el, new ClickOptions({ offsetX: 5, offsetY: 5 }));

        firstClick
            .run()
            .then(function () {
                var secondClick = new ClickAutomation(el, new ClickOptions({ offsetX: 5, offsetY: 5 }));

                return secondClick.run();
            })
            .then(function () {
                equal(clicksCount, 2, 'click event was raised twice');

                startNext();
            });
    });

    asyncTest('click with options keys', function () {
        var focused = false;
        var alt     = false;
        var shift   = false;
        var ctrl    = false;
        var meta    = false;

        $el.css({ display: 'none' });

        var $input = addInputElement('text', 'input', 150, 150);

        $input.focus(function () {
            focused = true;
        });

        $input.click(function (e) {
            alt   = e.altKey;
            ctrl  = e.ctrlKey;
            shift = e.shiftKey;
            meta  = e.metaKey;
        });

        var click = new ClickAutomation($input[0], new ClickOptions({
            modifiers: {
                alt:   true,
                ctrl:  true,
                shift: true,
                meta:  true
            },

            offsetX: 5,
            offsetY: 5
        }));

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

    asyncTest('cancel bubble', function () {
        var divClicked = false;
        var btnClicked = false;

        $el.css({ marginTop: '100px', marginLeft: '100px' });

        $el[0].onclick = function (e) {
            e              = e || window.event;
            e.cancelBubble = true;
            btnClicked     = true;
        };

        var $div = addDiv(100, 100)
            .width(150)
            .height(150)
            .click(function () {
                divClicked = true;
            });

        $el.appendTo($div);

        var click = new ClickAutomation($el[0], new ClickOptions({ offsetX: 5, offsetY: 5 }));

        click
            .run()
            .then(function () {
                equal(btnClicked, true, 'button clicked');
                equal(divClicked, false, 'bubble canceled');

                startNext();
            });
    });

    asyncTest('click on outer element raises event for inner element', function () {
        var divClicked = false;
        var btnClicked = false;

        var $div = addDiv(400, 400)
            .width(70)
            .height(30)
            .click(function () {
                divClicked = true;
            });

        $el
            .css({
                marginTop:  '10px',
                marginLeft: '10px',
                position:   'relative'
            })
            .click(function () {
                btnClicked = true;
            })
            .appendTo($div);

        var click = new ClickAutomation($div[0], new ClickOptions({ offsetX: 15, offsetY: 15 }));

        click
            .run()
            .then(function () {
                equal(btnClicked, true, 'button clicked');
                equal(divClicked, true, 'div clicked');

                startNext();
            });
    });

    asyncTest('click with positive offsets', function () {
        var eventPoint = null;

        $el.css({
            width:  '100px',
            height: '100px',
            border: '0px'
        });

        $el.click(function (e) {
            eventPoint = { x: e.pageX, y: e.pageY };
        });

        var el      = $el[0];
        var offsets = getOffsetOptions($el[0], 20, 20);
        var click   = new ClickAutomation($el[0], new ClickOptions({
            offsetX: offsets.offsetX,
            offsetY: offsets.offsetY
        }));

        click
            .run()
            .then(function () {
                var expectedPoint = { x: el.offsetLeft + 20, y: el.offsetTop + 20 };

                deepEqual(eventPoint, expectedPoint, 'event point is correct');
                startNext();
            });
    });

    asyncTest('click with negative offsets', function () {
        var eventPoint = null;

        $el.css({
            width:  '100px',
            height: '100px',
            border: '0px'
        });

        $el.click(function (e) {
            eventPoint = { x: e.pageX, y: e.pageY };
        });

        var el      = $el[0];
        var offsets = getOffsetOptions($el[0], -20, -20);
        var click   = new ClickAutomation($el[0], new ClickOptions({
            offsetX: offsets.offsetX,
            offsetY: offsets.offsetY
        }));

        click
            .run()
            .then(function () {
                var expectedPoint = {
                    x: el.offsetLeft + el.offsetWidth - 20,
                    y: el.offsetTop + el.offsetHeight - 20
                };

                deepEqual(eventPoint, expectedPoint, 'event point is correct');
                startNext();
            });
    });

    module('regression');

    asyncTest('Q558721 - Test running hangs if element is hidden in non-scrollable container', function () {
        var clickRaised = false;
        var $container  = $('<div></div>')
            .addClass(TEST_ELEMENT_CLASS)
            .css({
                width:      100,
                height:     100,
                overflow:   'hidden',
                border:     '1px solid green',
                marginLeft: 50
            })
            .appendTo('body');

        var $button = $('<button>Button</button>')
            .css({
                position: 'relative',
                left:     -60
            }).appendTo($container);

        $(document).click(function () {
            clickRaised = true;
        });

        var click = new ClickAutomation($button[0], new ClickOptions({ offsetX: 10, offsetY: 10 }));

        click
            .run()
            .then(function () {
                equal(clickRaised, true, 'button clicked');
                startNext();
            });
    });

    asyncTest('B253520 - Blur event is not raised during click playback if previous active element becomes invisible via css on mousedown handler in IE9', function () {
        var $input           = $('<input type="text"/>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $button          = $('<input type="button"/>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var inputBlurHandled = false;

        var waitUntilCssApply = function () {
            if ($input[0].getBoundingClientRect().width > 0) {
                var timeout      = 2;
                var startSeconds = (new Date()).getSeconds();
                var endSeconds   = (startSeconds + timeout) % 60;

                while ($input[0].getBoundingClientRect().width > 0) {
                    if ((new Date()).getSeconds() > endSeconds)
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

        var click = new ClickAutomation($button[0], new ClickOptions({ offsetX: 5, offsetY: 5 }));

        click
            .run()
            .then(function () {
                ok(inputBlurHandled, 'check that input blur event was handled');
                startNext();
            });
    });

    asyncTest('mouseup should be called asynchronously after mousedown', function () {
        var timeoutCalled = false;
        var mouseupCalled = false;

        $el.bind('mousedown', function () {
            window.setTimeout(function () {
                timeoutCalled = true;
            }, 0);
        });

        $el.bind('mouseup', function () {
            mouseupCalled = true;
            ok(timeoutCalled, 'check timeout setted in mousedown handler was called before mouseup');
        });

        var click = new ClickAutomation($el[0], new ClickOptions({ offsetX: 5, offsetY: 5 }));

        click
            .run()
            .then(function () {
                ok(mouseupCalled, 'check mouseup was called');
                startNext();
            });
    });

    asyncTest('T163678 - A Click action on a link with a line break does not work', function () {
        var $box    = $('<div></div>').css('width', '128px').appendTo($('body'));
        var $link   = $('<a href="javascript:void(0);">why do I have to break</a>').appendTo($box);
        var clicked = false;

        $box.addClass(TEST_ELEMENT_CLASS);
        $link.click(function () {
            clicked = true;
        });

        var click = new ClickAutomation($link[0], new ClickOptions({ offsetX: 5, offsetY: 5 }));

        click
            .run()
            .then(function () {
                ok(clicked, 'check mouseup was called');
                startNext();
            });
    });

    asyncTest('T224332 - TestCafe problem with click on links in popup menu (click on link with span inside without offset)', function () {
        var $box  = $('<div></div>').css('width', '128px').appendTo($('body'));
        var $link = $('<a href="javascript:void(0);"></a>').appendTo($box);

        $('<span>why do I have to break</span>').appendTo($link);

        var clicked = false;

        $('input').remove();
        $box.addClass(TEST_ELEMENT_CLASS);

        $link.click(function () {
            clicked = true;
        });

        var click = new ClickAutomation($link[0], new ClickOptions());

        click
            .run()
            .then(function () {
                ok(clicked, 'check mouseup was called');
                startNext();
            });
    });

    asyncTest('T224332 - TestCafe problem with click on links in popup menu (click on span inside the link without offset)', function () {
        var $box    = $('<div></div>').css('width', '128px').appendTo($('body'));
        var $link   = $('<a href="javascript:void(0);"></a>').appendTo($box);
        var $span   = $('<span>why do I have to break</span>').appendTo($link);
        var clicked = false;

        $box.addClass(TEST_ELEMENT_CLASS);

        $link.click(function () {
            clicked = true;
        });

        var click = new ClickAutomation($span[0], new ClickOptions());

        click
            .run()
            .then(function () {
                ok(clicked, 'check mouseup was called');
                startNext();
            });
    });

    asyncTest('T191183 - pointer event properties are fixed', function () {
        var mousedownRaised = false;
        var mouseupRaised   = false;
        var clickRaised     = false;

        $el
            .mousedown(function (e) {
                mousedownRaised = true;

                equal(e.button, 0);

                if (browserUtils.isIE || browserUtils.isFirefox)
                    equal(e.buttons, 1);

                ok(!mouseupRaised && !clickRaised, 'mousedown event was raised first');
            })
            .mouseup(function (e) {
                mouseupRaised = true;

                equal(e.button, 0);

                if (browserUtils.isIE || browserUtils.isFirefox)
                    equal(e.buttons, 1);

                ok(mousedownRaised && !clickRaised, 'mouseup event was raised second');
            })
            .click(function (e) {
                clickRaised = true;

                equal(e.button, 0);

                if (browserUtils.isIE || browserUtils.isFirefox)
                    equal(e.buttons, 1);

                ok(mousedownRaised && mouseupRaised, 'click event was raised third ');
            });

        var pointerHandler = function (e) {
            equal(e.pointerType, browserUtils.version > 10 ? 'mouse' : 4);
            equal(e.button, 0);
            equal(e.buttons, 1);
        };

        if (browserUtils.isIE && browserUtils.version > 11) {
            $el[0].onpointerdown = pointerHandler;
            $el[0].onpointerup   = pointerHandler;
        }
        else {
            $el[0].onmspointerdown = pointerHandler;
            $el[0].onmspointerup   = pointerHandler;
        }


        if (browserUtils.isFirefox || browserUtils.isIE9)
            expect(10);
        else if (browserUtils.isIE)
            expect(16);
        else
            expect(7);

        var click = new ClickAutomation($el[0], new ClickOptions({ offsetX: 5, offsetY: 5 }));

        click
            .run()
            .then(function () {
                ok(mousedownRaised && mousedownRaised && clickRaised, 'mouse events were raised');
                startNext();
            });
    });

    asyncTest('T253883 - Playback - It is impossible to type a password', function () {
        $el.css({ display: 'none' });

        var $label = $('<label></label>')
            .attr('for', 'input').addClass(TEST_ELEMENT_CLASS)
            .appendTo('body');

        $('<span>label for input</span>')
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo($label);

        var $input = $('<input />')
            .attr('id', 'input')
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo($label);

        var click = new ClickAutomation($input[0], new ClickOptions({ offsetX: 5, offsetY: 5 }));

        click
            .run()
            .then(function () {
                equal(document.activeElement, $input[0]);
                startNext();
            });
    });

    asyncTest('T299665 - Incorrect click on image with associated map element in Mozilla', function () {
        var $map = $('<map name="map"></map>')
            .appendTo('body')
            .addClass(TEST_ELEMENT_CLASS);

        var $area = $('<area shape="rect" coords="0,0,200,200" title="Area"/>').appendTo($map);

        var $img = $('<img usemap="#map"/>')
            .attr('src', window.QUnitGlobals.getResourceUrl('../../data/runner/img.png'))
            .css({
                width:  '200px',
                height: '200px'
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
            var click = new ClickAutomation($area[0], new ClickOptions({ offsetX: 10, offsetY: 10 }));

            click
                .run()
                .then(function () {
                    ok($area.data('clicked'), 'area element was clicked');
                    notOk($img.data('clicked'), 'img element was not clicked');
                    startNext();
                });
        }, 1500);
    });

    module('touch devices test');
    if (featureDetection.isTouchDevice) {
        asyncTest('touch event on click', function () {
            var event  = null;
            var events = {
                ontouchstart: false,
                ontouchend:   false,
                onmousedown:  false,
                onmouseup:    false,
                onclick:      false
            };

            var bind = function (eventName) {
                $el[0][eventName] = function () {
                    events[eventName] = true;
                };
            };

            for (event in events)
                bind(event);

            var click = new ClickAutomation($el[0], new ClickOptions({ offsetX: 5, offsetY: 5 }));

            click
                .run()
                .then(function () {
                    for (event in events)
                        ok(events[event], event + ' raised');

                    startNext();
                });
        });

        asyncTest('event touch lists length (T170088)', function () {
            var raisedEvents = [];

            var touchEventHandler = function (ev) {
                raisedEvents.push(ev.type);
                equal(ev.touches.length, ev.type === 'touchend' ? 0 : 1);
                equal(ev.targetTouches.length, ev.type === 'touchend' ? 0 : 1);
                equal(ev.changedTouches.length, 1);
            };

            $el[0].ontouchstart = $el[0].ontouchmove = $el[0].ontouchend = touchEventHandler;

            var click = new ClickAutomation($el[0], new ClickOptions({ offsetX: 5, offsetY: 5 }));

            click
                .run()
                .then(function () {
                    ok(raisedEvents.indexOf('touchstart') >= 0);
                    ok(raisedEvents.indexOf('touchend') >= 0);

                    startNext();
                });
        });
    }
});
