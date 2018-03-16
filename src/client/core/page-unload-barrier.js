import hammerhead from './deps/hammerhead';
import * as eventUtils from './utils/event';
import delay from './utils/delay';
import MESSAGE from '../../test-run/client-messages';
import { isAnchorElement } from './utils/dom';

var Promise       = hammerhead.Promise;
var browserUtils  = hammerhead.utils.browser;
var nativeMethods = hammerhead.nativeMethods;
var transport     = hammerhead.transport;


const DEFAULT_BARRIER_TIMEOUT       = 400;
const SHORT_WAIT_FOR_UNLOAD_TIMEOUT = 30;
const FILE_DOWNLOAD_CHECK_DELAY     = 500;
const MAX_UNLOADING_TIMEOUT         = 15 * 1000;


var waitingForUnload          = false;
var waitingForUnloadTimeoutId = null;
var waitingPromiseResolvers   = [];
var unloading                 = false;

var pageNavigationTriggeredListener = null;
var pageNavigationTriggered         = false;

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
                var activeElement = nativeMethods.documentActiveElementGetter.call(document);

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
    var waitForUnloadingPromise = new Promise(resolve => {
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
    var watchdog = delay(MAX_UNLOADING_TIMEOUT)
        .then(() => {
            unloading = false;
        });

    return Promise.race([waitForUnloadingPromise, watchdog]);
}
