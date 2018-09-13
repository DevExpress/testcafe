const hammerhead    = window.getTestCafeModule('hammerhead');
const Promise       = hammerhead.Promise;
const iframeSandbox = hammerhead.sandbox.iframe;

let iframe                  = null;
let iframePageUnloadBarrier = null;
let waitIframeLoad          = null;
let waitIframeBeforeUnLoad  = null;

QUnit.testStart(function () {
    iframeSandbox.on(iframeSandbox.RUN_TASK_SCRIPT_EVENT, window.initIFrameTestHandler);
    iframeSandbox.off(iframeSandbox.RUN_TASK_SCRIPT_EVENT, iframeSandbox.iframeReadyToInitHandler);

    iframe = $('<iframe id="test2">')[0];

    QUnit.stop();

    //NOTE: we need this to wait while iframe is initialized (it is done with some timeout in Firefox)
    iframe.onload = function () {
        const iframeHammerhead = iframe.contentWindow.eval("window['%hammerhead%']");

        iframePageUnloadBarrier = iframe.contentWindow.eval("window['%testCafeCore%'].pageUnloadBarrier");
        iframePageUnloadBarrier.init();

        waitIframeLoad = function () {
            return new Promise(function (resolve) {
                iframe.onload = resolve;
            });
        };

        waitIframeBeforeUnLoad = function () {
            return new Promise(function (resolve) {
                iframeHammerhead.on(iframeHammerhead.EVENTS.beforeBeforeUnload, resolve);
            });
        };

        QUnit.start();
    };

    document.body.appendChild(iframe);
});

QUnit.testDone(function () {
    iframeSandbox.off(iframeSandbox.RUN_TASK_SCRIPT_EVENT, window.initIFrameTestHandler);
    document.body.removeChild(iframe);
});

$(document).ready(function () {
    asyncTest('Should resolve wait promise if there is no page redirect', function () {
        iframePageUnloadBarrier
            .wait()
            .then(function () {
                ok(true, 'just check promise is resolved');
                start();
            });
    });

    asyncTest('Should wait for timeout for a possible page redirect', function () {
        let pageUnloadBarrierResolved = false;

        iframe.contentWindow.location = '/xhr-test/600'; // delay should be greater then page load barrier timeout

        waitIframeBeforeUnLoad()
            .then(function () {
                return iframePageUnloadBarrier.wait();
            })
            .then(function () {
                pageUnloadBarrierResolved = true;
            });

        waitIframeLoad()
            .then(function () {
                ok(!pageUnloadBarrierResolved);
                start();
            });
    });

    asyncTest('Should not resolve waiting promise if page is unloading after click on a link', function () {
        const iframeDocument = iframe.contentDocument;
        const link           = iframeDocument.createElement('a');

        link.href        = '/xhr-test/750';
        link.textContent = 'link';
        iframeDocument.body.appendChild(link);

        link.click();

        let pageUnloadBarrierResolved = false;

        waitIframeBeforeUnLoad()
            .then(function () {
                return iframePageUnloadBarrier.wait();
            })
            .then(function () {
                pageUnloadBarrierResolved = true;
            });

        waitIframeLoad()
            .then(function () {
                ok(!pageUnloadBarrierResolved);
                start();
            });
    });
});
