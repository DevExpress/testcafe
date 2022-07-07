import VisibleElementAutomation from '../../../shared/actions/automations/visible-element-automation';
import { OffsetOptions } from '../../../test-run/commands/options';
import { SharedWindow } from '../../../shared/types';
import cursor from '../cursor';

export default class ScrollIntoViewAutomation extends VisibleElementAutomation<SharedWindow> {
    public constructor (element: HTMLElement, offsetOptions: OffsetOptions) {
        super(element, offsetOptions, window, cursor);
    }

    public run (useStrictElementCheck: boolean): Promise<unknown> {
        return this._ensureElement(useStrictElementCheck, true, true);
    }
}

