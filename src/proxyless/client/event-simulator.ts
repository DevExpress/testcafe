import { EventType } from '../types';
// @ts-ignore
import { utils } from '../../client/core/deps/hammerhead';
import { calculateKeyModifiersValue, calculateMouseButtonValue } from './utils';

const MOUSE_EVENT_OPTIONS = {
    clickCount: 1,
    button:     'left',
};

export default class ProxylessEventSimulator {

    private readonly _dispatchEventFn: Function;
    constructor (dispatchEventFn: Function) {
        this._dispatchEventFn = dispatchEventFn;
    }

    private _createMouseEventOptions (type: string, options: any): any {
        return utils.extend({
            x:         options.options.clientX,
            y:         options.options.clientY,
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
