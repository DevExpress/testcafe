import VisibleElementAutomation, { MouseEventArgs } from '../../visible-element-automation';
import Cursor from '../../cursor/cursor';
import { ClickOptions, Modifiers } from '../../../../test-run/commands/options';
import delay from '../../../core/utils/delay';
// @ts-ignore
import { utils, Promise } from '../../deps/hammerhead';
import { createMouseClickStrategy, MouseClickStrategy } from './browser-click-strategy';
import NativeAutomationInput from '../../../../native-automation/client/input';
import { setCaretPosition } from '../../utils/utils';
import { DispatchEventFn } from '../../../../native-automation/client/types';

export interface MouseClickEventState {
    mousedownPrevented: boolean;
    blurRaised: boolean;
    simulateDefaultBehavior: boolean;
    clickElement: Element | null;
    touchStartCancelled: boolean;
    touchEndCancelled: boolean;
}

export default class ClickAutomation extends VisibleElementAutomation {
    private modifiers: Modifiers;
    public strategy: MouseClickStrategy;

    protected constructor (element: HTMLElement, clickOptions: ClickOptions, win: Window, cursor: Cursor, dispatchNativeAutomationEventFn?: DispatchEventFn) {
        super(element, clickOptions, win, cursor, dispatchNativeAutomationEventFn);

        this.modifiers = clickOptions.modifiers;
        this.strategy  = createMouseClickStrategy(this.element, clickOptions.caretPos);
    }

    private _mousedown (eventArgs: MouseEventArgs): Promise<void> {
        if (this.canUseNativeAutomationEventSimulator(eventArgs.element))
            return (this.nativeAutomationInput as NativeAutomationInput).mouseDown(eventArgs);

        return this.strategy.mousedown(eventArgs);
    }

    private _mouseup (element: HTMLElement, eventArgs: MouseEventArgs): Promise<MouseEventArgs> {
        if (this.canUseNativeAutomationEventSimulator(eventArgs.element)) {
            return (this.nativeAutomationInput as NativeAutomationInput).mouseUp(eventArgs)
                .then(result => {
                    const caretPos = (this.options as ClickOptions).caretPos;

                    if (typeof caretPos === 'number')
                        setCaretPosition(element, caretPos);

                    return result;
                });
        }

        return this.strategy.mouseup(element, eventArgs);
    }

    private run (useStrictElementCheck: boolean): Promise<MouseEventArgs | null> {
        let eventArgs: MouseEventArgs;

        return this
            ._ensureElement(useStrictElementCheck)
            .then(({ element, clientPoint, screenPoint, devicePoint }) => {
                const boxes = element?.getClientRects();
                let clientX;
                let clientY;

                if (boxes) {
                    clientX = boxes[0].x + boxes[0].width / 2;
                    clientY = boxes[0].y + boxes[0].height / 2;
                }

                eventArgs = {
                    point:       clientPoint,
                    screenPoint: screenPoint,
                    element:     element,
                    options:     utils.extend({
                        clientX: clientX ?? clientPoint?.x,
                        clientY: clientY ?? clientPoint?.y,
                        screenX: devicePoint?.x,
                        screenY: devicePoint?.y,
                    }, this.modifiers),
                } as unknown as MouseEventArgs;

                // NOTE: we should raise mouseup event with 'mouseActionStepDelay' after we trigger
                // mousedown event regardless of how long mousedown event handlers were executing
                return Promise.all([delay(this.automationSettings.mouseActionStepDelay), this.cursor
                    .leftButtonDown()
                    .then(() => this._mousedown(eventArgs)),
                ]);
            })
            .then(() => this.cursor.buttonUp())
            .then(() => this._getElementForEvent(eventArgs))
            .then(element => {
                return element ? this._mouseup(element, eventArgs) : null;
            });
    }
}
