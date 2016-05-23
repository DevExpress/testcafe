import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import DriverStatus from '../status';

var Promise = hammerhead.Promise;

var RequestBarrier    = testCafeCore.RequestBarrier;
var pageUnloadBarrier = testCafeCore.pageUnloadBarrier;

<<<<<<< 4c8d51becf8afd9d66783cc0d707241e2ef9f268

<<<<<<< e8cb9c35813fdf7814793df0504da89b0e0966ab:src/client/driver/command-executors/execute-navigate-to.js
<<<<<<< 0c33665cd2a204c6cadd3d7734e34832fbe253fc:src/client/driver/command-executors/execute-navigate-to.js
=======
>>>>>>> request barrier
export default function executeNavigateTo (command) {
    var xhrBarrier = new XhrBarrier();
=======
export default function executeNavigateToCommand (command) {
=======
export default function executeNavigateTo (command) {
>>>>>>> TakeScreenshot, TakeScreenshotOnFail commands (part of #441, part of #240) (#552):src/client/driver/command-executors/execute-navigate-to.js
    var requestBarrier = new RequestBarrier();
>>>>>>> request barrier:src/client/driver/command-executors/execute-navigate-to-command.js

    hammerhead.navigateTo(command.url);

    return Promise.all([requestBarrier.wait(), pageUnloadBarrier.wait()])
        .then(() => new DriverStatus({ isCommandResult: true }))
        .catch(err => new DriverStatus({ isCommandResult: true, executionError: err }));
}
