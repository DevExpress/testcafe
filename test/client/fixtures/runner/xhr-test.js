var hammerhead  = window.getTestCafeModule('hammerhead');
var urlUtil     = hammerhead.get('../utils/url');
var HH_CONST    = hammerhead.get('../const');
var HH_SETTINGS = hammerhead.get('./settings').get();

var testCafeCore = window.getTestCafeModule('testCafeCore');
var ERROR_TYPE   = testCafeCore.ERROR_TYPE;

var testCafeRunner = window.getTestCafeModule('testCafeRunner');
var xhrBarrier     = testCafeRunner.get('./action-barrier/xhr');


$.support.cors = true;

$(document).ready(function () {
    asyncTest('waitPageInitialRequests', function () {
        var completeReqCount = 0,
            reqCount         = 4;

        expect(1);
        xhrBarrier.init();

        for (var i = 0; i < reqCount; i++) {
            $.get('/xhr-test/500', function () {
                completeReqCount++;
            });
        }

        xhrBarrier.waitPageInitialRequests(function () {
            strictEqual(completeReqCount, reqCount);
            start();
        });
    });

    asyncTest('barrier - Wait requests complete', function () {
        var completeReqCount = 0,
            reqCount         = 2;

        expect(1);

        xhrBarrier.init();

        xhrBarrier.startBarrier(function () {
            strictEqual(completeReqCount, reqCount);
            start();
        });

        for (var i = 0; i < reqCount; i++) {
            $.get('/xhr-test/1000', function () {
                completeReqCount++;
            });
        }

        xhrBarrier.waitBarrier();
    });

    asyncTest('barrier - Skip TestCafeClient requests', function () {
        var jqxhr                     = null,
            TestCafeClientReqComplete = false;

        expect(1);

        xhrBarrier.init();

        xhrBarrier.startBarrier(function () {
            ok(!TestCafeClientReqComplete);
            jqxhr.abort();
            HH_SETTINGS.SERVICE_MSG_URL = null;
            start();
        });

        HH_SETTINGS.SERVICE_MSG_URL = '/xhr-test/8000';

        var action = function (callback) {
            jqxhr = $.ajax(HH_SETTINGS.SERVICE_MSG_URL);

            jqxhr.always(function () {
                TestCafeClientReqComplete = true;
            });
            callback();
        };

        action(function () {
            xhrBarrier.waitBarrier();
        });
    });

    asyncTest('barrier - Timeout', function () {
        var jqxhr = null;

        expect(1);

        var savedTimeout = xhrBarrier.BARRIER_TIMEOUT;

        xhrBarrier.setBarrierTimeout(0);
        xhrBarrier.init();

        var handler = function (err) {
            strictEqual(err.code, ERROR_TYPE.xhrRequestTimeout);
            xhrBarrier.events.off(xhrBarrier.XHR_BARRIER_ERROR, handler);
        };

        xhrBarrier.events.on(xhrBarrier.XHR_BARRIER_ERROR, handler);
        xhrBarrier.startBarrier(function () {
            xhrBarrier.setBarrierTimeout(savedTimeout);
            start();
        });

        jqxhr = $.get('/xhr-test/8000');

        window.setTimeout(function () {
            jqxhr.abort();
        }, 500);
        xhrBarrier.waitBarrier();
    });

    asyncTest('Redirect requests to proxy', function () {
        expect(3);

        xhrBarrier.init();

        xhrBarrier.startBarrier(function () {
            start();
        });

        var action = function (callback) {
            $.get('/xhr-test/100', function (url) {
                strictEqual(url, '/ownerToken!jobUid/https://example.com/xhr-test/100');
            });

            $.get('http://' + window.location.host + '/xhr-test/200', function (url) {
                strictEqual(url, '/ownerToken!jobUid/https://example.com/xhr-test/200');
            });

            $.get('https://example.com/xhr-test/300', function (url) {
                strictEqual(url, '/ownerToken!jobUid/https://example.com/xhr-test/300');
            });
            callback();
        };

        action(function () {
            xhrBarrier.waitBarrier();
        });
    });

    asyncTest('Unsupported protocol', function () {
        var jqxhr = null;

        expect(1);

        xhrBarrier.init();

        var handler = function (err) {
            strictEqual(err.code, urlUtil.URL_UTIL_PROTOCOL_IS_NOT_SUPPORTED);
            xhrBarrier.events.off(xhrBarrier.XHR_BARRIER_ERROR, handler);
            start();
        };

        xhrBarrier.events.on(xhrBarrier.XHR_BARRIER_ERROR, handler);

        $.get('gopher:test.domain');
    });

    asyncTest('TC request in not processed by page processor', function () {
        var ready = function () {
            if (this.readyState === this.DONE)
                ok(this.responseText.indexOf(HH_CONST.DOM_SANDBOX_STORED_ATTR_POSTFIX) === -1);
        };

        expect(1);

        xhrBarrier.init();

        xhrBarrier.startBarrier(function () {
            HH_SETTINGS.SERVICE_MSG_URL = null;
            start();
        });

        HH_SETTINGS.SERVICE_MSG_URL = '/wrap-responseText-test/json';

        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = ready;
        xhr.open('GET', HH_SETTINGS.SERVICE_MSG_URL, false);
        xhr.send(null);

        xhrBarrier.waitBarrier();
    });

    asyncTest('B238528 - Unexpected text modifying during typing text in the search input on the http://www.google.co.uk', function () {
        var timeout = 100;

        xhrBarrier.init();

        var ready = function () {
            if (this.readyState === this.DONE) {
                ok(syncActionExecuted);
                start();
            }
        };

        var syncActionExecuted = false,
            xhr                = new XMLHttpRequest();

        xhr.onreadystatechange = ready;
        xhr.open('GET', '/xhr-test/' + timeout);
        xhr.send(null);

        syncActionExecuted = true;
    });

    asyncTest('T135542 - act.wait method works too-o-o-o long', function () {
        var firstRequestCompleted  = false,
            secondRequestCompleted = false;

        xhrBarrier.init();

        $.get('/xhr-test/2000', function () {
            firstRequestCompleted = true;
        }).always(function () {
            start();
        });

        expect(2);

        window.setTimeout(function () {
            xhrBarrier.startBarrier(function () {
                ok(!firstRequestCompleted);
                ok(secondRequestCompleted);
            });

            xhrBarrier.waitBarrier();
            $.get('/xhr-test/200', function () {
                secondRequestCompleted = true;
            });
        }, 100);
    });
});
