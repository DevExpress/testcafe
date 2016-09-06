import hammerhead from './deps/hammerhead';
import * as eventUtils from './utils/event';
import delay from './utils/delay';

var Promise       = hammerhead.Promise;
var browserUtils  = hammerhead.utils.browser;
var nativeMethods = hammerhead.nativeMethods;


const DEFAULT_BARRIER_TIMEOUT       = 500;
const WAIT_FOR_UNLOAD_TIMEOUT       = 3000;
const SHORT_WAIT_FOR_UNLOAD_TIMEOUT = 30;
const MAX_UNLOADING_TIMEOUT         = 15 * 1000;


var waitingForUnload          = null;
var waitingForUnloadTimeoutId = null;
var waitingPromiseResolvers   = [];
var unloading                 = false;

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

function onBeforeUnload (e) {
    if (e.isFakeIEBeforeUnloadEvent)
        return;

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

    waitingForUnloadTimeoutId = nativeMethods.setTimeout.call(window, () => {
        waitingForUnloadTimeoutId = null;
        waitingForUnload          = false;

        waitingPromiseResolvers.forEach(resolve => resolve());
        waitingPromiseResolvers = [];
    }, timeout);
}


// API
export function init () {
    handleSubmit();
    handleBeforeUnload();
}

export function wait (timeout) {
    var waitForUnloadingPromise = new Promise(resolve => {
        delay(timeout === void 0 ? DEFAULT_BARRIER_TIMEOUT : timeout)
            .then(() => {
                if (unloading)
                    return;

                if (!waitingForUnload)
                    resolve();
                else
                    waitingPromiseResolvers.push(resolve);
            });
    });

    // NOTE: sometimes the page is not really unloading after the beforeunload event
    // appeared (see issues #664, #437). To avoid test hanging we resolve unload
    // barrier waiting promise in MAX_UNLOADING_TIMEOUT. We can improve this logic when
    // the https://github.com/DevExpress/testcafe-hammerhead/issues/667 issue is fixed.
    var watchdog = delay(MAX_UNLOADING_TIMEOUT)
        .then(() => {
            unloading = false;
        });

    return Promise.race([waitForUnloadingPromise, watchdog]);
}
