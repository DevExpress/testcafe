const hammerhead    = window.getTestCafeModule('hammerhead');
const browserUtils  = hammerhead.utils.browser;
const iframeSandbox = hammerhead.sandbox.iframe;

const testCafeCore  = window.getTestCafeModule('testCafeCore');
const domUtils      = testCafeCore.get('./utils/dom');
const textSelection = testCafeCore.get('./utils/text-selection');

const testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
const ERROR_TYPE           = testCafeLegacyRunner.get('../test-run-error/type');
const SETTINGS             = testCafeLegacyRunner.get('./settings').get();
const actionsAPI           = testCafeLegacyRunner.get('./api/actions');
const StepIterator         = testCafeLegacyRunner.get('./step-iterator');

const initAutomation = testCafeLegacyRunner.get('./init-automation');

initAutomation();

const Promise      = hammerhead.Promise;
const stepIterator = new StepIterator();

actionsAPI.init(stepIterator);

$(document).ready(function () {
    let asyncActionCallback;
    let currentErrorType   = null;
    let currentSourceIndex = null;
    let $input;

    //constants
    const TEST_ELEMENT_CLASS = 'testElement';
    const TEST_TIMEOUT       = 2000;

    //utils
    const runAsyncTest = function (actions, assertions, timeout, delayBeforeAssertions) {
        let timeoutId        = null;
        let callbackFunction = function () {
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

    const createIFrame = function (src) {
        const $iframe = $('<iframe/>')
            .css({
                width:  '600px',
                height: '600px'
            })
            .addClass(TEST_ELEMENT_CLASS);

        $iframe[0].setAttribute('src', src);

        return $iframe[0];
    };

    const waitForIframeReloaded = function (iframe) {
        const iframeUnloadPromise = new Promise(function (resolve) {
            iframe.contentWindow.addEventListener('unload', resolve);
        });

        return iframeUnloadPromise.then(function () {
            return window.QUnitGlobals.waitForIframe(iframe);
        });
    };

    const wait = function (ms) {
        return new Promise(function (resolve) {
            window.setTimeout(resolve, ms);
        });
    };

    StepIterator.prototype.asyncActionSeries = function (items, runArgumentsIterator, action) {
        const seriesActionsRun = function (elements, callback) {
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
        const iFrameSrc    = window.QUnitGlobals.getResourceUrl('../../data/runner/iframe.html', 'runner-iframe.html');
        const linkHref     = window.QUnitGlobals.getResourceUrl('../../data/focus-blur-change/iframe.html', 'focus-iframe.html');
        const link         = $('<a>Link</a>').attr('href', linkHref).addClass(TEST_ELEMENT_CLASS)[0];
        const iframe       = createIFrame(iFrameSrc);

        let clicked      = false;
        let testFinished = false;

        link.onclick = function () {
            clicked = true;
        };

        const watchdog = wait(10000);

        const runTest = function () {
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
        const iFrameSrc    = window.QUnitGlobals.getResourceUrl('../../data/runner/iframe.html', 'runner-iframe.html');
        const linkHref     = window.QUnitGlobals.getResourceUrl('../../data/focus-blur-change/iframe.html', 'focus-iframe.html');
        const link         = $('<a>Link</a>').attr('href', 'javascript: window.location.href = "' + linkHref + '"')[0];
        const iframe       = createIFrame(iFrameSrc);

        let clicked      = false;
        let testFinished = false;

        link.onclick = function () {
            clicked = true;
        };

        const watchdog = wait(10000);

        const runTest = function () {
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
