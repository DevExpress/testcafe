const hammerhead       = window.getTestCafeModule('hammerhead');
const browserUtils     = hammerhead.utils.browser;
const featureDetection = hammerhead.utils.featureDetection;

const testCafeCore     = window.getTestCafeModule('testCafeCore');
const parseKeySequence = testCafeCore.get('./utils/parse-key-sequence');

const testCafeAutomation   = window.getTestCafeModule('testCafeAutomation');
const ClickAutomation      = testCafeAutomation.Click;
const RClickAutomation     = testCafeAutomation.RClick;
const DblClickAutomation   = testCafeAutomation.DblClick;
const SelectTextAutomation = testCafeAutomation.SelectText;
const TypeAutomation       = testCafeAutomation.Type;
const PressAutomation      = testCafeAutomation.Press;

const ClickOptions = testCafeAutomation.get('../../test-run/commands/options').ClickOptions;
const TypeOptions  = testCafeAutomation.get('../../test-run/commands/options').TypeOptions;

testCafeCore.preventRealEvents();

$(document).ready(function () {
    const TEST_ELEMENT_CLASS = 'testElement';

    //utils
    const addInputElement = function (x, y, value) {
        const elementString = ['<input type="text" value="', value, '" />'].join('');

        return $(elementString)
            .css({
                position: 'absolute',
                left:     x + 'px',
                top:      y + 'px'
            })
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo('body');
    };

    const addDiv = function (x, y) {
        return $('<div />')
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

    const createMouseMonitorEventObject = function () {
        return {
            elementOneMousedownRaised:   false,
            elementOneMouseupRaised:     false,
            elementOneClickRaised:       false,
            elementOneRClickRaised:      false,
            elementOneDblClickRaised:    false,
            elementOneContextMenuRaised: false,
            elementOneSelectRaised:      false,
            elementOneMousedownCount:    0,
            elementOneMouseupCount:      0,
            elementOneClickCount:        0,

            elementTwoMousedownRaised:   false,
            elementTwoMouseupRaised:     false,
            elementTwoClickRaised:       false,
            elementTwoRClickRaised:      false,
            elementTwoDblClickRaised:    false,
            elementTwoContextMenuRaised: false,
            elementTwoSelectRaised:      false,
            elementTwoMousedownCount:    0,
            elementTwoMouseupCount:      0,
            elementTwoClickCount:        0
        };
    };

    const createKeyMonitorEventObject = function () {
        return {
            elementsOneKeydownRaised:  false,
            elementsOneKeypressRaised: false,
            elementsOneKeyupRaised:    false,

            elementsTwoKeydownRaised:  false,
            elementsTwoKeypressRaised: false,
            elementsTwoKeyupRaised:    false
        };
    };

    const swapLocationOfElements = function ($el1, $el2) {
        const left1 = $el1.css('left');
        const top1  = $el1.css('top');
        const left2 = $el2.css('left');
        const top2  = $el2.css('top');

        $el1.css({
            left: left2,
            top:  top2
        });

        $el2.css({
            left: left1,
            top:  top1
        });
    };

    const bindMouseHandlersToSwappingElements = function ($el1, $el2, eventName, eventMonitorObject, checkMousemove, toSecondHandler) {
        let isSecondEvent = false;

        $el1.bind('mousedown', function (e) {
            eventMonitorObject.elementOneMousedownRaised = true;
            eventMonitorObject.elementOneMousedownCount++;

            if (e.type === eventName && (!toSecondHandler || isSecondEvent))
                swapLocationOfElements($el1, $el2);

            if (!isSecondEvent && eventName === e.type)
                isSecondEvent = true;
        });

        $el1.bind('mouseup', function (e) {
            eventMonitorObject.elementOneMouseupRaised = true;
            eventMonitorObject.elementOneMouseupCount++;


            if (e.type === eventName && (!toSecondHandler || isSecondEvent))
                swapLocationOfElements($el1, $el2);

            if (!isSecondEvent && eventName === e.type)
                isSecondEvent = true;
        });

        $el1.bind('click', function (e) {
            eventMonitorObject.elementOneClickRaised = true;
            eventMonitorObject.elementOneClickCount++;

            if (e.type === eventName && (!toSecondHandler || isSecondEvent))
                swapLocationOfElements($el1, $el2);

            if (!isSecondEvent && eventName === e.type)
                isSecondEvent = true;
        });

        $el1.bind('contextmenu', function (e) {
            eventMonitorObject.elementOneRClickRaised = true;

            if (e.type === eventName)
                swapLocationOfElements($el1, $el2);
        });

        $el1.bind('dblclick', function (e) {
            eventMonitorObject.elementOneDblClickRaised = true;

            if (e.type === eventName)
                swapLocationOfElements($el1, $el2);
        });

        $el2.bind('mousedown', function () {
            eventMonitorObject.elementTwoMousedownRaised = true;
            eventMonitorObject.elementTwoMousedownCount++;
        });

        $el2.bind('mouseup', function () {
            eventMonitorObject.elementTwoMouseupRaised = true;
            eventMonitorObject.elementTwoMouseupCount++;
        });

        $el2.bind('click', function () {
            eventMonitorObject.elementTwoClickRaised = true;
            eventMonitorObject.elementTwoClickCount++;
        });

        $el2.bind('contextmenu', function () {
            eventMonitorObject.elementTwoRClickRaised = true;

        });

        $el2.bind('dblclick', function () {
            eventMonitorObject.elementTwoDblClickRaised = true;
        });

        if (checkMousemove) {
            $el1.bind('mousemove', function () {
                if (eventMonitorObject.elementOneMousedownRaised && !eventMonitorObject.elementOneMouseupRaised ||
                    eventMonitorObject.elementTwoMousedownRaised && !eventMonitorObject.elementTwoMouseupRaised)
                    eventMonitorObject.elementOneSelectRaised = true;
            });

            $el2.bind('mousemove', function () {
                if (eventMonitorObject.elementOneMousedownRaised && !eventMonitorObject.elementOneMouseupRaised ||
                    eventMonitorObject.elementTwoMousedownRaised && !eventMonitorObject.elementTwoMouseupRaised)
                    eventMonitorObject.elementTwoSelectRaised = true;
            });
        }
    };

    const bindKeyHandlersToSwappingElements = function ($el1, $el2, eventName, eventMonitorObject) {
        $el1.bind('keydown', function (e) {
            eventMonitorObject.elementsOneKeydownRaised = true;

            if (e.type === eventName)
                $el2.focus();
        });

        $el1.bind('keypress', function (e) {
            eventMonitorObject.elementsOneKeypressRaised = true;

            if (e.type === eventName)
                $el2.focus();
        });

        $el1.bind('keyup', function (e) {
            eventMonitorObject.elementsOneKeyupRaised = true;

            if (e.type === eventName)
                $el2.focus();
        });


        $el2.bind('keydown', function () {
            eventMonitorObject.elementsTwoKeydownRaised = true;
        });

        $el2.bind('keypress', function () {
            eventMonitorObject.elementsTwoKeypressRaised = true;
        });

        $el2.bind('keyup', function () {
            eventMonitorObject.elementsTwoKeyupRaised = true;
        });
    };

    const bindHandlerToTouchEvents = function ($el1, $el2, eventName, eventMonitorObject, checkMousemove) {
        $el1.bind('touchstart', function (e) {
            eventMonitorObject.elementOneMousedownRaised = true;
            eventMonitorObject.elementOneMousedownCount++;

            if (eventName === e.type)
                swapLocationOfElements($el1, $el2);
        });

        $el1.bind('touchend', function (e) {
            eventMonitorObject.elementOneMouseupRaised = true;
            eventMonitorObject.elementOneMouseupCount++;

            if (eventName === e.type)
                swapLocationOfElements($el1, $el2);
        });

        $el1.bind('click', function (e) {
            eventMonitorObject.elementOneClickRaised = true;
            eventMonitorObject.elementOneClickCount++;

            if (eventName === e.type)
                swapLocationOfElements($el1, $el2);
        });

        $el2.bind('touchstart', function (e) {
            eventMonitorObject.elementTwoMousedownRaised = true;
            eventMonitorObject.elementTwoMousedownCount++;

            if (eventName === e.type)
                swapLocationOfElements($el1, $el2);
        });

        $el2.bind('touchend', function (e) {
            eventMonitorObject.elementTwoMouseupRaised = true;
            eventMonitorObject.elementTwoMouseupCount++;

            if (eventName === e.type)
                swapLocationOfElements($el1, $el2);
        });

        $el2.bind('click', function (e) {
            eventMonitorObject.elementTwoClickRaised = true;
            eventMonitorObject.elementTwoClickCount++;

            if (eventName === e.type)
                swapLocationOfElements($el1, $el2);
        });

        if (checkMousemove) {
            $el1.bind('touchmove', function () {
                if (eventMonitorObject.elementOneMousedownRaised && !eventMonitorObject.elementOneMouseupRaised ||
                    eventMonitorObject.elementTwoMousedownRaised && !eventMonitorObject.elementTwoMouseupRaised)
                    eventMonitorObject.elementOneSelectRaised = true;
            });

            $el2.bind('touchmove', function () {
                if (eventMonitorObject.elementOneMousedownRaised && !eventMonitorObject.elementOneMouseupRaised ||
                    eventMonitorObject.elementTwoMousedownRaised && !eventMonitorObject.elementTwoMouseupRaised)
                    eventMonitorObject.elementTwoSelectRaised = true;
            });
        }
    };

    const createIFrame = function ($element, src, callback) {
        const $iFrame = $('<iframe/>')
            .attr('src', src)
            .css({
                width:  '600px',
                height: '600px'
            })
            .addClass(TEST_ELEMENT_CLASS);

        $element.addClass(TEST_ELEMENT_CLASS);

        const onLoadHandler = function () {
            $($iFrame[0].contentWindow.document.body).append($element);
            $iFrame.unbind('load', onLoadHandler);
            callback();
        };

        $iFrame.bind('load', onLoadHandler);
        $iFrame.appendTo($('body'));
    };

    //tests
    QUnit.testDone(function () {
        if (!browserUtils.isIE)
            removeTestElements();
    });

    module('detection element under cursor after events simulation');

    asyncTest('click - change element on "mousedown" event', function () {
        const eventMonitorObject = createMouseMonitorEventObject();

        const $div1 = addDiv(100, 100).css('background-color', 'red');
        const $div2 = addDiv(100, 300).css('background-color', 'green');

        bindMouseHandlersToSwappingElements($div1, $div2, 'mousedown', eventMonitorObject);

        const click = new ClickAutomation($div1[0], new ClickOptions());

        click
            .run()
            .then(function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(!eventMonitorObject.elementOneMouseupRaised);
                ok(!eventMonitorObject.elementOneClickRaised);

                ok(!eventMonitorObject.elementTwoMousedownRaised);
                ok(eventMonitorObject.elementTwoMouseupRaised);
                ok(!eventMonitorObject.elementTwoClickRaised);

                startNext();
            });
    });

    asyncTest('click - change element on "mouseup" event', function () {
        const eventMonitorObject = createMouseMonitorEventObject();

        const $div1 = addDiv(100, 100).css('background-color', 'red');
        const $div2 = addDiv(100, 300).css('background-color', 'green');

        bindMouseHandlersToSwappingElements($div1, $div2, 'mouseup', eventMonitorObject);

        const click = new ClickAutomation($div1[0], new ClickOptions());

        click
            .run()
            .then(function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(eventMonitorObject.elementOneMouseupRaised);
                ok(eventMonitorObject.elementOneClickRaised);

                ok(!eventMonitorObject.elementTwoMousedownRaised);
                ok(!eventMonitorObject.elementTwoMouseupRaised);
                ok(!eventMonitorObject.elementTwoClickRaised);

                startNext();
            });
    });

    asyncTest('click - change element on "click" event', function () {
        const eventMonitorObject = createMouseMonitorEventObject();

        const $div1 = addDiv(100, 100).css('background-color', 'red');
        const $div2 = addDiv(100, 300).css('background-color', 'green');

        bindMouseHandlersToSwappingElements($div1, $div2, 'click', eventMonitorObject);

        const click = new ClickAutomation($div1[0], new ClickOptions());

        click
            .run()
            .then(function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(eventMonitorObject.elementOneMouseupRaised);
                ok(eventMonitorObject.elementOneClickRaised);

                ok(!eventMonitorObject.elementTwoMousedownRaised);
                ok(!eventMonitorObject.elementTwoMouseupRaised);
                ok(!eventMonitorObject.elementTwoClickRaised);

                startNext();
            });
    });


    asyncTest('rclick - change element on "mousedown" event', function () {
        const eventMonitorObject = createMouseMonitorEventObject();

        const $div1 = addDiv(100, 100).css('background-color', 'red');
        const $div2 = addDiv(100, 300).css('background-color', 'green');

        bindMouseHandlersToSwappingElements($div1, $div2, 'mousedown', eventMonitorObject);

        const rclick = new RClickAutomation($div1[0], new ClickOptions());

        rclick
            .run()
            .then(function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(!eventMonitorObject.elementOneMouseupRaised);
                ok(!eventMonitorObject.elementOneRClickRaised);

                ok(!eventMonitorObject.elementTwoMousedownRaised);
                ok(eventMonitorObject.elementTwoMouseupRaised);
                ok(eventMonitorObject.elementTwoRClickRaised);

                startNext();
            });
    });

    asyncTest('rclick - change element on "mouseup" event', function () {
        const eventMonitorObject = createMouseMonitorEventObject();

        const $div1 = addDiv(100, 100).css('background-color', 'red');
        const $div2 = addDiv(100, 300).css('background-color', 'green');

        bindMouseHandlersToSwappingElements($div1, $div2, 'mouseup', eventMonitorObject);

        const rclick = new RClickAutomation($div1[0], new ClickOptions());

        rclick
            .run()
            .then(function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(eventMonitorObject.elementOneMouseupRaised);
                ok(!eventMonitorObject.elementOneRClickRaised);

                ok(!eventMonitorObject.elementTwoMousedownRaised);
                ok(!eventMonitorObject.elementTwoMouseupRaised);
                ok(eventMonitorObject.elementTwoRClickRaised);

                startNext();
            });
    });

    asyncTest('rclick - change element on "contextmenu" event', function () {
        const eventMonitorObject = createMouseMonitorEventObject();

        const $div1 = addDiv(100, 100).css('background-color', 'red');
        const $div2 = addDiv(100, 300).css('background-color', 'green');

        bindMouseHandlersToSwappingElements($div1, $div2, 'contextmenu', eventMonitorObject);

        const rclick = new RClickAutomation($div1[0], new ClickOptions());

        rclick
            .run()
            .then(function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(eventMonitorObject.elementOneMouseupRaised);
                ok(eventMonitorObject.elementOneRClickRaised);

                ok(!eventMonitorObject.elementTwoMousedownRaised);
                ok(!eventMonitorObject.elementTwoMouseupRaised);
                ok(!eventMonitorObject.elementTwoRClickRaised);

                startNext();
            });
    });


    asyncTest('select - change element on "mousedown" event', function () {
        const eventMonitorObject = createMouseMonitorEventObject();

        const $input1 = addInputElement(200, 200, '12345');
        const $input2 = addInputElement(400, 400, 'qwerty');

        if (featureDetection.isTouchDevice)
            bindHandlerToTouchEvents($input1, $input2, 'touchstart', eventMonitorObject, true);
        else
            bindMouseHandlersToSwappingElements($input1, $input2, 'mousedown', eventMonitorObject, true);

        const selectText = new SelectTextAutomation($input1[0], 2, 4, {});

        selectText
            .run()
            .then(function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(!eventMonitorObject.elementOneSelectRaised);
                ok(!eventMonitorObject.elementOneMouseupRaised);

                ok(!eventMonitorObject.elementTwoMousedownRaised);

                if (!featureDetection.isTouchDevice)
                    ok(eventMonitorObject.elementTwoSelectRaised);

                ok(eventMonitorObject.elementTwoMouseupRaised);

                startNext();
            });
    });

    asyncTest('select - change element on "mouseup" event', function () {
        const eventMonitorObject = createMouseMonitorEventObject();

        const $input1 = addInputElement(200, 200, '12345');
        const $input2 = addInputElement(400, 400, 'qwerty');

        if (featureDetection.isTouchDevice)
            bindHandlerToTouchEvents($input1, $input2, 'touchend', eventMonitorObject, true);
        else
            bindMouseHandlersToSwappingElements($input1, $input2, 'mouseup', eventMonitorObject, true);

        const selectText = new SelectTextAutomation($input1[0], 2, 4, {});

        selectText
            .run()
            .then(function () {
                ok(eventMonitorObject.elementOneMousedownRaised);

                if (!featureDetection.isTouchDevice)
                    ok(eventMonitorObject.elementOneSelectRaised);

                ok(eventMonitorObject.elementOneMouseupRaised);

                ok(!eventMonitorObject.elementTwoMousedownRaised);
                ok(!eventMonitorObject.elementTwoSelectRaised);
                ok(!eventMonitorObject.elementTwoMouseupRaised);

                startNext();
            });
    });


    asyncTest('dblclick - change element on first "mousedown" event', function () {
        const eventMonitorObject = createMouseMonitorEventObject();

        const $div1 = addDiv(100, 100).css('background-color', 'red');
        const $div2 = addDiv(100, 300).css('background-color', 'green');

        bindMouseHandlersToSwappingElements($div1, $div2, 'mousedown', eventMonitorObject);

        const dblclick = new DblClickAutomation($div1[0], new ClickOptions());

        dblclick
            .run()
            .then(function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(!eventMonitorObject.elementOneMouseupRaised);
                ok(!eventMonitorObject.elementOneClickRaised);
                ok(!eventMonitorObject.elementOneDblClickRaised);
                equal(eventMonitorObject.elementOneMousedownCount, 1);

                ok(eventMonitorObject.elementTwoMousedownRaised);
                ok(eventMonitorObject.elementTwoMouseupRaised);
                ok(eventMonitorObject.elementTwoClickRaised);
                ok(eventMonitorObject.elementTwoDblClickRaised);
                equal(eventMonitorObject.elementTwoMousedownCount, 1);
                equal(eventMonitorObject.elementTwoMouseupCount, 2);
                equal(eventMonitorObject.elementTwoClickCount, 1);

                startNext();
            });
    });

    asyncTest('dblclick - change element on first "mouseup" event', function () {
        const eventMonitorObject = createMouseMonitorEventObject();

        const $div1 = addDiv(100, 100).css('background-color', 'red');
        const $div2 = addDiv(100, 300).css('background-color', 'green');

        bindMouseHandlersToSwappingElements($div1, $div2, 'mouseup', eventMonitorObject);

        const dblclick = new DblClickAutomation($div1[0], new ClickOptions());

        dblclick
            .run()
            .then(function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(eventMonitorObject.elementOneMouseupRaised);
                ok(eventMonitorObject.elementOneClickRaised);
                ok(!eventMonitorObject.elementOneDblClickRaised);
                equal(eventMonitorObject.elementOneMousedownCount, 1);
                equal(eventMonitorObject.elementOneMouseupCount, 1);
                equal(eventMonitorObject.elementOneClickCount, 1);

                ok(eventMonitorObject.elementTwoMousedownRaised);
                ok(eventMonitorObject.elementTwoMouseupRaised);
                ok(eventMonitorObject.elementTwoClickRaised);
                ok(eventMonitorObject.elementTwoDblClickRaised);
                equal(eventMonitorObject.elementTwoMousedownCount, 1);
                equal(eventMonitorObject.elementTwoMouseupCount, 1);
                equal(eventMonitorObject.elementTwoClickCount, 1);

                startNext();
            });
    });

    asyncTest('dblclick - change element on first "click" event', function () {
        const eventMonitorObject = createMouseMonitorEventObject();

        const $div1 = addDiv(100, 100).css('background-color', 'red');
        const $div2 = addDiv(100, 300).css('background-color', 'green');

        bindMouseHandlersToSwappingElements($div1, $div2, 'click', eventMonitorObject);

        const dblclick = new DblClickAutomation($div1[0], new ClickOptions());

        dblclick
            .run()
            .then(function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(eventMonitorObject.elementOneMouseupRaised);
                ok(eventMonitorObject.elementOneClickRaised);
                ok(!eventMonitorObject.elementOneDblClickRaised);
                equal(eventMonitorObject.elementOneMousedownCount, 1);
                equal(eventMonitorObject.elementOneMouseupCount, 1);
                equal(eventMonitorObject.elementOneClickCount, 1);

                ok(eventMonitorObject.elementTwoMousedownRaised);
                ok(eventMonitorObject.elementTwoMouseupRaised);
                ok(eventMonitorObject.elementTwoClickRaised);
                ok(eventMonitorObject.elementTwoDblClickRaised);
                equal(eventMonitorObject.elementTwoMousedownCount, 1);
                equal(eventMonitorObject.elementTwoMouseupCount, 1);
                equal(eventMonitorObject.elementTwoClickCount, 1);

                startNext();
            });
    });

    asyncTest('dblclick - change element on second "mousedown" event', function () {
        const eventMonitorObject = createMouseMonitorEventObject();

        const $div1 = addDiv(100, 100).css('background-color', 'red');
        const $div2 = addDiv(100, 300).css('background-color', 'green');

        bindMouseHandlersToSwappingElements($div1, $div2, 'mousedown', eventMonitorObject, false, true);

        const dblclick = new DblClickAutomation($div1[0], new ClickOptions());

        dblclick
            .run()
            .then(function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(eventMonitorObject.elementOneMouseupRaised);
                ok(eventMonitorObject.elementOneClickRaised);
                ok(!eventMonitorObject.elementOneDblClickRaised);
                equal(eventMonitorObject.elementOneMousedownCount, 2);
                equal(eventMonitorObject.elementOneMouseupCount, 1);
                equal(eventMonitorObject.elementOneClickCount, 1);

                ok(!eventMonitorObject.elementTwoMousedownRaised);
                ok(eventMonitorObject.elementTwoMouseupRaised);
                ok(!eventMonitorObject.elementTwoClickRaised);
                ok(!eventMonitorObject.elementTwoDblClickRaised);
                equal(eventMonitorObject.elementTwoMouseupCount, 1);

                startNext();
            });
    });

    asyncTest('dblclick - change element on second "mouseup" event', function () {
        const eventMonitorObject = createMouseMonitorEventObject();

        const $div1 = addDiv(100, 100).css('background-color', 'red');
        const $div2 = addDiv(100, 300).css('background-color', 'green');

        bindMouseHandlersToSwappingElements($div1, $div2, 'mouseup', eventMonitorObject, false, true);

        const dblclick = new DblClickAutomation($div1[0], new ClickOptions());

        dblclick
            .run()
            .then(function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(eventMonitorObject.elementOneMouseupRaised);
                ok(eventMonitorObject.elementOneClickRaised);
                ok(eventMonitorObject.elementOneDblClickRaised);
                equal(eventMonitorObject.elementOneMousedownCount, 2);
                equal(eventMonitorObject.elementOneMouseupCount, 2);
                equal(eventMonitorObject.elementOneClickCount, 2);

                ok(!eventMonitorObject.elementTwoMousedownRaised);
                ok(!eventMonitorObject.elementTwoMouseupRaised);
                ok(!eventMonitorObject.elementTwoClickRaised);
                ok(!eventMonitorObject.elementTwoDblClickRaised);

                startNext();
            });
    });

    asyncTest('dblclick - change element on second "click" event', function () {
        const eventMonitorObject = createMouseMonitorEventObject();

        const $div1 = addDiv(100, 100).css('background-color', 'red');
        const $div2 = addDiv(100, 300).css('background-color', 'green');

        bindMouseHandlersToSwappingElements($div1, $div2, 'click', eventMonitorObject, false, true);

        const dblclick = new DblClickAutomation($div1[0], new ClickOptions());

        dblclick
            .run()
            .then(function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(eventMonitorObject.elementOneMouseupRaised);
                ok(eventMonitorObject.elementOneClickRaised);
                ok(eventMonitorObject.elementOneDblClickRaised);
                equal(eventMonitorObject.elementOneMousedownCount, 2);
                equal(eventMonitorObject.elementOneMouseupCount, 2);
                equal(eventMonitorObject.elementOneClickCount, 2);

                ok(!eventMonitorObject.elementTwoMousedownRaised);
                ok(!eventMonitorObject.elementTwoMouseupRaised);
                ok(!eventMonitorObject.elementTwoClickRaised);
                ok(!eventMonitorObject.elementTwoDblClickRaised);

                startNext();
            });
    });

    asyncTest('dblclick - change element on "dblclick" event', function () {
        const eventMonitorObject = createMouseMonitorEventObject();

        const $div1 = addDiv(100, 100).css('background-color', 'red');
        const $div2 = addDiv(100, 300).css('background-color', 'green');

        bindMouseHandlersToSwappingElements($div1, $div2, 'dblclick', eventMonitorObject);

        const dblclick = new DblClickAutomation($div1[0], new ClickOptions());

        dblclick
            .run()
            .then(function () {
                ok(eventMonitorObject.elementOneMousedownRaised);
                ok(eventMonitorObject.elementOneMouseupRaised);
                ok(eventMonitorObject.elementOneClickRaised);
                ok(eventMonitorObject.elementOneDblClickRaised);
                equal(eventMonitorObject.elementOneMousedownCount, 2);
                equal(eventMonitorObject.elementOneMouseupCount, 2);
                equal(eventMonitorObject.elementOneClickCount, 2);

                ok(!eventMonitorObject.elementTwoMousedownRaised);
                ok(!eventMonitorObject.elementTwoMouseupRaised);
                ok(!eventMonitorObject.elementTwoClickRaised);
                ok(!eventMonitorObject.elementTwoDblClickRaised);

                startNext();
            });
    });


    asyncTest('type - change element on "keydown" event', function () {
        const eventMonitorObject = createKeyMonitorEventObject();

        const $input1 = addInputElement(200, 200, '');
        const $input2 = addInputElement(400, 400, '');

        bindKeyHandlersToSwappingElements($input1, $input2, 'keydown', eventMonitorObject);

        const type = new TypeAutomation($input1[0], 'a', new TypeOptions({ offsetX: 5, offsetY: 5 }));

        type
            .run()
            .then(function () {
                const expectedEventMonitorObject = {
                    elementsOneKeydownRaised:  true,
                    elementsOneKeypressRaised: false,
                    elementsOneKeyupRaised:    false,

                    elementsTwoKeydownRaised:  false,
                    elementsTwoKeypressRaised: true && !browserUtils.isAndroid,
                    elementsTwoKeyupRaised:    true
                };

                deepEqual(eventMonitorObject, expectedEventMonitorObject);

                equal($input1[0].value, '');
                equal($input2[0].value, 'a');

                startNext();
            });
    });

    asyncTest('type - change element on "keypress" event', function () {
        const eventMonitorObject = createKeyMonitorEventObject();

        const $input1 = addInputElement(200, 200, '');
        const $input2 = addInputElement(400, 400, '');

        bindKeyHandlersToSwappingElements($input1, $input2, 'keypress', eventMonitorObject);

        const type = new TypeAutomation($input1[0], 'a', new TypeOptions({ offsetX: 5, offsetY: 5 }));

        type
            .run()
            .then(function () {
                const expectedEventMonitorObject = {
                    elementsOneKeydownRaised:  true,
                    elementsOneKeypressRaised: true && !browserUtils.isAndroid,
                    elementsOneKeyupRaised:    browserUtils.isAndroid,

                    elementsTwoKeydownRaised:  false,
                    elementsTwoKeypressRaised: false,
                    elementsTwoKeyupRaised:    true && !browserUtils.isAndroid
                };

                deepEqual(eventMonitorObject, expectedEventMonitorObject);

                equal($input1[0].value, 'a');
                equal($input2[0].value, '');

                startNext();
            });
    });

    asyncTest('type - change element on "keyup" event', function () {
        const eventMonitorObject = createKeyMonitorEventObject();

        const $input1 = addInputElement(200, 200, '');
        const $input2 = addInputElement(400, 400, '');

        bindKeyHandlersToSwappingElements($input1, $input2, 'keyup', eventMonitorObject);

        const type = new TypeAutomation($input1[0], 'a', new TypeOptions({ offsetX: 5, offsetY: 5 }));

        type
            .run()
            .then(function () {
                const expectedEventMonitorObject = {
                    elementsOneKeydownRaised:  true,
                    elementsOneKeypressRaised: true && !browserUtils.isAndroid,
                    elementsOneKeyupRaised:    true,

                    elementsTwoKeydownRaised:  false,
                    elementsTwoKeypressRaised: false,
                    elementsTwoKeyupRaised:    false
                };

                deepEqual(eventMonitorObject, expectedEventMonitorObject);

                equal($input1[0].value, 'a');
                equal($input2[0].value, '');

                startNext();
            });
    });

    asyncTest('T210448: Unnecessary typing occurs if element was changed after keypress event', function () {
        const iFrameSrc    = window.QUnitGlobals.getResourceUrl('../../data/runner/iframe.html');
        const $inputIFrame = $('<input />');

        const testActions = function () {
            window.setTimeout(function () {
                $(document).bind('keypress', function () {
                    $inputIFrame.focus();
                });

                const press = new PressAutomation(parseKeySequence('f').combinations, {});

                press
                    .run()
                    .then(function () {
                        equal($inputIFrame[0].value, browserUtils.isWebKit ||
                                                     browserUtils.isFirefox ? '' : 'f', 'iframe\'s input value is correct');

                        startNext();
                    });
            });
        };

        createIFrame($inputIFrame, iFrameSrc, testActions);
    });
});
