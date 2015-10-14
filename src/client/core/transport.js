import hammerhead from './deps/hammerhead';
import COMMAND from '../../runner/test-run/command';

var transport = hammerhead.transport;


//Exports
//-------------------------------------------------------------------------------------
export var syncServiceMsg                  = transport.syncServiceMsg.bind(transport);
export var asyncServiceMsg                 = transport.asyncServiceMsg.bind(transport);
export var waitForServiceMessagesCompleted = transport.waitForServiceMessagesCompleted.bind(transport);
export var batchUpdate                     = transport.batchUpdate.bind(transport);
export var queuedAsyncServiceMsg           = transport.queuedAsyncServiceMsg.bind(transport);

export function fail (err, callback) {
    var testFailMsg = {
        cmd: COMMAND.fatalError,
        err: err
    };

    transport.asyncServiceMsg(testFailMsg, function () {
        callback();
    });

    //HACK: this helps stop current JS context execution
    window.onerror = function () {
    };
    throw 'STOP';
}

export function assertionFailed (err) {
    var assertionFailedMsg = {
        cmd: COMMAND.assertionFailed,
        err: err
    };

    transport.asyncServiceMsg(assertionFailedMsg);
}
