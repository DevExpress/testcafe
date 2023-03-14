import { EventType } from '../types';
import { AxisValuesData } from '../../client/core/utils/values/axis-values';
import { SimulatedKeyInfo } from './key-press/utils';
import { DispatchEventFn } from './types';
import CDPEventDescriptor from './event-descriptor';

export default class ProxylessInput {
    private readonly _dispatchEventFn: DispatchEventFn;
    constructor (dispatchEventFn: DispatchEventFn) {
        this._dispatchEventFn = dispatchEventFn;
    }

    public async mouseDown (options: any): Promise<void> {
        const eventOptions = await CDPEventDescriptor.createMouseEventOptions('mousePressed', options);

        return this._dispatchEventFn.single(EventType.Mouse, eventOptions);
    }

    public async mouseUp (options: any): Promise<void> {
        const eventOptions = await CDPEventDescriptor.createMouseEventOptions('mouseReleased', options);

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

    public async createMouseMoveEvent (currPosition: AxisValuesData<number>): Promise<any> {
        const options = await CDPEventDescriptor.createMouseEventOptions('mouseMoved', {
            options: {
                clientX: currPosition.x,
                clientY: currPosition.y,
                button:  'none',
            },
        });

        return {
            type: EventType.Mouse,
            options,
        };
    }
}
