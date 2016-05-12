import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import DriverStatus from '../status';

var Promise = hammerhead.Promise;

var XhrBarrier        = testCafeCore.XhrBarrier;
var pageUnloadBarrier = testCafeCore.pageUnloadBarrier;


export default function executeNavigateToCommand (command) {
    var xhrBarrier = new XhrBarrier();

    hammerhead.navigateTo(command.url);

    return Promise.all([xhrBarrier.wait(), pageUnloadBarrier.wait()])
        .then(() => new DriverStatus({ isCommandResult: true }))
        .catch(err => new DriverStatus({ isCommandResult: true, executionError: err }));
}
