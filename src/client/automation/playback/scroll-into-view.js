import VisibleElementAutomation from './visible-element-automation';


export default class ScrollIntoViewAutomation extends VisibleElementAutomation {
    constructor (element, offsetOptions) {
        super(element, offsetOptions);
    }

    run (useStrictElementCheck) {
        return this._ensureElement(useStrictElementCheck, true, true);
    }
}

