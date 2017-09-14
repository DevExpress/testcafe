import hammerhead from '../deps/hammerhead';
import delay from './delay';
import * as domUtils from './dom';


var Promise       = hammerhead.Promise;
var nativeMethods = hammerhead.nativeMethods;
var listeners     = hammerhead.eventSandbox.listeners;

export const RECORDING_LISTENED_EVENTS = [
    'click', 'mousedown', 'mouseup', 'dblclick', 'contextmenu', 'mousemove', 'mouseover', 'mouseout',
    'touchstart', 'touchmove', 'touchend', 'keydown', 'keypress', 'input', 'keyup', 'change', 'focus', 'blur',
    'MSPointerDown', 'MSPointerMove', 'MSPointerOver', 'MSPointerOut', 'MSPointerUp', 'pointerdown',
    'pointermove', 'pointerover', 'pointerout', 'pointerup'];

// Imported form the hammerhead
export const BUTTON            = hammerhead.utils.event.BUTTON;
export const BUTTONS_PARAMETER = hammerhead.utils.event.BUTTONS_PARAMETER;
export const DOM_EVENTS        = hammerhead.utils.event.DOM_EVENTS;
export const WHICH_PARAMETER   = hammerhead.utils.event.WHICH_PARAMETER;

export var preventDefault = hammerhead.utils.event.preventDefault;

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
    return new Promise(resolve => {
        var isReady = false;

        function ready () {
            if (isReady)
                return;

            if (!document.body) {
                nativeMethods.setTimeout.call(window, ready, 1);
                return;
            }

            isReady = true;

            resolve();
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
    });
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
