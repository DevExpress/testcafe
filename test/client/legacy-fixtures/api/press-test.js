var hammerhead    = window.getTestCafeModule('hammerhead');
var browserUtils  = hammerhead.utils.browser;
var iframeSandbox = hammerhead.sandbox.iframe;

var testCafeCore  = window.getTestCafeModule('testCafeCore');
var domUtils      = testCafeCore.get('./utils/dom');
var textSelection = testCafeCore.get('./utils/text-selection');

var testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
var ERROR_TYPE           = testCafeLegacyRunner.get('../test-run-error/type');
var SETTINGS             = testCafeLegacyRunner.get('./settings').get();
var actionsAPI           = testCafeLegacyRunner.get('./api/actions');
var StepIterator         = testCafeLegacyRunner.get('./step-iterator');

var initAutomation = testCafeLegacyRunner.get('./init-automation');

initAutomation();

var Promise      = hammerhead.Promise;
var stepIterator = new StepIterator();

actionsAPI.init(stepIterator);

$(document).ready(function () {
    var asyncActionCallback;
    var currentErrorType   = null;
    var currentSourceIndex = null;
    var $input;

    //constants
    var TEST_ELEMENT_CLASS = 'testElement';
    var TEST_TIMEOUT       = 2000;

    //utils
    var runAsyncTest = function (actions, assertions, timeout, delayBeforeAssertions) {
        var timeoutId        = null;
        var callbackFunction = function () {
            clearTimeout(timeoutId);
            assertions();
            start();
        };

        asyncActionCallback = function () {
            window.setTimeout(callbackFunction, delayBeforeAssertions || 0);
        };
        actions();
        timeoutId = setTimeout(function () {
            callbackFunction = function () {
            };
            ok(false, 'Timeout is exceeded');
            start();
        }, timeout);
    };

    var createIFrame = function (src) {
        var $iframe = $('<iframe/>')
            .css({
                width:  '600px',
                height: '600px'
            })
            .addClass(TEST_ELEMENT_CLASS);

        $iframe[0].setAttribute('src', src);

        return $iframe[0];
    };

    var waitForIframeReloaded = function (iframe) {
        var iframeUnloadPromise = new Promise(function (resolve) {
            iframe.contentWindow.addEventListener('unload', resolve);
        });

        return iframeUnloadPromise.then(function () {
            return window.QUnitGlobals.waitForIframe(iframe);
        });
    };

    var wait = function (ms) {
        return new Promise(function (resolve) {
            window.setTimeout(resolve, ms);
        });
    };

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

    stepIterator.on(StepIterator.ERROR_EVENT, function (err) {
        stepIterator.state.stoppedOnFail = false;
        currentErrorType                 = err.type;
        currentSourceIndex               = err.__sourceIndex;
    });

    //tests
    QUnit.testStart(function () {
        $input          = $('<input type="text" id="input" class="input"/>').addClass(TEST_ELEMENT_CLASS).appendTo($('body'));
        $input[0].value = 'test';
        $input[0].focus();
        textSelection.select($input[0], 4, 4);
        asyncActionCallback = function () {
        };
        iframeSandbox.on(iframeSandbox.RUN_TASK_SCRIPT_EVENT, window.initIFrameTestHandler);
        iframeSandbox.off(iframeSandbox.RUN_TASK_SCRIPT_EVENT, iframeSandbox.iframeReadyToInitHandler);
    });

    QUnit.testDone(function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
        currentErrorType             = null;
        currentSourceIndex           = null;
        SETTINGS.ENABLE_SOURCE_INDEX = false;
        iframeSandbox.off(iframeSandbox.RUN_TASK_SCRIPT_EVENT, window.initIFrameTestHandler);
    });

    module('parse keys string');

    asyncTest('press correct symbol', function () {
        runAsyncTest(
            function () {
                actionsAPI.press('a');
            },
            function () {
                equal(currentErrorType, null);
            },
            TEST_TIMEOUT
        );
    });

    asyncTest('press correct symbol with spaces', function () {
        runAsyncTest(
            function () {
                actionsAPI.press('a ');
            },
            function () {
                equal(currentErrorType, null);
            },
            TEST_TIMEOUT
        );
    });

    asyncTest('press correct keys combination', function () {
        runAsyncTest(
            function () {
                actionsAPI.press('g h g+h  f t');
            },
            function () {
                equal(currentErrorType, null);
            },
            3000
        );
    });

    asyncTest('press correct keys combination with shortcuts', function () {
        runAsyncTest(
            function () {
                actionsAPI.press('g home g+h  f t left+right');
            },
            function () {
                equal(currentErrorType, null);
            },
            3000
        );
    });

    asyncTest('press incorrect keys combination', function () {
        SETTINGS.ENABLE_SOURCE_INDEX = true;
        actionsAPI.press('incorrect', '#11');
        setTimeout(function () {
            equal(currentErrorType, ERROR_TYPE.incorrectPressActionArgument);
            equal(currentSourceIndex, 11);

            start();
        }, 300);
    });

    asyncTest('Press action should only accept a string as an argument', function () {
        actionsAPI.press(100);

        setTimeout(function () {
            equal(currentErrorType, ERROR_TYPE.incorrectPressActionArgument);

            start();
        }, 300);
    });

    module('Regression tests');

    asyncTest('B238757 - It is impossible to record and run \'press\' action with \'+\' key', function () {
        runAsyncTest(
            function () {
                actionsAPI.press('+');
            },
            function () {
                equal($input[0].value, 'test+');
            },
            TEST_TIMEOUT
        );
    });

    asyncTest('B253200 - TestCafe doesn\'t emulate browsers behavior for press "enter" key on the focused HyperLink editor (link with href)', function () {
        var iFrameSrc    = window.QUnitGlobals.getResourceUrl('../../data/runner/iframe.html', 'runner-iframe.html');
        var linkHref     = window.QUnitGlobals.getResourceUrl('../../data/focus-blur-change/iframe.html', 'focus-iframe.html');
        var link         = $('<a>Link</a>').attr('href', linkHref).addClass(TEST_ELEMENT_CLASS)[0];
        var iframe       = createIFrame(iFrameSrc);
        var clicked      = false;
        var testFinished = false;

        link.onclick = function () {
            clicked = true;
        };

        var watchdog = wait(10000);

        var runTest = function () {
            return window.QUnitGlobals
                .waitForIframe(iframe)
                .then(function () {
                    equal(iframe.contentWindow.location.pathname, '/sessionId!i/https://example.com/test-resource/runner-iframe.html', 'path is correct before click on link');

                    iframe.contentDocument.body.appendChild(link);
                    link.focus();

                    // NOTE: we need setTimeout to wait for focus in IE
                    return wait(browserUtils.isIE ? 1000 : 0);
                })
                .then(function () {
                    equal(domUtils.getActiveElement(), iframe);
                    equal(domUtils.getActiveElement(iframe.contentDocument), link);

                    actionsAPI.press('enter');

                    return waitForIframeReloaded(iframe);
                })
                .then(function () {
                    equal(iframe.contentWindow.location.pathname, '/sessionId!i/https://example.com/test-resource/focus-iframe.html', 'path is correct after click on link');
                    ok(clicked);

                    testFinished = true;
                });
        };

        Promise
            .race([watchdog, runTest()])
            .then(function () {
                if (!testFinished)
                    ok(false, 'Test timeout is exceed');

                start();
            });

        document.body.appendChild(iframe);
    });

    asyncTest('B253200 - TestCafe doesn\'t emulate browsers behavior for press "enter" key on the focused HyperLink editor (link with javascript)', function () {
        var iFrameSrc    = window.QUnitGlobals.getResourceUrl('../../data/runner/iframe.html', 'runner-iframe.html');
        var linkHref     = window.QUnitGlobals.getResourceUrl('../../data/focus-blur-change/iframe.html', 'focus-iframe.html');
        var link         = $('<a>Link</a>').attr('href', 'javascript: window.location.href = "' + linkHref + '"')[0];
        var iframe       = createIFrame(iFrameSrc);
        var clicked      = false;
        var testFinished = false;

        link.onclick = function () {
            clicked = true;
        };

        var watchdog = wait(10000);

        var runTest = function () {
            return window.QUnitGlobals
                .waitForIframe(iframe)
                .then(function () {
                    equal(iframe.contentWindow.location.pathname, '/sessionId!i/https://example.com/test-resource/runner-iframe.html', 'path is correct before click on link');

                    iframe.contentDocument.body.appendChild(link);
                    link.focus();

                    // NOTE: we need setTimeout to wait for focus in IE
                    return wait(browserUtils.isIE ? 1000 : 0);
                })
                .then(function () {
                    equal(domUtils.getActiveElement(), iframe);
                    equal(domUtils.getActiveElement(iframe.contentDocument), link);

                    actionsAPI.press('enter');

                    return waitForIframeReloaded(iframe);
                })
                .then(function () {
                    equal(iframe.contentWindow.location.pathname, '/sessionId!i/https://example.com/test-resource/focus-iframe.html', 'path is correct after click on link');
                    ok(clicked);

                    testFinished = true;
                });
        };

        Promise
            .race([watchdog, runTest()])
            .then(function () {
                if (!testFinished)
                    ok(false, 'Test timeout is exceed');

                start();
            });

        document.body.appendChild(iframe);
    });
});
