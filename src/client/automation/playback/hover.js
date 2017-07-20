import VisibleElementAutomation from './visible-element-automation';


export default class HoverAutomation extends VisibleElementAutomation {
    constructor (element, hoverOptions) {
        super(element, hoverOptions);
    }

    run (selectorTimeout = 0, checkElementInterval = 0) {
        return this._ensureElement(selectorTimeout, checkElementInterval);
    }
}

