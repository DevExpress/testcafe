import uiRoot from '../ui-root';

import { createElementFromDescriptor } from './utils/create-element-from-descriptor';
import { setStyles } from './utils/set-styles';

import { panel } from './descriptors';
import { PickButton } from './pick-button';
import { SelectorInputContainer } from './selector-input-container';
import { CopyButton } from './copy-button';
import { elementPicker } from './element-picker';

export default class SelectorInspectorPanel {
    element;
    elementPicker = elementPicker;

    constructor () {
        this.element = createElementFromDescriptor(panel);

        const pickButton             = new PickButton();
        const selectorInputContainer = new SelectorInputContainer();
        const copyButton             = new CopyButton(selectorInputContainer);

        this.element.appendChild(pickButton.element);
        this.element.appendChild(selectorInputContainer.element);
        this.element.appendChild(copyButton.element);
    }

    show () {
        if (!this.element.parentElement)
            uiRoot.insertFirstChildToPanelsContainer(this.element);

        setStyles(this.element, { display: 'flex' });
    }

    hide () {
        setStyles(this.element, { display: 'none' });
    }
}
