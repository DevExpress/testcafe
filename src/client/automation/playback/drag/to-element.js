import testCafeCore from '../../deps/testcafe-core';
import DragAutomationBase from './base';
import { getOffsetOptions } from '../../utils/offsets';

const positionUtils = testCafeCore.positionUtils;


export default class DragToElementAutomation extends DragAutomationBase {
    constructor (element, destinationElement, dragToElementOptions) {
        super(element, dragToElementOptions);

        this.destinationElement = destinationElement;
        this.destinationOffsetX = dragToElementOptions.destinationOffsetX;
        this.destinationOffsetY = dragToElementOptions.destinationOffsetY;
    }

    _getDestination () {
        const element     = this.destinationElement;
        const elementRect = positionUtils.getElementRectangle(element);
        const offsets     = getOffsetOptions(element, this.destinationOffsetX, this.destinationOffsetY);

        const endPoint = {
            x: elementRect.left + offsets.offsetX,
            y: elementRect.top + offsets.offsetY
        };

        return { element, offsets, endPoint };
    }
}
