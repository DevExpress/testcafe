import hammerhead from './deps/hammerhead';
import * as eventUtils from './utils/event';
import delay from './utils/delay';
import MESSAGE from '../../test-run/client-messages';

var Promise       = hammerhead.Promise;
var browserUtils  = hammerhead.utils.browser;
var nativeMethods = hammerhead.nativeMethods;
var transport     = hammerhead.transport;


const DEFAULT_BARRIER_TIMEOUT       = 400;
const WAIT_FOR_UNLOAD_TIMEOUT       = 3000;
const SHORT_WAIT_FOR_UNLOAD_TIMEOUT = 30;
const FILE_DOWNLOAD_CHECK_DELAY     = 500;
const MAX_UNLOADING_TIMEOUT         = 15 * 1000;


var waitingForUnload          = false;
var waitingForUnloadTimeoutId = null;
var waitingPromiseResolvers   = [];
var unloading                 = false;

var pageNavigationTriggeredListener = false;
var pageNavigationTriggered         = false;

function overrideFormSubmit (form) {
    var submit = form.submit;

    form.submit = () => {
        prolongUnloadWaiting(WAIT_FOR_UNLOAD_TIMEOUT);
        submit.apply(form, arguments);
    };
}

function handleSubmit () {
    eventUtils.bind(document, 'submit', e => {
        if (e.target.tagName.toLowerCase() === 'form')
            prolongUnloadWaiting(WAIT_FOR_UNLOAD_TIMEOUT);
    });

    var forms = document.getElementsByTagName('form');

    for (var i = 0; i < forms.length; i++)
        overrideFormSubmit(forms[i]);
}

function onBeforeUnload () {
    if (!browserUtils.isIE) {
        unloading = true;
        return;
    }

    prolongUnloadWaiting(SHORT_WAIT_FOR_UNLOAD_TIMEOUT);

    delay(0)
        .then(() => {
            // NOTE: except file downloading
            if (document.readyState === 'loading' &&
                !(document.activeElement && document.activeElement.tagName.toLowerCase() === 'a' &&
                document.activeElement.hasAttribute('download')))
                unloading = true;
        });
}

function handleBeforeUnload () {
    hammerhead.on(hammerhead.EVENTS.beforeUnload, onBeforeUnload);

    eventUtils.bind(window, 'unload', () => {
        unloading = true;
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

function waitForFailDownload () {
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
    handleSubmit();
    handleBeforeUnload();
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
                    waitForFailDownload()
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
