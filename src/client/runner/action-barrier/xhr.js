import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';

var serviceUtils = testCafeCore.serviceUtils;


const INITIAL_REQUESTS_COLLECTION_DELAY    = 300;
const ADDITIONAL_REQUESTS_COLLECTION_DELAY = 100;
const WAIT_PAGE_INITIAL_REQUESTS_DELAY     = 50;
const PAGE_INITIALIZATION_CALLBACK_DELAY   = 100;


export var BARRIER_TIMEOUT          = 3000;
export var XHR_BARRIER_ERROR        = 'error';
export var GLOBAL_START_XHR_BARRIER = 'tc-gsxb-d1417385';
export var GLOBAL_WAIT_XHR_BARRIER  = 'tc-gwxb-d1417385';


//Globals
var barrierCtx              = null,
    pageInitialReqsComplete = null,
    eventEmitter            = new serviceUtils.EventEmitter();

export var events = eventEmitter;

function initBarrierCtx (callback) {
    barrierCtx = {
        passed:         false,
        collectingReqs: true,
        requests:       [],
        reqCount:       0,

        callback: function () {
            if (!barrierCtx.passed) {
                barrierCtx.passed = true;

                if (barrierCtx.watchdog)
                    window.clearTimeout(barrierCtx.watchdog);

                callback.apply(window, arguments);
            }
        },
        watchdog: null
    };
}

function onRequestsCollected () {
    barrierCtx.collectingReqs = false;

    if (barrierCtx.reqCount) {
        barrierCtx.watchdog = window.setTimeout(function () {
            //NOTE: previously this error used in possible fail causes, which are R.I.P. now.
            //So we just through error to the console for the debugging purposes. In IE9 console.log
            //is defined only if dev tools are open.
            if (window.console && window.console.log)
                window.console.log('TestCafe encountered hanged XHR on page.');

            eventEmitter.emit(XHR_BARRIER_ERROR);
            barrierCtx.callback();
        }, BARRIER_TIMEOUT);
    }
    else
        barrierCtx.callback();
}

function removeXhrFromQueue (xhr) {
    for (var i = 0; i < barrierCtx.requests.length; i++) {
        if (xhr === barrierCtx.requests[i]) {
            barrierCtx.requests.splice(i, 1);
            return true;
        }
    }

    return false;
}

//API
export function init () {
    pageInitialReqsComplete = false;

    //NOTE: init barrier ctx and collect all page initial requests
    initBarrierCtx(function () {
        pageInitialReqsComplete = true;
    });

    hammerhead.on(hammerhead.EVENTS.xhrSend, function (e) {
        if (barrierCtx) {
            barrierCtx.reqCount++;
            barrierCtx.requests.push(e.xhr);
        }
    });

    hammerhead.on(hammerhead.EVENTS.xhrError, function (e) {
        //NOTE: previously this error used in possible fail causes, which are R.I.P. now.
        //So we just through error to the console for the debugging purposes. In IE9 console.log
        //is defined only if dev tools are open.
        if (window.console && window.console.log)
            window.console.log('TestCafe encountered XHR error on page: ' + e.err);
        events.emit(XHR_BARRIER_ERROR, e.err);
    });

    hammerhead.on(hammerhead.EVENTS.xhrCompleted, function (e) {
        //NOTE: let last real xhr-handler finish it's job and try to obtain any additional requests
        //if they were initiated by this handler
        window.setTimeout(function () {
            if (removeXhrFromQueue(e.xhr))
                barrierCtx.reqCount--;

            if (!barrierCtx.collectingReqs && !barrierCtx.reqCount)
                barrierCtx.callback();

        }, ADDITIONAL_REQUESTS_COLLECTION_DELAY);
    });
}

export function waitPageInitialRequests (callback) {
    onRequestsCollected();

    var wait = function () {
        if (pageInitialReqsComplete)
            window.setTimeout(callback, PAGE_INITIALIZATION_CALLBACK_DELAY);
        else
            window.setTimeout(wait, WAIT_PAGE_INITIAL_REQUESTS_DELAY);
    };

    wait();
}

export function startBarrier (callback) {
    initBarrierCtx(callback);
}

export function waitBarrier () {
    //NOTE: collect initial XHR requests set, then wait for the requests to finish
    window.setTimeout(onRequestsCollected, INITIAL_REQUESTS_COLLECTION_DELAY);
}

//NOTE: for test puproses
export function setBarrierTimeout (timeout) {
    BARRIER_TIMEOUT = timeout;
}

window[GLOBAL_START_XHR_BARRIER] = startBarrier;
window[GLOBAL_WAIT_XHR_BARRIER]  = waitBarrier;
