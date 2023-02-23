import { EventType } from '../types';
// @ts-ignore
import { utils } from '../../client/core/deps/hammerhead';
import { calculateKeyModifiersValue, calculateMouseButtonValue } from './utils';
import AxisValues from '../../client/core/utils/values/axis-values';
import { SimulatedKeyInfo } from './key-press/utils';

const MOUSE_EVENT_OPTIONS = {
    clickCount: 1,
    button:     'left',
};

export default class ProxylessInput {

    private readonly _dispatchEventFn: Function;
    private readonly _leftTopPoint: AxisValues<number>;
    constructor (dispatchEventFn: Function, leftTopPoint?: AxisValues<number>) {
        this._dispatchEventFn = dispatchEventFn;
        this._leftTopPoint    = leftTopPoint || new AxisValues<number>(0, 0);
    }

    private _createMouseEventOptions (type: string, options: any): any {
        return utils.extend({
            x:         options.options.clientX + this._leftTopPoint.x,
            y:         options.options.clientY + this._leftTopPoint.y,
            modifiers: calculateKeyModifiersValue(options.options),
            button:    calculateMouseButtonValue(options.options),
            type,
        }, MOUSE_EVENT_OPTIONS);
    }

    private _getKeyDownEventText (options: SimulatedKeyInfo): any {
        if (options.isNewLine)
            return '\r';

        if (options.keyProperty.length === 1)
            return options.keyProperty;

        return '';
    }

    public mouseDown (options: any): Promise<void> {
        const eventOptions = this._createMouseEventOptions('mousePressed', options);

        return this._dispatchEventFn(EventType.Mouse, eventOptions);
    }

    public mouseUp (options: any): Promise<void> {
        const eventOptions = this._createMouseEventOptions('mouseReleased', options);

        return this._dispatchEventFn(EventType.Mouse, eventOptions);
    }

    public keyDown (options: SimulatedKeyInfo): Promise<void> {
        const text = this._getKeyDownEventText(options);

        const eventOptions = {
            type:                  text ? 'keyDown' : 'rawKeyDown',
            modifiers:             options.modifiers || 0,
            windowsVirtualKeyCode: options.keyCode,
            key:                   options.keyProperty,
            text,
        };

        return this._dispatchEventFn(EventType.Keyboard, eventOptions);
    }
    public keyUp (options: SimulatedKeyInfo): Promise<void> {
        const eventOptions = {
            type:                  'keyUp',
            modifiers:             options.modifiers || 0,
            key:                   options.keyProperty,
            windowsVirtualKeyCode: options.keyCode,
        };

        return this._dispatchEventFn(EventType.Keyboard, eventOptions);
    }
}
