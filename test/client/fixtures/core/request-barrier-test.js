const hammerhead    = window.getTestCafeModule('hammerhead');
const Promise       = hammerhead.Promise;
const hhsettings    = hammerhead.settings.get();
const iframeSandbox = hammerhead.sandbox.iframe;

const testCafeCore   = window.getTestCafeModule('testCafeCore');
const RequestBarrier = testCafeCore.RequestBarrier;


$.support.cors = true;

function delay (ms) {
    return new Promise(function (resolve) {
        window.setTimeout(resolve, ms);
    });
}

QUnit.testStart(function () {
    iframeSandbox.on(iframeSandbox.RUN_TASK_SCRIPT_EVENT, window.initIFrameTestHandler);
    iframeSandbox.off(iframeSandbox.RUN_TASK_SCRIPT_EVENT, iframeSandbox.iframeReadyToInitHandler);
});

QUnit.testDone(function () {
    iframeSandbox.off(iframeSandbox.RUN_TASK_SCRIPT_EVENT, window.initIFrameTestHandler);
});

$(document).ready(function () {
    module('xhr', function () {
        asyncTest('waitPageInitialRequests', function () {
            const reqCount = 4;

            let completeReqCount       = 0;
            let barrierTimeoutExceeded = false;

            expect(1);

            const requestBarrier = new RequestBarrier();
            const onReqCompleted = function () {
                completeReqCount++;
            };

            for (let i = 0; i < reqCount; i++)
                $.get('/xhr-test/200', onReqCompleted);

            // NOTE: ignore slow connection on the testing
            // farm that leads to unstable tests appearing
            delay(requestBarrier.BARRIER_TIMEOUT)
                .then(function () {
                    barrierTimeoutExceeded = true;
                });

            requestBarrier
                .wait(true)
                .then(function () {
                    ok(completeReqCount === reqCount || barrierTimeoutExceeded);
                    start();
                });
        });

        asyncTest('barrier - Wait requests complete', function () {
            const reqCount = 2;

            let completeReqCount       = 0;
            let barrierTimeoutExceeded = false;

            expect(1);

            const requestBarrier = new RequestBarrier();
            const onReqCompleted = function () {
                completeReqCount++;
            };

            for (let i = 0; i < reqCount; i++)
                $.get('/xhr-test/1000', onReqCompleted);

            // NOTE: ignore slow connection on the testing
            // farm that leads to unstable tests appearing
            delay(requestBarrier.BARRIER_TIMEOUT)
                .then(function () {
                    barrierTimeoutExceeded = true;
                });

            requestBarrier
                .wait()
                .then(function () {
                    ok(completeReqCount === reqCount || barrierTimeoutExceeded);
                    start();
                });
        });

        asyncTest('barrier - Skip TestCafeClient requests', function () {
            let jqxhr                     = null;
            let TestCafeClientReqComplete = false;

            expect(1);

            const requestBarrier = new RequestBarrier();

            hhsettings.serviceMsgUrl = '/xhr-test/8000';

            const action = function (callback) {
                jqxhr = $.ajax(hhsettings.serviceMsgUrl);

                jqxhr.always(function () {
                    TestCafeClientReqComplete = true;
                });
                callback();
            };

            action(function () {
                requestBarrier
                    .wait()
                    .then(function () {
                        ok(!TestCafeClientReqComplete);
                        jqxhr.abort();
                        hhsettings.serviceMsgUrl = null;
                        start();
                    });
            });
        });

        asyncTest('barrier - Timeout', function () {
            let jqxhr = null;

            expect(1);

            const requestBarrier = new RequestBarrier();

            requestBarrier.BARRIER_TIMEOUT = 0;

            jqxhr = $.get('/xhr-test/8000');

            window.setTimeout(function () {
                jqxhr.abort();
            }, 500);

            requestBarrier
                .wait()
                .then(function () {
                    ok(true, 'just check barrier waiting is resolved');
                    start();
                });
        });

        asyncTest('T135542 - act.wait method works too-o-o-o long', function () {
            let firstRequestCompleted  = false;
            let secondRequestCompleted = false;

            $.get('/xhr-test/3000', function () {
                firstRequestCompleted = true;
            }).always(function () {
                start();
            });

            expect(2);

            const requestBarrier = new RequestBarrier();

            window.setTimeout(function () {
                requestBarrier
                    .wait()
                    .then(function () {
                        ok(!firstRequestCompleted);
                        ok(secondRequestCompleted);
                    });

                $.get('/xhr-test/200', function () {
                    secondRequestCompleted = true;
                });
            }, 100);
        });

        asyncTest('T233907 - TestRunning waits cancelled xhrs', function () {
            const timeout          = 300; //NOTE: equals to REQUESTS_COLLECTION_DELAY

            let barrierCompleted = false;

            expect(1);

            const requestBarrier = new RequestBarrier();

            requestBarrier
                .wait()
                .then(function () {
                    barrierCompleted = true;
                });

            const xhr = new XMLHttpRequest();

            xhr.open('GET', '/xhr-test/' + 2 * timeout);
            xhr.send(null);
            xhr.abort();

            window.setTimeout(function () {
                ok(barrierCompleted);
                start();
            }, timeout * 1.1);
        });

        module('regression');

        asyncTest('barrier - creating new iframe without src (B236650)', function () {
            let $iframe           = null;
            let windowErrorRaised = false;

            window.onerror = function () {
                windowErrorRaised = true;
            };

            const action = function (callback) {
                if ($iframe)
                    $iframe.remove();

                window.setTimeout(function () {
                    $iframe = $('<iframe id="test1">').attr('src', 'about:blank').appendTo('body');
                }, 0);

                callback();
            };

            const requestBarrier = new RequestBarrier();

            action.call(window, function () {
                requestBarrier
                    .wait()
                    .then(function () {
                        ok(!windowErrorRaised);
                    });
            });

            window.setTimeout(function () {
                expect(1);
                $iframe.remove();

                start();
            }, 1000);
        });

        asyncTest('B237815 - Test runner - can\'t execute simple test', function () {
            let $iframe        = null;
            let callbackRaised = false;

            const action = function (callback) {
                $iframe = $('<iframe id="test2">').appendTo('body');

                window.setTimeout(function () {
                    $iframe.remove();
                }, 50);

                callback();
            };

            const requestBarrier = new RequestBarrier();

            action.call(window, function () {
                requestBarrier
                    .wait()
                    .then(function () {
                        callbackRaised = true;
                    });
            });

            window.setTimeout(function () {
                ok(callbackRaised);
                start();
            }, 2000);
        });
    });

    if (window.fetch) {
        module('fetch', function () {
            asyncTest('success request', function () {
                const reqCount = 2;

                let completeReqCount       = 0;
                let barrierTimeoutExceeded = false;

                expect(1);

                const requestBarrier     = new RequestBarrier();
                const returnResponseText = function (response) {
                    return response.text();
                };

                const onReqCompleted = function () {
                    completeReqCount++;
                };

                for (let i = 0; i < reqCount; i++) {
                    fetch('/xhr-test/' + 1000 * (i + 1))
                        .then(returnResponseText)
                        .then(onReqCompleted);
                }

                // NOTE: ignore slow connection on the testing
                // farm that leads to unstable tests appearing
                delay(requestBarrier.BARRIER_TIMEOUT)
                    .then(function () {
                        barrierTimeoutExceeded = true;
                    });

                requestBarrier
                    .wait()
                    .then(function () {
                        ok(completeReqCount === reqCount || barrierTimeoutExceeded);
                        start();
                    });
            });

            asyncTest('failed request', function () {
                let requestIsFailed        = false;
                let barrierTimeoutExceeded = false;

                expect(1);

                const requestBarrier = new RequestBarrier();

                fetch('/close-request')
                    .then(function (response) {
                        return response.text();
                    })
                    .then(function (text) {
                        // NOTE: On the SauceLab, requests from browser to a destination server is passed via Squid proxy.
                        // If destination server aborts a request then Squid respond with service error web page.
                        // In this case we should manually raise an error.
                        if (text.indexOf('Zero Sized Reply') !== -1)
                            throw new Error();

                        ok(false, text);
                    })
                    .catch(function () {
                        requestIsFailed = true;
                    });

                // NOTE: ignore slow connection on the testing
                // farm that leads to unstable tests appearing
                delay(requestBarrier.BARRIER_TIMEOUT)
                    .then(function () {
                        barrierTimeoutExceeded = true;
                    });

                requestBarrier
                    .wait(true)
                    .then(function () {
                        ok(requestIsFailed || barrierTimeoutExceeded);
                        start();
                    });
            });
        });
    }
});
