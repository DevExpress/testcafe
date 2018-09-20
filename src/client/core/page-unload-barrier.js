import hammerhead from './deps/hammerhead';
import * as eventUtils from './utils/event';
import delay from './utils/delay';
import MESSAGE from '../../test-run/client-messages';
import { isAnchorElement } from './utils/dom';

const Promise       = hammerhead.Promise;
const browserUtils  = hammerhead.utils.browser;
const nativeMethods = hammerhead.nativeMethods;
const transport     = hammerhead.transport;


const DEFAULT_BARRIER_TIMEOUT       = 400;
const SHORT_WAIT_FOR_UNLOAD_TIMEOUT = 30;
const FILE_DOWNLOAD_CHECK_DELAY     = 500;
const MAX_UNLOADING_TIMEOUT         = 15 * 1000;


let waitingForUnload          = false;
let waitingForUnloadTimeoutId = null;
let waitingPromiseResolvers   = [];
let unloading                 = false;

let pageNavigationTriggeredListener = null;
let pageNavigationTriggered         = false;

function onBeforeUnload () {
    if (!browserUtils.isIE) {
        unloading = true;
        return;
    }

    prolongUnloadWaiting(SHORT_WAIT_FOR_UNLOAD_TIMEOUT);

    delay(0)
        .then(() => {
            // NOTE: except file downloading
            if (document.readyState === 'loading') {
                const activeElement = nativeMethods.documentActiveElementGetter.call(document);

                if (!activeElement || !isAnchorElement(activeElement) || !activeElement.hasAttribute('download'))
                    unloading = true;
            }
        });
}

function prolongUnloadWaiting (timeout) {
    if (waitingForUnloadTimeoutId)
        nativeMethods.clearTimeout.call(window, waitingForUnloadTimeoutId);

    waitingForUnload = true;

    waitingForUnloadTimeoutId = nativeMethods.setTimeout.call(window, () => {
        waitingForUnloadTimeoutId = null;
        waitingForUnload          = false;

        waitingPromiseResolvers.forEach(resolve => resolve());
        waitingPromiseResolvers = [];
    }, timeout);
}

function waitForFileDownload () {
    return new Promise(resolve => {
        nativeMethods.setTimeout.call(window, () => {
            transport
                .queuedAsyncServiceMsg({ cmd: MESSAGE.waitForFileDownload })
                .then(fileDownloadingHandled => {
                    // NOTE: we use a flag to confirm file download because if unload
                    // is raised the browser can respond with an empty string
                    if (fileDownloadingHandled)
                        resolve();
                });

        }, FILE_DOWNLOAD_CHECK_DELAY);
    });
}

// API
export function init () {
    hammerhead.on(hammerhead.EVENTS.beforeUnload, onBeforeUnload);

    eventUtils.bind(window, 'unload', () => {
        unloading = true;
    });
}

export function watchForPageNavigationTriggers () {
    pageNavigationTriggeredListener = () => {
        pageNavigationTriggered = true;
    };

    hammerhead.on(hammerhead.EVENTS.pageNavigationTriggered, pageNavigationTriggeredListener);
}

export function wait (timeout) {
    const waitForUnloadingPromise = new Promise(resolve => {
        if (timeout === void 0)
            timeout = !pageNavigationTriggeredListener || pageNavigationTriggered ? DEFAULT_BARRIER_TIMEOUT : 0;

        if (pageNavigationTriggeredListener) {
            hammerhead.off(hammerhead.EVENTS.pageNavigationTriggered, pageNavigationTriggeredListener);
            pageNavigationTriggeredListener = null;
        }

        delay(timeout)
            .then(() => {
                if (unloading) {
                    waitForFileDownload()
                        .then(() => {
                            unloading = false;
                            resolve();
                        });

                    return;
                }

                if (!waitingForUnload)
                    resolve();
                else
                    waitingPromiseResolvers.push(resolve);
            });
    });

    // NOTE: sometimes the page isn't actually unloaded after the beforeunload event
    // fires (see issues #664, #437). To avoid test hanging, we resolve the unload
    // barrier waiting promise in MAX_UNLOADING_TIMEOUT. We can improve this logic when
    // the https://github.com/DevExpress/testcafe-hammerhead/issues/667 issue is fixed.
    const watchdog = delay(MAX_UNLOADING_TIMEOUT)
        .then(() => {
            unloading = false;
        });

    return Promise.race([waitForUnloadingPromise, watchdog]);
}
