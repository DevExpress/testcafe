import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';

var shadowUI = hammerhead.shadowUI;

var styleUtils = testCafeCore.styleUtils;


const CONTAINER_CLASS = 'progress-bar';
const VALUE_CLASS     = 'value';
const SUCCESS_CLASS   = 'success';


export default class ProgressBar {
    constructor (containerElement) {
        this.containerElement = document.createElement('div');
        this.valueElement     = document.createElement('div');

        containerElement.appendChild(this.containerElement);
        this.containerElement.appendChild(this.valueElement);

        shadowUI.addClass(this.containerElement, CONTAINER_CLASS);
        shadowUI.addClass(this.valueElement, VALUE_CLASS);
    }

    setValue (value) {
        value = typeof value !== 'number' ? 0 : Math.min(Math.max(value, 0), 100);

        styleUtils.set(this.valueElement, 'width', value + '%');
    }

    setSuccess (value) {
        if (value)
            shadowUI.addClass(this.containerElement, SUCCESS_CLASS);
        else
            shadowUI.removeClass(this.containerElement, SUCCESS_CLASS);
    }
}
