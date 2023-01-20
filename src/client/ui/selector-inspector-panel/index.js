import { createElementFromDescriptor } from './utils/create-element-from-descriptor';
import { addToUiRoot, removeFromUiRoot } from './utils/ui-root';

import { panel } from './descriptors';
import { PickButton } from './pick-button';
import { SelectorInputContainer } from './selector-input-container';
import { CopyButton } from './copy-button';

export default class SelectorInspectorPanel {
    element;

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
        addToUiRoot(this.element);
    }

    hide () {
        removeFromUiRoot(this.element);
    }
}
