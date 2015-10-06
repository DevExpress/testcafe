var hammerhead   = window.getTestCafeModule('hammerhead');
var browserUtils = hammerhead.utils.browser;
var jsProcessor  = hammerhead.jsProcessor;

var testCafeCore = window.getTestCafeModule('testCafeCore');
var SETTINGS     = testCafeCore.get('./settings').get();
var position     = testCafeCore.get('./utils/position');

var testCafeRunner = window.getTestCafeModule('testCafeRunner');
var actionsAPI     = testCafeRunner.get('./api/actions');
var automation     = testCafeRunner.get('./automation/automation');
var StepIterator   = testCafeRunner.get('./step-iterator');

var testCafeUI = window.getTestCafeModule('testCafeUI');
var cursor     = testCafeUI.get('./cursor');


automation.init();
cursor.init();

var stepIterator = new StepIterator();
actionsAPI.init(stepIterator);

$(document).ready(function () {
    var actionTargetWaitingCounter = 0,
        actionRunCounter           = 0;

    StepIterator.prototype.asyncActionSeries = function (items, runArgumentsIterator, action) {
        var seriesActionsRun = function (elements, callback) {
            window.async.forEachSeries(
                elements,
                function (element, seriaCallback) {
                    action(element, seriaCallback);
                },
                function () {
                    callback();
                });
        };

        runArgumentsIterator(items, seriesActionsRun, asyncActionCallback);
    };

    StepIterator.prototype.onActionTargetWaitingStarted = function () {
        actionTargetWaitingCounter++;
    };

    StepIterator.prototype.onActionRun = function () {
        actionRunCounter++;
    };

    stepIterator.on(StepIterator.ERROR_EVENT, function (err) {
        stepIterator.state.stoppedOnFail = false;
        currentErrorCode                 = err.code;
        currentSourceIndex               = err.__sourceIndex;
    });

    var $el,
        currentSourceIndex = null,
        currentErrorCode   = null,
        //constants
        TEST_ELEMENT_CLASS = 'testElement',

        //utils
        asyncActionCallback,

        addInputElement    = function (type, id, x, y) {
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

    //tests
    QUnit.testStart(function () {
        asyncActionCallback        = function () {
        };
        actionTargetWaitingCounter = 0;
        actionRunCounter           = 0;
    });

    QUnit.testDone(function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
        currentErrorCode             = null;
        currentSourceIndex           = null;
        SETTINGS.ENABLE_SOURCE_INDEX = false;
    });

    asyncTest('check mouseover and mouseout event', function () {
        if (browserUtils.hasTouchEvents) {
            expect(0);
            start();
            return;
        }

        var $el1             = addInputElement('button', 'button1', 200, 200),
            $el2             = addInputElement('button', 'button1', 400, 400),

            mouseOver1Raised = false,
            mouseOut1Raised  = false,
            mouseOver2Raised = false;

        $el1.mouseover(function () {
            mouseOver1Raised = true;
        });

        $el1.mouseout(function () {
            mouseOut1Raised = true;
        });

        $el2.mouseover(function () {
            mouseOver2Raised = true;
        });

        asyncActionCallback = function () {
            ok(mouseOver1Raised);

            asyncActionCallback = function () {
                ok(mouseOut1Raised);
                ok(mouseOver2Raised);
                equal(actionTargetWaitingCounter, 2);
                equal(actionRunCounter, 2);
                start();
            };

            actionsAPI.hover($el2);
        };

        actionsAPI.hover($el1);
    });


    asyncTest('T188166 - act.hover trigger "mouseenter" event with "which" parameter 1', function () {
        if (browserUtils.hasTouchEvents) {
            expect(0);
            start();
            return;
        }

        var $el = addInputElement('button', 'button1', 200, 200);

        $el.mouseover(function (e) {
            equal(eval(window[jsProcessor.PROCESS_SCRIPT_METH_NAME]('e.which')), browserUtils.isWebKit ? 0 : 1);
            equal(eval(window[jsProcessor.PROCESS_SCRIPT_METH_NAME]('e.originalEvent.which')), browserUtils.isWebKit ? 0 : 1);
        });

        $el.mouseenter(function (e) {
            equal(eval(window[jsProcessor.PROCESS_SCRIPT_METH_NAME]('e.which')), browserUtils.isWebKit ? 0 : 1);
            equal(eval(window[jsProcessor.PROCESS_SCRIPT_METH_NAME]('e.originalEvent.which')), browserUtils.isWebKit ? 0 : 1);
        });

        $el[0].addEventListener('mouseover', function (e) {
            equal(eval(window[jsProcessor.PROCESS_SCRIPT_METH_NAME]('e.which')), browserUtils.isWebKit ? 0 : 1);
        });

        asyncActionCallback = function () {
            expect(5);
            start();
        };

        actionsAPI.hover($el);
    });

    asyncTest('T191183 - pointer event properties are fixed', function () {
        if (browserUtils.hasTouchEvents) {
            expect(0);
            start();
            return;
        }

        var $el                  = addInputElement('button', 'button1', 400, 400),
            mouseoverRaised      = false,
            mouseoverWhichParam  = null,
            mouseenterRaised     = false,
            mouseenterWhichParam = null;

        $el.mouseover(function (e) {
            mouseoverRaised = true;
            equal(e.button, 0);
            if (browserUtils.isIE || browserUtils.isMozilla)
                equal(e.buttons, 0);
            mouseoverWhichParam = eval(window[jsProcessor.PROCESS_SCRIPT_METH_NAME]('e.which'));
        });

        $el.mouseenter(function (e) {
            mouseenterRaised = true;
            equal(e.button, 0);
            if (browserUtils.isIE || browserUtils.isMozilla)
                equal(e.buttons, 0);
            mouseenterWhichParam = eval(window[jsProcessor.PROCESS_SCRIPT_METH_NAME]('e.which'));
        });

        var pointerHandler = function (e) {
            equal(e.pointerType, browserUtils.version > 10 ? 'mouse' : 4);
            equal(e.button, -1);
            equal(e.buttons, 0);
        };

        if (browserUtils.isIE && browserUtils.version > 11) {
            $el[0].onpointermove = pointerHandler;
            $el[0].onpointerover = pointerHandler;
        }
        else {
            $el[0].onmspointermove = pointerHandler;
            $el[0].onmspointerover = pointerHandler;
        }

        asyncActionCallback = function () {
            ok(mouseoverRaised);
            ok(mouseenterRaised);
            equal(mouseoverWhichParam, browserUtils.isWebKit ? 0 : 1);
            equal(mouseenterWhichParam, browserUtils.isWebKit ? 0 : 1);

            if (browserUtils.isMozilla || browserUtils.isIE9)
                expect(8);
            else if (browserUtils.isIE)
                expect(17);
            else
                expect(6);
            start();
        };

        actionsAPI.hover($el);
    });

    asyncTest('T214458 - The Hover action does not allow specifying mouse action options thus being inconsistent with other actions', function () {
        if (browserUtils.hasTouchEvents) {
            expect(0);
            start();
            return;
        }

        var $el                = addInputElement('button', 'button1', 200, 200),
            elementOffset      = position.getOffsetPosition($el[0]),
            actionOffset       = 10,
            lastMouseMoveEvent = null;

        $el.mousemove(function (e) {
            lastMouseMoveEvent = e;
        });

        asyncActionCallback = function () {
            equal(lastMouseMoveEvent.pageX, elementOffset.left + actionOffset);
            equal(lastMouseMoveEvent.pageY, elementOffset.top + actionOffset);
            ok(lastMouseMoveEvent.shiftKey);

            start();
        };

        actionsAPI.hover($el, { shift: true, offsetX: actionOffset, offsetY: actionOffset });
    });
});
