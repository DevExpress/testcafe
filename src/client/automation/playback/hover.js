import VisibleElementAutomation from '../visible-element-automation';
import cursor from '../cursor';


export default class HoverAutomation extends VisibleElementAutomation {
    constructor (element, hoverOptions, dispatchNativeAutomationEventFn) {
        super(element, hoverOptions, window, cursor, dispatchNativeAutomationEventFn);
    }

    run (useStrictElementCheck) {
        return this._ensureElement(useStrictElementCheck, true);
    }
}

