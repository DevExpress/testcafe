import VisibleElementAutomation from './visible-element-automation';
import { OffsetOptions } from '../../../test-run/commands/options';


export default class ScrollIntoViewAutomation extends VisibleElementAutomation {
    public constructor (element: HTMLElement, offsetOptions: OffsetOptions, hasPseudo: boolean) {
        super(element, offsetOptions, hasPseudo);
    }

    public run (useStrictElementCheck: boolean): Promise<unknown> {
        return this._ensureElement(useStrictElementCheck, true, true);
    }
}

