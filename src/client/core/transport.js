import hammerhead from './deps/hammerhead';
import COMMAND from '../../runner/test-run/command';

var transport          = hammerhead.transport;
var beforeUnloadRaised = false;

hammerhead.on(hammerhead.EVENTS.beforeUnload, () => beforeUnloadRaised = true);


//Exports
//-------------------------------------------------------------------------------------
export var syncServiceMsg                  = transport.syncServiceMsg.bind(transport);
export var asyncServiceMsg                 = transport.asyncServiceMsg.bind(transport);
export var waitForServiceMessagesCompleted = transport.waitForServiceMessagesCompleted.bind(transport);
export var batchUpdate                     = transport.batchUpdate.bind(transport);
export var queuedAsyncServiceMsg           = transport.queuedAsyncServiceMsg.bind(transport);

export function fatalError (err, callback) {
    // NOTE: we should not stop the test run if an error occured during page unloading because we
    // would destroy the session in this case and wouldn't be able to get the next page in the browser.
    // We should set the deferred error to the task to have the test fail after the page reloading.
    var testFailMsg = {
        cmd:      COMMAND.fatalError,
        err:      err,
        deferred: beforeUnloadRaised
    };

    transport.asyncServiceMsg(testFailMsg, callback);
}

export function assertionFailed (err, callback) {
    var assertionFailedMsg = {
        cmd: COMMAND.assertionFailed,
        err: err
    };

    transport.asyncServiceMsg(assertionFailedMsg, callback);
}
