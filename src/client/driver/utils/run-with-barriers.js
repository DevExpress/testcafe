import { Promise } from '../deps/hammerhead';

import { RequestBarrier, pageUnloadBarrier } from '../deps/testcafe-core';

import ScriptExecutionBarrier from '../script-execution-barrier';


export default function (action, ...args) {
    var requestBarrier         = new RequestBarrier();
    var scriptExecutionBarrier = new ScriptExecutionBarrier();

    pageUnloadBarrier.watchForPageNavigationTriggers();

    var actionResult   = null;
    var actionPromise  = action(...args);

    var barriersPromise = actionPromise
        .then(result => {
            actionResult = result;

            return Promise.all([
                // NOTE: script can be added by xhr-request, so we should run
                // script execution barrier waiting after request barrier resolved
                requestBarrier
                    .wait()
                    .then(() => scriptExecutionBarrier.wait()),

                pageUnloadBarrier.wait()
            ]);
        })
        .then(() => actionResult);

    return { actionPromise, barriersPromise };
}
