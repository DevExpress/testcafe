import testCafeCore from '../../deps/testcafe-core';
import DragAutomationBase from './base';
import { getOffsetOptions } from '../../utils/offsets';

var positionUtils = testCafeCore.positionUtils;


export default class DragToElementAutomation extends DragAutomationBase {
    constructor (element, destinationElement, dragToElementOptions) {
        super(element, dragToElementOptions);

        this.destinationElement = destinationElement;
        this.destinationOffsetX = dragToElementOptions.destinationOffsetX;
        this.destinationOffsetY = dragToElementOptions.destinationOffsetY;
    }

    _getDestination () {
        var element     = this.destinationElement;
        var elementRect = positionUtils.getElementRectangle(element);
        var offsets     = getOffsetOptions(element, this.destinationOffsetX, this.destinationOffsetY);

        var endPoint = {
            x: elementRect.left + offsets.offsetX,
            y: elementRect.top + offsets.offsetY
        };

        return { element, offsets, endPoint };
    }
}
