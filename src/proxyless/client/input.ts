import { EventType } from '../types';
import AxisValues from '../../client/core/utils/values/axis-values';
import { SimulatedKeyInfo } from './key-press/utils';
import { DispatchEventFn } from './types';
import CDPEventDescriptor from './event-descriptor';

export default class ProxylessInput {

    private readonly _dispatchEventFn: DispatchEventFn;
    private readonly _leftTopPoint: AxisValues<number>;
    constructor (dispatchEventFn: DispatchEventFn, leftTopPoint?: AxisValues<number>) {
        this._dispatchEventFn = dispatchEventFn;
        this._leftTopPoint    = leftTopPoint || new AxisValues<number>(0, 0);
    }

    public mouseDown (options: any): Promise<void> {
        const eventOptions = CDPEventDescriptor.createMouseEventOptions('mousePressed', options, this._leftTopPoint);

        return this._dispatchEventFn.single(EventType.Mouse, eventOptions);
    }

    public mouseUp (options: any): Promise<void> {
        const eventOptions = CDPEventDescriptor.createMouseEventOptions('mouseReleased', options, this._leftTopPoint);

        return this._dispatchEventFn.single(EventType.Mouse, eventOptions);
    }

    public keyDown (options: SimulatedKeyInfo): Promise<void> {
        const eventOptions = CDPEventDescriptor.createKeyDownOptions(options);

        return this._dispatchEventFn.single(EventType.Keyboard, eventOptions);
    }
    public keyUp (options: SimulatedKeyInfo): Promise<void> {
        const eventOptions = CDPEventDescriptor.createKeyUpOptions(options);

        return this._dispatchEventFn.single(EventType.Keyboard, eventOptions);
    }

    public executeEventSequence (eventSequence: any[]): Promise<void> {
        return this._dispatchEventFn.sequence(eventSequence);
    }
}
