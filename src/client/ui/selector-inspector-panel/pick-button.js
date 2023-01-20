import testCafeCore from './../deps/testcafe-core';

import { createElementFromDescriptor } from './utils/create-element-from-descriptor';

import { pickButton } from './descriptors';
import { elementPicker } from './element-picker';

const eventUtils = testCafeCore.eventUtils;

export class PickButton {
    element;

    constructor () {
        this.element = createElementFromDescriptor(pickButton);

        eventUtils.bind(this.element, 'click', event => elementPicker.start(event));
    }
}
