import VisibleElementAutomation from './visible-element-automation';


export default class HoverAutomation extends VisibleElementAutomation {
    constructor (element, hoverOptions, hasPseudo) {
        super(element, hoverOptions, hasPseudo);
    }

    run (useStrictElementCheck) {
        return this._ensureElement(useStrictElementCheck, true);
    }
}

