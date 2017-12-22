var hammerhead    = window.getTestCafeModule('hammerhead');
var Promise       = hammerhead.Promise;
var hhsettings    = hammerhead.get('./settings').get();
var iframeSandbox = hammerhead.sandbox.iframe;

var testCafeCore   = window.getTestCafeModule('testCafeCore');
var RequestBarrier = testCafeCore.RequestBarrier;


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
            var completeReqCount       = 0;
            var reqCount               = 4;
            var barrierTimeoutExceeded = false;

            expect(1);

            var requestBarrier = new RequestBarrier();
            var onReqCompleted = function () {
                completeReqCount++;
            };

            for (var i = 0; i < reqCount; i++)
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
            var completeReqCount       = 0;
            var reqCount               = 2;
            var barrierTimeoutExceeded = false;

            expect(1);

            var requestBarrier = new RequestBarrier();
            var onReqCompleted = function () {
                completeReqCount++;
            };

            for (var i = 0; i < reqCount; i++)
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
            var jqxhr                     = null;
            var TestCafeClientReqComplete = false;

            expect(1);

            var requestBarrier = new RequestBarrier();

            hhsettings.serviceMsgUrl = '/xhr-test/8000';

            var action = function (callback) {
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
            var jqxhr = null;

            expect(1);

            var requestBarrier = new RequestBarrier();

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
            var firstRequestCompleted  = false;
            var secondRequestCompleted = false;

            $.get('/xhr-test/3000', function () {
                firstRequestCompleted = true;
            }).always(function () {
                start();
            });

            expect(2);

            var requestBarrier = new RequestBarrier();

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
            var timeout          = 300; //NOTE: equals to REQUESTS_COLLECTION_DELAY
            var barrierCompleted = false;

            expect(1);

            var requestBarrier = new RequestBarrier();

            requestBarrier
                .wait()
                .then(function () {
                    barrierCompleted = true;
                });

            var xhr = new XMLHttpRequest();

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
            var $iframe           = null;
            var windowErrorRaised = false;

            window.onerror = function () {
                windowErrorRaised = true;
            };

            var action = function (callback) {
                if ($iframe)
                    $iframe.remove();

                window.setTimeout(function () {
                    $iframe = $('<iframe id="test1">').attr('src', 'about:blank').appendTo('body');
                }, 0);

                callback();
            };

            var requestBarrier = new RequestBarrier();

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
            var $iframe        = null;
            var callbackRaised = false;

            var action = function (callback) {
                $iframe = $('<iframe id="test2">').appendTo('body');

                window.setTimeout(function () {
                    $iframe.remove();
                }, 50);

                callback();
            };

            var requestBarrier = new RequestBarrier();

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
                var completeReqCount       = 0;
                var reqCount               = 2;
                var barrierTimeoutExceeded = false;

                expect(1);

                var requestBarrier     = new RequestBarrier();
                var returnResponseText = function (response) {
                    return response.text();
                };

                var onReqCompleted = function () {
                    completeReqCount++;
                };

                for (var i = 0; i < reqCount; i++) {
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
                var requestIsFailed        = false;
                var barrierTimeoutExceeded = false;

                expect(1);

                var requestBarrier = new RequestBarrier();

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
