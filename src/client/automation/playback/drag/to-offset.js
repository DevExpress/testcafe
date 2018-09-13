import testCafeCore from '../../deps/testcafe-core';
import DragAutomationBase from './base';
import getAutomationPoint from '../../utils/get-automation-point';

const styleUtils = testCafeCore.styleUtils;


export default class DragToOffsetAutomation extends DragAutomationBase {
    constructor (element, offsetX, offsetY, mouseOptions) {
        super(element, mouseOptions);

        this.dragOffsetX = offsetX;
        this.dragOffsetY = offsetY;
    }

    _getDestination () {
        const startPoint = getAutomationPoint(this.element, this.offsetX, this.offsetY);
        const maxX       = styleUtils.getWidth(document);
        const maxY       = styleUtils.getHeight(document);

        let endPoint = {
            x: startPoint.x + this.dragOffsetX,
            y: startPoint.y + this.dragOffsetY
        };

        endPoint = {
            x: Math.min(Math.max(0, endPoint.x), maxX),
            y: Math.min(Math.max(0, endPoint.y), maxY)
        };

        const element = document.documentElement;

        const offsets = {
            offsetX: endPoint.x,
            offsetY: endPoint.y
        };

        return { element, offsets, endPoint };
    }
}
