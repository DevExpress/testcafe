import * as hammerheadAPI from './deps/hammerhead';
import COMMAND from '../../runner/test-run/command';

var transport = hammerheadAPI.Transport;


//Exports
//-------------------------------------------------------------------------------------
export var syncServiceMsg                  = transport.syncServiceMsg;
export var asyncServiceMsg                 = transport.asyncServiceMsg;
export var waitForServiceMessagesCompleted = transport.waitForServiceMessagesCompleted;
export var batchUpdate                     = transport.batchUpdate;
export var queuedAsyncServiceMsg           = transport.queuedAsyncServiceMsg;

export function fail (err, callback) {
    var testFailMsg = {
        cmd: COMMAND.fatalError,
        err: err
    };

    asyncServiceMsg(testFailMsg, function () {
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

    asyncServiceMsg(assertionFailedMsg);
}
