import { utils, eventSandbox } from './deps/hammerhead';

import scrollController from './scroll-controller';

import { get, hasDimensions } from './utils/style';
import { filter } from './utils/array';
import { isShadowUIElement, isWindow, getParents } from './utils/dom';

var browserUtils   = utils.browser;
var listeners      = eventSandbox.listeners;
var eventSimulator = eventSandbox.eventSimulator;

const PREVENTED_EVENTS = [
    'click', 'mousedown', 'mouseup', 'dblclick', 'contextmenu', 'mousemove', 'mouseover', 'mouseout',
    'touchstart', 'touchmove', 'touchend', 'keydown', 'keypress', 'input', 'keyup', 'change', 'focus', 'blur',
    'MSPointerDown', 'MSPointerMove', 'MSPointerOver', 'MSPointerOut', 'MSPointerUp', 'pointerdown',
    'pointermove', 'pointerover', 'pointerout', 'pointerup'
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
    var target = e.target || e.srcElement;

    if (!dispatched && !isShadowUIElement(target)) {
        // NOTE: this will allow pressing hotkeys to open developer tools.
        if (/^key/.test(e.type) && checkBrowserHotkey(e)) {
            stopEventPropagation();
            return;
        }

        // NOTE: if an element loses focus because of becoming invisible, the blur event is
        // raised. We must not prevent this blur event. In IE, an element loses focus only
        // if the CSS 'display' property is set to 'none', other ways of making an element
        // invisible don't lead to blurring (in MSEdge, focus/blur are sync).
        if (e.type === 'blur') {
            if (browserUtils.isIE && browserUtils.version < 12) {
                var isElementInvisible = !isWindow(target) && get(target, 'display') === 'none';
                var elementParents     = null;
                var invisibleParents   = false;

                if (!isElementInvisible) {
                    elementParents   = getParents(target);
                    invisibleParents = filter(elementParents, parent => get(parent, 'display') === 'none');
                }

                if (isElementInvisible || invisibleParents.length) {
                    // NOTE: In IE we should prevent the event and raise it on timeout. This is a fix for
                    // the case when a focus event leads to the element disappearing. If we don't prevent
                    // the blur event it will be raised before the previous focus event is raised (see B254768)
                    eventSandbox.timers.deferFunction(() => {
                        eventSimulator.blur(target);
                    });
                }
            }
            // NOTE: fix for a jQuery bug. An exception is raised when calling .is(':visible')
            // for a window or document on page loading (when e.ownerDocument is null).
            else if (target !== window && target !== window.document && !hasDimensions(target))
                return;
        }

        preventDefault();
    }
}

export function preventRealEvents () {
    listeners.initElementListening(window, PREVENTED_EVENTS);
    listeners.addFirstInternalHandler(window, PREVENTED_EVENTS, preventRealEventHandler);

    scrollController.init();
}

export function disableRealEventsPreventing () {
    listeners.removeInternalEventListener(window, PREVENTED_EVENTS, preventRealEventHandler);
}
