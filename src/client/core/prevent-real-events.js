import {
    utils,
    eventSandbox,
    nativeMethods,
} from './deps/hammerhead';

import scrollController from './scroll/controller';

import { hasDimensions } from './utils/style';
import { isShadowUIElement } from './utils/dom';

const browserUtils = utils.browser;
const listeners    = eventSandbox.listeners;

const PREVENTED_EVENTS = [
    'click', 'mousedown', 'mouseup', 'dblclick', 'contextmenu', 'mousemove', 'mouseover', 'mouseout',
    'touchstart', 'touchmove', 'touchend', 'keydown', 'keypress', 'input', 'keyup', 'change', 'focus', 'blur',
    'MSPointerDown', 'MSPointerMove', 'MSPointerOver', 'MSPointerOut', 'MSPointerUp', 'pointerdown',
    'pointermove', 'pointerover', 'pointerout', 'pointerup',
];

const F12_KEY_CODE = 123;


function checkBrowserHotkey (e) {
    // NOTE: Opening browser tools with F12, CTRL+SHIFT+<SYMBOL KEY>
    // on PC or with OPTION(ALT)+CMD+<SYMBOL KEY> on Mac.
    return e.shiftKey && e.ctrlKey || (e.altKey || e.metaKey) && browserUtils.isMacPlatform || e.keyCode === F12_KEY_CODE;
}

// NOTE: when tests are running, we should block real events (from mouse
// or keyboard), because they may lead to unexpected test result.
function preventRealEventHandler (e, dispatched, preventDefault, cancelHandlers, stopEventPropagation) {
    const target = nativeMethods.eventTargetGetter.call(e) || e.srcElement;

    if (!dispatched && !isShadowUIElement(target)) {
        // NOTE: this will allow pressing hotkeys to open developer tools.
        if (/^key/.test(e.type) && checkBrowserHotkey(e)) {
            stopEventPropagation();
            return;
        }

        // NOTE: if an element loses focus because of becoming invisible, the blur event is
        // raised. We must not prevent this blur event.
        // NOTE: fix for a jQuery bug. An exception is raised when calling .is(':visible')
        // for a window or document on page loading (when e.ownerDocument is null).
        if (e.type === 'blur' && target !== window && target !== window.document && !hasDimensions(target))
            return;

        preventDefault();
    }
}

export function preventRealEvents () {
    listeners.initElementListening(window, PREVENTED_EVENTS);
    listeners.addFirstInternalEventBeforeListener(window, PREVENTED_EVENTS, preventRealEventHandler);

    scrollController.init();
}

export function disableRealEventsPreventing () {
    listeners.removeInternalEventBeforeListener(window, PREVENTED_EVENTS, preventRealEventHandler);
}
