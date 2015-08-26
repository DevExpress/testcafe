import * as hammerheadAPI from './deps/hammerhead';
import SERVICE_COMMANDS from './service-msg-cmd';
import * as SETTINGS from './settings';

var transport = hammerheadAPI.Transport;


const MAX_INACTIVITY_DURATION = 110000;


//Globals
var inactivityHandler = null,
    inactivityTimeout = null;

function resetInactivityTimeout (expectedInactivityDuration) {
    if (inactivityHandler) {
        window.clearTimeout(inactivityTimeout);
        inactivityTimeout = window.setTimeout(inactivityHandler, expectedInactivityDuration || MAX_INACTIVITY_DURATION);
    }
}

//Exports
//-------------------------------------------------------------------------------------
export function syncServiceMsg (msg, callback) {
    resetInactivityTimeout();

    return transport.syncServiceMsg(msg, callback);
}

export function asyncServiceMsg (msg, callback) {
    resetInactivityTimeout();

    return transport.asyncServiceMsg(msg, callback);
}

export var waitForServiceMessagesCompleted = transport.waitForServiceMessagesCompleted;
export var batchUpdate                     = transport.batchUpdate;
export var queuedAsyncServiceMsg           = transport.queuedAsyncServiceMsg;

export function switchToWorkerIdle () {
    window.location.href = SETTINGS.get().WORKER_IDLE_URL;
}

export function switchToStartRecordingUrl (recordingUrl) {
    var removeHashRegExp     = /#.*$/,
        replacedLocationHref = window.location.href.replace(removeHashRegExp, '').toLowerCase(),
        replacedRecordingUrl = recordingUrl.replace(removeHashRegExp, '').toLowerCase();

    window.location.href = recordingUrl;

    //T210251 - Playback doesn't start on page with location with hash
    if (window.location.hash && replacedLocationHref === replacedRecordingUrl && removeHashRegExp.test(recordingUrl))
        window.location.reload(true);
}

export function expectInactivity (duration, callback) {
    var maxDuration = duration + MAX_INACTIVITY_DURATION;

    //NOTE: order is important here. serviceMsg should go first because it also resets inactivity timeout
    var inactivityExpectedMsg = {
        cmd:      SERVICE_COMMANDS.INACTIVITY_EXPECTED,
        duration: maxDuration
    };

    asyncServiceMsg(inactivityExpectedMsg, function () {
        resetInactivityTimeout(maxDuration);
        callback();
    });
}

export function fail (err) {
    var testFailMsg = {
        cmd: SERVICE_COMMANDS.TEST_FAIL,
        err: err
    };

    asyncServiceMsg(testFailMsg, function () {
        switchToWorkerIdle();
    });

    //HACK: this helps stop current JS context execution
    window.onerror = function () {
    };
    throw 'STOP';
}

export function assertionFailed (err) {
    var assertionFailedMsg = {
        cmd: SERVICE_COMMANDS.ASSERTION_FAILED,
        err: err
    };

    asyncServiceMsg(assertionFailedMsg);
}


//NOTE: we are using transport messages as a test activity monitor. If we are not receiving any service
//message for a long time period then something is definitely went wrong.
export function startInactivityMonitor (onInactivity) {
    inactivityHandler = onInactivity;
    resetInactivityTimeout();
}

export function stopInactivityMonitor () {
    if (inactivityHandler) {
        inactivityHandler = null;
        window.clearTimeout(inactivityTimeout);
    }
}
