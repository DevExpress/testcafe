import hammerhead from '../deps/hammerhead';

const nativeMethods = hammerhead.nativeMethods;

const MOUSE_EVENT_NAME_RE   = /^((mouse\w+)|((dbl)?click)|(contextmenu))$/;
const DRAG_EVENT_NAME_RE    = /^((drag\w*)|(drop))$/;
const KEY_EVENT_NAME_RE     = /^key\w+$/;
const INPUT_EVENT_NAME_RE   = /^(before)?input$/;
const FOCUS_EVENT_NAME_RE   = /^(blur|(focus(in|out)?))$/;
const POINTER_EVENT_NAME_RE = /^pointer\w+/;

const DEFAULT_MOUSE_EVENT_DETAIL_PROP_VALUE = {
    click:     1,
    dblclick:  2,
    mousedown: 1,
    mouseup:   1
};

// NOTE: default e.buttons for left button pressed
const DEFAULT_BUTTONS_PARAMETER = 1;

const EVENT_CTORS = {
    MouseEvent:    'MouseEvent',
    PointerEvent:  'PointerEvent',
    KeyboardEvent: 'KeyboardEvent',
    InputEvent:    'InputEvent',
    FocusEvent:    'FocusEvent'
};

export default class DispatchEventAutomation {
    constructor (element, eventName, options) {
        this._element = element;
        this._eventName = eventName;
        this._options = options;
    }

    run () {
        let {
            bubbles,
            cancelable,
            detail,
            view,
            buttons
        } = this._options;

        bubbles    = bubbles !== false;
        cancelable = cancelable !== false;
        detail     = detail || DEFAULT_MOUSE_EVENT_DETAIL_PROP_VALUE[this._eventName];
        view       = document.window;
        buttons    = buttons === void 0 ? DEFAULT_BUTTONS_PARAMETER : buttons;

        window.Object.assign(this._options, { bubbles, cancelable, detail, view, buttons });

        const Ctor = DispatchEventAutomation._getEventCtorByEventType(this._eventName, this._options.eventConstructor);

        if (Ctor)
            this._element.dispatchEvent(new Ctor(this._eventName, this._options));
    }

    static _getEventCtorByEventType (eventName, eventConstructor) {
        if (eventConstructor && typeof window[eventConstructor] === 'function') {
            const Ctor = DispatchEventAutomation._getEventCtorFromNativeMethods(eventConstructor);

            if (Ctor && typeof Ctor === 'function')
                return Ctor;
        }

        if (MOUSE_EVENT_NAME_RE.test(eventName))
            return DispatchEventAutomation._getEventCtorFromNativeMethods(EVENT_CTORS.MouseEvent);

        if (DRAG_EVENT_NAME_RE.test(eventName))
            return DispatchEventAutomation._getEventCtorFromNativeMethods(EVENT_CTORS.MouseEvent);

        if (POINTER_EVENT_NAME_RE.test(eventName))
            return DispatchEventAutomation._getEventCtorFromNativeMethods(EVENT_CTORS.PointerEvent);

        if (KEY_EVENT_NAME_RE.test(eventName))
            return DispatchEventAutomation._getEventCtorFromNativeMethods(EVENT_CTORS.KeyboardEvent);

        if (INPUT_EVENT_NAME_RE.test(eventName))
            return DispatchEventAutomation._getEventCtorFromNativeMethods(EVENT_CTORS.InputEvent);

        if (FOCUS_EVENT_NAME_RE.test(eventName))
            return DispatchEventAutomation._getEventCtorFromNativeMethods(EVENT_CTORS.FocusEvent);

        return DispatchEventAutomation._getEventCtorFromNativeMethods('CustomEvent');
    }

    static _getEventCtorFromNativeMethods (eventCtor) {
        return nativeMethods['Window' + eventCtor] || window[eventCtor];
    }
}

