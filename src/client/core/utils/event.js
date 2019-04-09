import hammerhead from '../deps/hammerhead';
import delay from './delay';
import * as domUtils from './dom';


const Promise       = hammerhead.Promise;
const nativeMethods = hammerhead.nativeMethods;
const listeners     = hammerhead.eventSandbox.listeners;

// Imported form the hammerhead
export const BUTTON            = hammerhead.utils.event.BUTTON;
export const BUTTONS_PARAMETER = hammerhead.utils.event.BUTTONS_PARAMETER;
export const DOM_EVENTS        = hammerhead.utils.event.DOM_EVENTS;
export const WHICH_PARAMETER   = hammerhead.utils.event.WHICH_PARAMETER;

export const preventDefault = hammerhead.utils.event.preventDefault;

export function bind (el, event, handler, useCapture) {
    if (domUtils.isWindow(el))
        nativeMethods.windowAddEventListener.call(el, event, handler, useCapture);
    else
        nativeMethods.addEventListener.call(el, event, handler, useCapture);
}

export function unbind (el, event, handler, useCapture) {
    if (domUtils.isWindow(el))
        nativeMethods.windowRemoveEventListener.call(el, event, handler, useCapture);
    else
        nativeMethods.removeEventListener.call(el, event, handler, useCapture);
}


// Document ready
const waitForDomContentLoaded = () => {
    // NOTE: We can't use a regular Promise here, because window.load event can happen in the same event loop pass
    // The default Promise will call resolve handlers in the next pass, and load event will be lost.
    const resolveHandlers = [];

    function createPromiseResolver (resolveHandler) {
        return new Promise(resolve => resolveHandlers.push(() => resolve(resolveHandler())));
    }

    let isReady = false;

    function ready () {
        if (isReady)
            return;

        if (!document.body) {
            nativeMethods.setTimeout.call(window, ready, 1);
            return;
        }

        isReady = true;

        resolveHandlers.forEach(handler => handler());
    }

    function onContentLoaded () {
        if (!domUtils.isIFrameWindowInDOM(window) && !domUtils.isTopWindow(window))
            return;

        unbind(document, 'DOMContentLoaded', onContentLoaded);
        ready();
    }

    if (document.readyState === 'complete')
        nativeMethods.setTimeout.call(window, onContentLoaded, 1);
    else
        bind(document, 'DOMContentLoaded', onContentLoaded);

    return { then: handler => createPromiseResolver(handler) };
};

const waitForWindowLoad = () => new Promise(resolve => bind(window, 'load', resolve));

export function documentReady (pageLoadTimeout = 0) {
    return waitForDomContentLoaded()
        .then(() => {
            if (!listeners.getEventListeners(window, 'load').length)
                return null;

            return Promise.race([waitForWindowLoad(), delay(pageLoadTimeout)]);
        });
}
