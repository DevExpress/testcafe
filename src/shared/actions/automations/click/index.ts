import VisibleElementAutomation, { MouseEventArgs } from '../visible-element-automation';
import { SharedWindow } from '../../../types';
import Cursor from '../../cursor';
import { ClickOptions, Modifiers } from '../../../../test-run/commands/options';
import delay from '../../../utils/delay';
import { MouseClickStrategyBase } from './mouse-click-strategy-base';
// @ts-ignore
import { utils } from '../../../../client/automation/deps/hammerhead';
import { createMouseClickStrategy } from '../../../../client/automation/playback/click/browser-click-strategy';

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
    public strategy: MouseClickStrategyBase<Element>;

    protected constructor (element: Element, clickOptions: ClickOptions, win: W, cursor: Cursor<W>) {
        super(element, clickOptions, win, cursor);

        this.modifiers = clickOptions.modifiers;
        this.strategy = createMouseClickStrategy(this.element, clickOptions.caretPos);
    }

    private _mousedown (eventArgs: MouseEventArgs<Element>): Promise<void> {
        return this.strategy.mousedown(eventArgs);
    }

    private _mouseup (element: Element, eventArgs: MouseEventArgs<Element>): Promise<MouseEventArgs<Element>> {
        return this.strategy.mouseup(element, eventArgs);
    }

    private run (useStrictElementCheck: boolean): Promise<MouseEventArgs<Element> | null> {
        let eventArgs: MouseEventArgs<Element>;

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
                } as unknown as MouseEventArgs<Element>;


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
