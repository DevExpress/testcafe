import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import DriverStatus from '../status';

var Promise = hammerhead.Promise;

var RequestBarrier    = testCafeCore.RequestBarrier;
var pageUnloadBarrier = testCafeCore.pageUnloadBarrier;


export default function executeNavigateTo (command) {
    var requestBarrier = new RequestBarrier();

    hammerhead.navigateTo(command.url);

    return Promise.all([requestBarrier.wait(), pageUnloadBarrier.wait()])
        .then(() => new DriverStatus({ isCommandResult: true }))
        .catch(err => new DriverStatus({ isCommandResult: true, executionError: err }));
}
