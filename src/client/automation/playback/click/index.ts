import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import VisibleElementAutomation from '../visible-element-automation';
import MouseDownAutomation from '../mouse-down';
import MouseUpAutomation from '../mouse-up';
import { ClickOptions } from '../../../../test-run/commands/options';
import { MouseDownStateController, MouseUpStateController } from '../automation-states';
import { EnsureElementResult, EnsureElementResultArgs } from '../interfaces';

const Promise = hammerhead.Promise;
const extend  = hammerhead.utils.extend;
const delay   = testCafeCore.delay;


export default class ClickAutomation extends VisibleElementAutomation {
    private modifiers: unknown;
    private mouseDownAutomation: MouseDownAutomation | null;
    private mouseUpAutomation: MouseUpAutomation | null;

    public constructor (element: HTMLElement, clickOptions: ClickOptions) {
        super(element, clickOptions);

        this.modifiers = clickOptions.modifiers;

        this.mouseDownAutomation = null;
        this.mouseUpAutomation = null;
    }

    public get downState (): MouseDownStateController | null {
        return this.mouseDownAutomation ? this.mouseDownAutomation.eventState : null;
    }

    public get upState (): MouseUpStateController | null {
        return this.mouseUpAutomation ? this.mouseUpAutomation.upState : null;
    }

    private _mousedown (eventArgs: EnsureElementResultArgs): Promise<unknown> {
        this.mouseDownAutomation = new MouseDownAutomation(eventArgs.element, this.options, eventArgs);

        return this.mouseDownAutomation.run(false);
    }

    private _mouseup (eventArgs: EnsureElementResultArgs): Promise<unknown> {
        if (!this.mouseDownAutomation)
            return Promise.resolve();

        this.mouseUpAutomation = new MouseUpAutomation(null, this.options, this.mouseDownAutomation.eventState, eventArgs);

        return this.mouseUpAutomation.run(false);
    }

    private run (useStrictElementCheck: boolean): Promise<unknown> {
        return this
            ._ensureElement(useStrictElementCheck, false, false)
            .then(({ element, clientPoint, screenPoint, devicePoint }: EnsureElementResult) => {
                const eventArgs: EnsureElementResultArgs = {
                    point:       clientPoint,
                    screenPoint: screenPoint,
                    element:     element,
                    options:     extend({
                        clientX: clientPoint.x,
                        clientY: clientPoint.y,
                        screenX: devicePoint.x,
                        screenY: devicePoint.y
                    }, this.modifiers)
                };

                // NOTE: we should raise mouseup event with 'mouseActionStepDelay' after we trigger
                // mousedown event regardless of how long mousedown event handlers were executing
                return Promise.all([delay(this.automationSettings.mouseActionStepDelay), this._mousedown(eventArgs)])
                    .then(() => eventArgs);
            })
            .then((eventArgs: EnsureElementResultArgs) => this._mouseup(eventArgs));
    }
}
