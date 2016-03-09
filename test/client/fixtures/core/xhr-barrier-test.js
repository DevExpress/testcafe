var hammerhead    = window.getTestCafeModule('hammerhead');
var Promise       = hammerhead.Promise;
var hhsettings    = hammerhead.get('./settings').get();
var iframeSandbox = hammerhead.sandbox.iframe;

var testCafeCore = window.getTestCafeModule('testCafeCore');
var ERROR_TYPE   = testCafeCore.ERROR_TYPE;
var XhrBarrier   = testCafeCore.XhrBarrier;


$.support.cors = true;

function delay (ms) {
    return new Promise(function (resolve) {
        window.setTimeout(resolve, ms);
    });
}

QUnit.testStart(function () {
    iframeSandbox.on(iframeSandbox.RUN_TASK_SCRIPT, window.initIFrameTestHandler);
    iframeSandbox.off(iframeSandbox.RUN_TASK_SCRIPT, iframeSandbox.iframeReadyToInitHandler);
});

QUnit.testDone(function () {
    iframeSandbox.off(iframeSandbox.RUN_TASK_SCRIPT, window.initIFrameTestHandler);
});


$(document).ready(function () {
    asyncTest('waitPageInitialRequests', function () {
        var completeReqCount       = 0;
        var reqCount               = 4;
        var barrierTimeoutExceeded = false;

        expect(1);

        var xhrBarrier = new XhrBarrier();

        for (var i = 0; i < reqCount; i++) {
            $.get('/xhr-test/200', function () {
                completeReqCount++;
            });
        }

        // NOTE: ignore slow connection on the testing
        // farm that leads to unstable tests appearing
        delay(xhrBarrier.BARRIER_TIMEOUT)
            .then(function () {
                barrierTimeoutExceeded = true;
            });

        xhrBarrier
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

        var xhrBarrier = new XhrBarrier();

        for (var i = 0; i < reqCount; i++) {
            $.get('/xhr-test/1000', function () {
                completeReqCount++;
            });
        }

        // NOTE: ignore slow connection on the testing
        // farm that leads to unstable tests appearing
        delay(xhrBarrier.BARRIER_TIMEOUT)
            .then(function () {
                barrierTimeoutExceeded = true;
            });

        xhrBarrier
            .wait()
            .then(function () {
                ok(completeReqCount === reqCount || barrierTimeoutExceeded);
                start();
            });
    });

    asyncTest('barrier - Skip TestCafeClient requests', function () {
        var jqxhr                     = null,
            TestCafeClientReqComplete = false;

        expect(1);

        var xhrBarrier = new XhrBarrier();

        hhsettings.serviceMsgUrl = '/xhr-test/8000';

        var action = function (callback) {
            jqxhr = $.ajax(hhsettings.serviceMsgUrl);

            jqxhr.always(function () {
                TestCafeClientReqComplete = true;
            });
            callback();
        };

        action(function () {
            xhrBarrier
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

        var xhrBarrier = new XhrBarrier();

        xhrBarrier.BARRIER_TIMEOUT = 0;

        jqxhr = $.get('/xhr-test/8000');

        window.setTimeout(function () {
            jqxhr.abort();
        }, 500);

        xhrBarrier
            .wait()
            .then(function () {
                ok(true, 'just check barrier waiting is resolved');
                start();
            });
    });

    asyncTest('T135542 - act.wait method works too-o-o-o long', function () {
        var firstRequestCompleted  = false,
            secondRequestCompleted = false;

        $.get('/xhr-test/3000', function () {
            firstRequestCompleted = true;
        }).always(function () {
            start();
        });

        expect(2);

        var xhrBarrier = new XhrBarrier();

        window.setTimeout(function () {
            xhrBarrier
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
        var timeout = 300;  //NOTE: equals to REQUESTS_COLLECTION_DELAY
        var barrierCompleted = false;

        expect(1);

        var xhrBarrier = new XhrBarrier();

        xhrBarrier
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
            if ($iframe) {
                $iframe.remove();
            }

            window.setTimeout(function () {
                $iframe = $('<iframe id="test1">').attr('src', 'about:blank').appendTo('body');
            }, 0);

            callback();
        };

        var xhrBarrier = new XhrBarrier();

        action.call(window, function () {
            xhrBarrier
                .wait()
                .then(function () {
                    ok(!windowErrorRaised);
                });
        });

        window.setTimeout(function () {
            expect(1);
            start();
        }, 1000)
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

        var xhrBarrier = new XhrBarrier();

        action.call(window, function () {
            xhrBarrier
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
