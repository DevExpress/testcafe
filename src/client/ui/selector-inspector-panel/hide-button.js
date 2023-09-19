import hammerhead from './../deps/hammerhead';
import testCafeCore from './../deps/testcafe-core';
import { createElementFromDescriptor } from './utils/create-element-from-descriptor';
import * as descriptors from './descriptors';

const nativeMethods = hammerhead.nativeMethods;
const eventUtils = testCafeCore.eventUtils;

export class HideButton {

    constructor (element) {
        this.element       = createElementFromDescriptor(descriptors.hideButton);
        this.hideElement   = element;

        this.element.appendChild(createElementFromDescriptor(descriptors.span));

        eventUtils.bind(this.element, 'click', () => this._showAndHide());
    }

    _showAndHide () {
        nativeMethods.elementClassListGetter.call(this.hideElement).toggle('selector-inspector-panel--hide-hammerhead-shadow-ui');
    }
}
