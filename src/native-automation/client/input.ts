import { EventType } from '../types';
import { AxisValuesData } from '../../client/core/utils/values/axis-values';
import { SimulatedKeyInfo } from './key-press/utils';
import { DispatchEventFn } from './types';
import CDPEventDescriptor from './event-descriptor';
import { Modifiers } from '../../test-run/commands/options';
import hammerhead from './deps/hammerhead';

export default class NativeAutomationInput {
    private readonly _dispatchEventFn: DispatchEventFn;
    private readonly _touchMode: boolean;
    constructor (dispatchEventFn: DispatchEventFn) {
        this._dispatchEventFn = dispatchEventFn;
        this._touchMode       = hammerhead.utils.featureDetection.isTouchDevice;
    }

    private async _executeTouchEvent (touchEvent: string, options: any): Promise<void> {
        const eventOptions = await CDPEventDescriptor.createTouchEventOptions(touchEvent, options);

        return this._dispatchEventFn.single(EventType.Touch, eventOptions);
    }

    public async mouseDown (options: any): Promise<void> {
        if (this._touchMode)
            return this._executeTouchEvent('touchStart', options);

        const eventOptions = await CDPEventDescriptor.createMouseEventOptions('mousePressed', options);

        return this._dispatchEventFn.single(EventType.Mouse, eventOptions);
    }

    public async mouseUp (options: any): Promise<void> {
        if (this._touchMode)
            return this._executeTouchEvent('touchEnd', options);

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

    public async executeInsertText (text: string): Promise<any> {
        return this._dispatchEventFn.single(EventType.InsertText, { text });
    }

    public async createMouseMoveEvent (currPosition: AxisValuesData<number>, modifiers: Modifiers): Promise<any> {
        const options = await CDPEventDescriptor.createMouseEventOptions('mouseMoved', {
            options: {
                clientX: currPosition.x,
                clientY: currPosition.y,
                button:  'none',
                ...modifiers,
            },
        });

        return {
            type: EventType.Mouse,
            options,
        };
    }
}
