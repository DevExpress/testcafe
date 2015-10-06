var hammerhead    = window.getTestCafeModule('hammerhead');
var iframeSandbox = hammerhead.sandbox.iframe;

var testCafeRunner = window.getTestCafeModule('testCafeRunner');
var actionBarrier  = testCafeRunner.get('./action-barrier/action-barrier');

QUnit.begin(function () {
    actionBarrier.init();
});

QUnit.testStart(function () {
    hammerhead.on(hammerhead.EVENTS.iframeReadyToInit, window.initIFrameTestHandler);
    hammerhead.off(hammerhead.EVENTS.iframeReadyToInit, iframeSandbox.iframeReadyToInitHandler);
});

QUnit.testDone(function () {
    hammerhead.off(hammerhead.EVENTS.iframeReadyToInit, window.initIFrameTestHandler);
});

$(document).ready(function () {
    var $iframe = null;

    asyncTest('waitPageInitialization', function () {
        var completeReqCount = 0,
            reqCount         = 2;

        expect(1);

        for (var i = 0; i < reqCount; i++) {
            $.get('/ping/500', function () {
                completeReqCount++;
            });
        }

        actionBarrier.waitPageInitialization(function () {
            strictEqual(completeReqCount, reqCount);
            start();
        });
    });


    module('regression');

    asyncTest('barrier - creating new iframe without src (B236650)', function () {
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

        var callback = function () {
            ok(!windowErrorRaised);
        };

        actionBarrier.waitActionSideEffectsCompletion(action, callback);

        window.setTimeout(function () {
            expect(1);
            start();
        }, 1000)
    });

    asyncTest('B237815 - Test runner - can\'t execute simple test', function () {
        var callbackRaised = false;

        var action = function (callback) {
            $iframe = $('<iframe id="test2">').appendTo('body');

            window.setTimeout(function () {
                $iframe.remove();
            }, 50);

            callback();
        };

        var callback = function () {
            callbackRaised = true;
        };

        actionBarrier.waitActionSideEffectsCompletion(action, callback);

        window.setTimeout(function () {
            ok(callbackRaised);
            start();
        }, 2000);
    });
});
