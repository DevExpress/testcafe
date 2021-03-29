import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import MouseDownAutomation from '../mouse-down';
import MouseUpAutomation from '../mouse-up';
import { ClickOptions } from '../../../../test-run/commands/options';
import MouseBaseAutomation from '../mouse-base';
import { MouseUpStateController } from '../automation-states';

const Promise = hammerhead.Promise;
const delay   = testCafeCore.delay;


export default class ClickAutomation extends MouseBaseAutomation {
    private mouseDownAutomation: MouseDownAutomation | null;
    private mouseUpAutomation: MouseUpAutomation | null;

    public constructor (element: HTMLElement, clickOptions: ClickOptions) {
        super(element, clickOptions);

        this.mouseDownAutomation = null;
        this.mouseUpAutomation = null;
    }

    // public get downState (): MouseDownStateController | null {
    //     return this.mouseDownAutomation ? this.mouseDownAutomation.eventState : null;
    // }
    //
    public get upState (): MouseUpStateController | null {
        return this.mouseUpAutomation ? this.mouseUpAutomation.eventState : null;
    }

    private _mousedown (): Promise<unknown> {
        if (this.ensureElementResultArgs) {
            this.mouseDownAutomation = new MouseDownAutomation(this.ensureElementResultArgs.element, this.options, this.ensureElementResultArgs);

            return this.mouseDownAutomation.run(false);
        }

        return Promise.resolve();
    }

    private _mouseup (): Promise<unknown> {
        if (this.mouseDownAutomation && this.ensureElementResultArgs) {
            this.mouseUpAutomation = new MouseUpAutomation(this.ensureElementResultArgs.element, this.options, this.mouseDownAutomation.eventState, this.ensureElementResultArgs);

            return this.mouseUpAutomation.run(false);
        }

        return Promise.resolve();
    }

    public run (useStrictElementCheck: boolean): Promise<unknown> {
        return super.run(useStrictElementCheck)
            .then(() => {
                // NOTE: we should raise mouseup event with 'mouseActionStepDelay' after we trigger
                // mousedown event regardless of how long mousedown event handlers were executing
                return Promise.all([delay(this.automationSettings.mouseActionStepDelay), this._mousedown()]);
            })
            .then(() => this._mouseup());
    }
}
