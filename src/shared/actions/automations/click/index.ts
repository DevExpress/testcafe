import { adapter } from '../../../adapter';

import VisibleElementAutomation, { MouseEventArgs } from '../visible-element-automation';
import { SharedWindow } from '../../../types';
import Cursor from '../../cursor';
import { ClickOptions, Modifiers } from '../../../../test-run/commands/options';
import delay from '../../../utils/delay';
import { MouseClickStrategyBase } from './mouse-click-strategy-base';
// @ts-ignore
import { utils } from '../../../../client/automation/deps/hammerhead';

export interface MouseClickEventState<E> {
    mousedownPrevented: boolean;
    blurRaised: boolean;
    simulateDefaultBehavior: boolean;
    clickElement: E | null;
    touchStartCancelled: boolean;
    touchEndCancelled: boolean;
}

export default class ClickAutomation<E, W extends SharedWindow> extends VisibleElementAutomation<E, W> {
    private modifiers: Modifiers;
    public strategy: MouseClickStrategyBase<E>;

    protected constructor (element: Element, clickOptions: ClickOptions, win: W, cursor: Cursor<W>) {
        super(element, clickOptions, win, cursor);

        this.modifiers = clickOptions.modifiers;
        this.strategy = adapter.automations.click.createMouseClickStrategy(this.element, clickOptions.caretPos);
    }

    private _mousedown (eventArgs: MouseEventArgs<E>): Promise<void> {
        return this.strategy.mousedown(eventArgs);
    }

    private _mouseup (element: E, eventArgs: MouseEventArgs<E>): Promise<MouseEventArgs<E>> {
        return this.strategy.mouseup(element, eventArgs);
    }

    private run (useStrictElementCheck: boolean): Promise<MouseEventArgs<E> | null> {
        let eventArgs: MouseEventArgs<E>;

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
                } as unknown as MouseEventArgs<E>;


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
