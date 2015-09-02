import * as hammerheadAPI from '../deps/hammerhead';
import * as domUtils from './dom';


var hhEventUtils  = hammerheadAPI.Util.Event;
var nativeMethods = hammerheadAPI.NativeMethods;


export const RECORDING_LISTENED_EVENTS = [
    'click', 'mousedown', 'mouseup', 'dblclick', 'contextmenu', 'mousemove', 'mouseover', 'mouseout',
    'touchstart', 'touchmove', 'touchend', 'keydown', 'keypress', 'input', 'keyup', 'change', 'focus', 'blur',
    'MSPointerDown', 'MSPointerMove', 'MSPointerOver', 'MSPointerOut', 'MSPointerUp', 'pointerdown',
    'pointermove', 'pointerover', 'pointerout', 'pointerup'];

// Imported form the hammerhead
export const BUTTON            = hhEventUtils.BUTTON;
export const BUTTONS_PARAMETER = hhEventUtils.BUTTONS_PARAMETER;
export const DOM_EVENTS        = hhEventUtils.DOM_EVENTS;
export const WHICH_PARAMETER   = hhEventUtils.WHICH_PARAMETER;

export var preventDefault  = hhEventUtils.preventDefault;
export var stopPropagation = hhEventUtils.stopPropagation;

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
