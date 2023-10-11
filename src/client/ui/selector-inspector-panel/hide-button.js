import hammerhead from './../deps/hammerhead';
import testCafeCore from './../deps/testcafe-core';
import { createElementFromDescriptor } from './utils/create-element-from-descriptor';
import * as descriptors from './descriptors';

const nativeMethods = hammerhead.nativeMethods;
const eventUtils = testCafeCore.eventUtils;

const SELECTOR_INSPECTOR_BTN_SHOW_PANEL_CLASSNAME = 'selector-panel-toggle-button--show-hammerhead-shadow-ui';

export class HideButton {

    constructor () {
        this.element = createElementFromDescriptor(descriptors.hideButton);

        this.element.appendChild(createElementFromDescriptor(descriptors.span));

        eventUtils.bind(this.element, 'click', () => this._showAndHide());
    }

    _showAndHide () {
        nativeMethods.elementClassListGetter.call(this.element).toggle(SELECTOR_INSPECTOR_BTN_SHOW_PANEL_CLASSNAME);
    }
}
