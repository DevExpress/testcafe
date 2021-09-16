import { Promise } from '../deps/hammerhead';

import {
    RequestBarrier,
    ClientRequestEmitter,
    pageUnloadBarrier,
    ScriptExecutionBarrier,
    ScriptExecutionEmitter,
} from '../deps/testcafe-core';


export default function (action, ...args) {
    const requestEmitter         = new ClientRequestEmitter();
    const requestBarrier         = new RequestBarrier(requestEmitter);
    const scriptEmitter          = new ScriptExecutionEmitter();
    const scriptExecutionBarrier = new ScriptExecutionBarrier(scriptEmitter);

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

                pageUnloadBarrier.wait(),
            ]);
        })
        .then(() => actionResult);

    return { actionPromise, barriersPromise };
}
