import VisibleElementAutomation from '../../../shared/actions/automations/visible-element-automation';
import cursor from '../cursor';


export default class HoverAutomation extends VisibleElementAutomation {
    constructor (element, hoverOptions) {
        super(element, hoverOptions, window, cursor);
    }

    run (useStrictElementCheck) {
        return this._ensureElement(useStrictElementCheck, true);
    }
}

