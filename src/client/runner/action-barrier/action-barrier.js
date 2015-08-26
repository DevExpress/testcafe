import * as xhrBarrier from './xhr';

//NOTE: actionSynchronizer provides XHRRequest auto-wait functionality via barrier mechanism.
//Usually barriers are used for thread synchronization in operating systems
//(see: http://en.wikipedia.org/wiki/Barrier_(computer_science)). But idea was adopted for
//action/requests operations background.
export function init () {
    xhrBarrier.init();
}

export function waitPageInitialization (callback) {
    xhrBarrier.waitPageInitialRequests(callback);
}

//NOTE: run action, wait for xhrWatch and iframeWatch response
export function waitActionSideEffectsCompletion (action, callback) {
    xhrBarrier.startBarrier(callback);

    action.call(window, function () {
        xhrBarrier.waitBarrier();
    });
}
