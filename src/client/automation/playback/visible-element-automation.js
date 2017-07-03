export default class VisibleElementAutomation {
    constructor (element, options) {
        this.visibleElementRequired = true;

        this.element = element;
        this.options = options;
    }

    _moveToElement () {
        throw new Error('Not implemented');
    }

    ensureElement () {

    }
}