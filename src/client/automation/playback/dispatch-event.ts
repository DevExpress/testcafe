import hammerhead from '../deps/hammerhead';
import { Dictionary } from '../../../configuration/interfaces';

const nativeMethods = hammerhead.nativeMethods;

const MOUSE_EVENT_NAME_RE   = /^((mouse\w+)|((dbl)?click)|(contextmenu))$/;
const DRAG_EVENT_NAME_RE    = /^((drag\w*)|(drop))$/;
const KEY_EVENT_NAME_RE     = /^key\w+$/;
const INPUT_EVENT_NAME_RE   = /^(before)?input$/;
const FOCUS_EVENT_NAME_RE   = /^(blur|(focus(in|out)?))$/;
const POINTER_EVENT_NAME_RE = /^pointer\w+/;

const DEFAULT_MOUSE_EVENT_DETAIL_PROP_VALUE: Dictionary<number> = {
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

interface DispatchEventInit {
    [key: string]: unknown;
    bubbles?: boolean;
    cancelable?: boolean;
    detail?: unknown;
    view?: unknown;
    buttons?: number;
}

interface EventConstructor {
    new(eventName: string, options: DispatchEventInit): Event;
}

export default class DispatchEventAutomation {
    private element: HTMLElement;
    private eventName: string;
    private options: DispatchEventInit;

    public constructor (element: HTMLElement, eventName: string, options: DispatchEventInit) {
        this.element   = element;
        this.eventName = eventName;
        this.options   = options;
    }
    public run (): void {
        let {
            bubbles,
            cancelable,
            detail,
            view,
            buttons
        } = this.options;

        bubbles    = bubbles !== false;
        cancelable = cancelable !== false;
        detail     = detail || DEFAULT_MOUSE_EVENT_DETAIL_PROP_VALUE[this.eventName];
        view       = window;
        buttons    = buttons === void 0 ? DEFAULT_BUTTONS_PARAMETER : buttons;

        // eslint-disable-next-line no-restricted-globals
        Object.assign(this.options, { bubbles, cancelable, detail, view, buttons });

        const Ctor = DispatchEventAutomation._getEventCtorByEventType(this.eventName, this.options.eventConstructor as string);

        if (Ctor) {
            const event = new Ctor(this.eventName, this.options);

            this.element.dispatchEvent(event);
        }
    }

    private static _getEventCtorByEventType (eventName: string, eventConstructor: string): EventConstructor {
        if (eventConstructor && typeof DispatchEventAutomation._getEventCtorFromWindow(eventConstructor) === 'function') {
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

    private static _getEventCtorFromNativeMethods (eventCtor: string): EventConstructor {
        const ctor = nativeMethods['Window' + eventCtor] || DispatchEventAutomation._getEventCtorFromWindow(eventCtor);

        return ctor as EventConstructor;
    }

    private static _getEventCtorFromWindow (eventCtor: string): EventConstructor {
        // @ts-ignore
        return window[eventCtor] as EventConstructor;
    }
}

