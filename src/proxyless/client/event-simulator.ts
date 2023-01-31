import { EventType } from '../types';
// @ts-ignore
import { utils } from '../../client/core/deps/hammerhead';
import { calculateKeyModifiersValue, calculateMouseButtonValue } from './utils';
import AxisValues from '../../client/core/utils/values/axis-values';

const MOUSE_EVENT_OPTIONS = {
    clickCount: 1,
    button:     'left',
};

export default class ProxylessEventSimulator {

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

    public mouseDown (options: any): Promise<void> {
        const eventOptions = this._createMouseEventOptions('mousePressed', options);

        return this._dispatchEventFn(EventType.Mouse, eventOptions);
    }

    public mouseUp (options: any): Promise<void> {
        const eventOptions = this._createMouseEventOptions('mouseReleased', options);

        return this._dispatchEventFn(EventType.Mouse, eventOptions);
    }
}
