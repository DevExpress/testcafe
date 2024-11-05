import testCafeCore from '../../deps/testcafe-core';
import DragAutomationBase from './base';
import { getOffsetOptions } from '../../../core/utils/offsets';
import getElementFromPoint from '../../get-element';
import cursor from '../../cursor';
import hammerhead from '../../deps/hammerhead';

const positionUtils = testCafeCore.positionUtils;
const eventSimulator   = hammerhead.eventSandbox.eventSimulator;
const extend           = hammerhead.utils.extend;


export default class DragToElementAutomation extends DragAutomationBase {
    constructor (element, destinationElement, dragToElementOptions) {
        super(element, dragToElementOptions);

        this.destinationElement = destinationElement;
        this.destinationOffsetX = dragToElementOptions.destinationOffsetX;
        this.destinationOffsetY = dragToElementOptions.destinationOffsetY;
    }

    async _getDestination () {
        const element     = this.destinationElement;
        const elementRect = positionUtils.getElementRectangle(element);
        const offsets     = getOffsetOptions(element, this.destinationOffsetX, this.destinationOffsetY);

        const endPoint = {
            x: elementRect.left + offsets.offsetX,
            y: elementRect.top + offsets.offsetY,
        };

        return { element, offsets, endPoint };
    }

    _mouseup () {
        return cursor
            .buttonUp()
            .then(() => {
                const point    = positionUtils.offsetToClientCoords(this.endPoint);
                let topElement = null;
                const options  = extend({
                    clientX: point.x,
                    clientY: point.y,
                }, this.modifiers);

                return getElementFromPoint(point)
                    .then(element => {
                        topElement = element;

                        if (!topElement)
                            return topElement;

                        if (this.dragAndDropState.enabled) {
                            options.dataTransfer = this.dragAndDropState.dataTransfer;

                            if (this.dragAndDropState.dropAllowed)
                                eventSimulator.drop(topElement, options);

                            eventSimulator.dragend(this.dragAndDropState.element, options);
                            this.dragAndDropState.dataStore.setProtectedMode();
                        }
                        else
                            eventSimulator[this.upEvent](topElement, options);

                        return getElementFromPoint(point);
                    });
            });
    }
}
