import hammerhead from './deps/hammerhead';
import COMMAND from '../../legacy/test-run/command';

var transport = hammerhead.transport;


//Exports
//-------------------------------------------------------------------------------------
export function fatalError (err, callback) {
    var testFailMsg = {
        cmd: COMMAND.fatalError,
        err: err
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
