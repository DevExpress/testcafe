import hammerhead from './../deps/hammerhead';
import testCafeCore from './../deps/testcafe-core';
import { createElementFromDescriptor } from './utils/create-element-from-descriptor';
import * as descriptors from './descriptors';

const nativeMethods                             = hammerhead.nativeMethods;
const eventUtils                                = testCafeCore.eventUtils;
const SELECTOR_INSPECTOR_PANEL_HIDDEN_CLASSNAME = 'selector-inspector-panel--hidden-hammerhead-shadow-ui';

export class HideButton {
    constructor (selectorInspectorPanel) {

        const hideButton = createElementFromDescriptor(descriptors.hideButton);
        this.element     = createElementFromDescriptor(descriptors.hideButtonContainer);

        this.element.appendChild(hideButton);
        this.element.appendChild(createElementFromDescriptor(descriptors.span));

        eventUtils.bind(this.element, 'click', () => this._showAndHide(selectorInspectorPanel));
    }

    _showAndHide (selectorInspectorPanel) {
        nativeMethods.elementClassListGetter.call(selectorInspectorPanel).toggle(SELECTOR_INSPECTOR_PANEL_HIDDEN_CLASSNAME);
    }
}
