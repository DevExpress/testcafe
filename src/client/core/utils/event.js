import hammerhead from '../deps/hammerhead';
import * as domUtils from './dom';


var nativeMethods = hammerhead.nativeMethods;

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

export var preventDefault  = hammerhead.utils.event.preventDefault;
export var stopPropagation = hammerhead.utils.event.stopPropagation;

export function bind ($elem, event, handler) {
    $elem.each(function () {
        if (domUtils.isWindowInstance(this))
            nativeMethods.windowAddEventListener.call(this, event, handler, true);
        else
            nativeMethods.addEventListener.call(this, event, handler, true);
    });

    return $elem;
}

export function unbind ($elem, event, handler) {
    $elem.each(function () {
        if (domUtils.isWindowInstance(this))
            nativeMethods.windowRemoveEventListener.call(this, event, handler, true);
        else
            nativeMethods.removeEventListener.call(this, event, handler, true);
    });

    return $elem;
}
