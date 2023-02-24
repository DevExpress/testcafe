import { EventType } from '../types';
// @ts-ignore
import { utils } from '../../client/core/deps/hammerhead';
import { calculateKeyModifiersValue, calculateMouseButtonValue } from './utils';
import AxisValues from '../../client/core/utils/values/axis-values';
import { SimulatedKeyInfo } from './key-press/utils';
import { DispatchEventFn } from './types';

const MOUSE_EVENT_OPTIONS = {
    clickCount: 1,
    button:     'left',
};

export default class ProxylessInput {

    private readonly _dispatchEventFn: DispatchEventFn;
    private readonly _leftTopPoint: AxisValues<number>;
    constructor (dispatchEventFn: DispatchEventFn, leftTopPoint?: AxisValues<number>) {
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

        return this._dispatchEventFn.single(EventType.Mouse, eventOptions);
    }

    public mouseUp (options: any): Promise<void> {
        const eventOptions = this._createMouseEventOptions('mouseReleased', options);

        return this._dispatchEventFn.single(EventType.Mouse, eventOptions);
    }

    public createKeyDownOptions (options: SimulatedKeyInfo): any {
        const text = this._getKeyDownEventText(options);

        return {
            type:                  text ? 'keyDown' : 'rawKeyDown',
            modifiers:             options.modifiers || 0,
            windowsVirtualKeyCode: options.keyCode,
            key:                   options.keyProperty,
            text,
        };
    }

    public createKeyUpOptions (options: SimulatedKeyInfo): any {
        return {
            type:                  'keyUp',
            modifiers:             options.modifiers || 0,
            key:                   options.keyProperty,
            windowsVirtualKeyCode: options.keyCode,
        };
    }

    public keyDown (options: SimulatedKeyInfo): Promise<void> {
        const eventOptions = this.createKeyDownOptions(options);

        return this._dispatchEventFn.single(EventType.Keyboard, eventOptions);
    }
    public keyUp (options: SimulatedKeyInfo): Promise<void> {
        const eventOptions = this.createKeyUpOptions(options);

        return this._dispatchEventFn.single(EventType.Keyboard, eventOptions);
    }

    public executeEventSequence (eventSequence: any[]): Promise<void> {
        return this._dispatchEventFn.sequence(eventSequence);
    }
}
