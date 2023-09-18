import hammerhead from './../deps/hammerhead';
import testCafeCore from './../deps/testcafe-core';
import { createElementFromDescriptor } from './utils/create-element-from-descriptor';
import { setStyles } from './utils/set-styles';

import * as descriptors from './descriptors';

const nativeMethods = hammerhead.nativeMethods;

const eventUtils = testCafeCore.eventUtils;

const VALUES = {
    show:   'Hide',
    hide: 'Show',
};

export class HideButton {

    constructor (element) {
        this.element       = createElementFromDescriptor(descriptors.hideButton);
        this.hideElement   = element;
        this.isHide        = true

        eventUtils.bind(this.element, 'click', () => this._showAndHide());
    }

    _showAndHide () {
        this._changeAppearance(this.isHide ? VALUES.hide : VALUES.show, 'bold');
        setStyles(this.hideElement,this.isHide ? {display: 'none'} : {display: 'flex'})
        this.isHide = !this.isHide;

    }

    _changeAppearance (value, fontWeight) {
        nativeMethods.inputValueSetter.call(this.element, value);

        setStyles(this.element, { fontWeight });
    }
}
