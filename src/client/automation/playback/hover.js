import VisibleElementAutomation from './visible-element-automation';


export default class HoverAutomation extends VisibleElementAutomation {
    constructor (element, hoverOptions) {
        super(element, hoverOptions);
    }

    run (useStrictElementCheck) {
        return this._ensureElement(useStrictElementCheck, true);
    }
}

