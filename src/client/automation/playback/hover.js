import VisibleElementAutomation from '../visible-element-automation';
import cursor from '../cursor';


export default class HoverAutomation extends VisibleElementAutomation {
    constructor (element, hoverOptions, dispatchProxylessEventFn) {
        super(element, hoverOptions, window, cursor, dispatchProxylessEventFn);
    }

    run (useStrictElementCheck) {
        return this._ensureElement(useStrictElementCheck, true);
    }
}

