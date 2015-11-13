import hammerhead from './deps/hammerhead';
import COMMAND from '../../runner/test-run/command';

var transport          = hammerhead.transport;
var beforeUnloadRaised = false;

hammerhead.on(hammerhead.EVENTS.beforeUnload, () => beforeUnloadRaised = true);


//Exports
//-------------------------------------------------------------------------------------
export function fatalError (err, callback) {
    // NOTE: we should not stop the test run if an error occured during page unloading because we
    // would destroy the session in this case and wouldn't be able to get the next page in the browser.
    // We should set the deferred error to the task to have the test fail after the page reloading.
    var testFailMsg = {
        cmd:      COMMAND.fatalError,
        err:      err,
        deferred: beforeUnloadRaised
    };

    asyncServiceMsg(testFailMsg, callback);
}

export function assertionFailed (err, callback) {
    var assertionFailedMsg = {
        cmd: COMMAND.assertionFailed,
        err: err
    };

    asyncServiceMsg(assertionFailedMsg, callback);
}

// TODO: temporary solution before GH-50
export function asyncServiceMsg (msg, callback) {
    return transport.asyncServiceMsg(msg)
        .then(args => {
            if (callback)
                callback(args)
        });
}

export function waitForServiceMessagesCompleted (timeout, callback) {
    return transport.waitForServiceMessagesCompleted(timeout)
        .then(callback);
}

export function batchUpdate (callback) {
    return transport.batchUpdate()
        .then(callback);
}
