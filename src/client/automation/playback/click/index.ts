import VisibleElementAutomation, { MouseEventArgs } from '../../visible-element-automation';
import Cursor from '../../cursor/cursor';
import { ClickOptions, Modifiers } from '../../../../test-run/commands/options';
import delay from '../../../core/utils/delay';
// @ts-ignore
import { utils, Promise } from '../../deps/hammerhead';
import { createMouseClickStrategy, MouseClickStrategy } from './browser-click-strategy';

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

    protected constructor (element: HTMLElement, clickOptions: ClickOptions, win: Window, cursor: Cursor) {
        super(element, clickOptions, win, cursor);

        this.modifiers = clickOptions.modifiers;
        this.strategy = createMouseClickStrategy(this.element, clickOptions.caretPos);
    }

    private _mousedown (eventArgs: MouseEventArgs): Promise<void> {
        return this.strategy.mousedown(eventArgs);
    }

    private _mouseup (element: HTMLElement, eventArgs: MouseEventArgs): Promise<MouseEventArgs> {
        return this.strategy.mouseup(element, eventArgs);
    }

    private run (useStrictElementCheck: boolean): Promise<MouseEventArgs | null> {
        let eventArgs: MouseEventArgs;

        return this
            ._ensureElement(useStrictElementCheck)
            .then(({ element, clientPoint, screenPoint, devicePoint }) => {
                eventArgs = {
                    point:       clientPoint,
                    screenPoint: screenPoint,
                    element:     element,
                    options:     utils.extend({
                        clientX: clientPoint?.x,
                        clientY: clientPoint?.y,
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
