import { Promise } from '../deps/hammerhead';

import { RequestBarrier, pageUnloadBarrier } from '../deps/testcafe-core';

import ScriptExecutionBarrier from '../script-execution-barrier';


export default function (action, ...args) {
    const requestBarrier         = new RequestBarrier();
    const scriptExecutionBarrier = new ScriptExecutionBarrier();

    pageUnloadBarrier.watchForPageNavigationTriggers();

    let actionResult   = null;
    const actionPromise  = action(...args);

    const barriersPromise = actionPromise
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
