import VisibleElementAutomation from '../visible-element-automation';
import cursor from '../cursor';


export default class HoverAutomation extends VisibleElementAutomation {
    constructor (element, hoverOptions, dispatchProxylessEventFn, leftTopPoint) {
        super(element, hoverOptions, window, cursor, dispatchProxylessEventFn, leftTopPoint);
    }

    run (useStrictElementCheck) {
        return this._ensureElement(useStrictElementCheck, true);
    }
}

