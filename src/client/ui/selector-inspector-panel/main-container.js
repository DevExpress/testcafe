import { createElementFromDescriptor } from './utils/create-element-from-descriptor';

import { panelContainer } from './descriptors';


export class MainContainer {
    constructor (...elements) {
        this.element = createElementFromDescriptor(panelContainer);

        elements.forEach(el => this.element.appendChild(el));
    }
}
