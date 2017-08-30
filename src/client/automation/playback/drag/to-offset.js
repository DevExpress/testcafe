import testCafeCore from '../../deps/testcafe-core';
import DragAutomationBase from './base';
import getAutomationPoint from '../../utils/get-automation-point';

var styleUtils = testCafeCore.styleUtils;


export default class DragToOffsetAutomation extends DragAutomationBase {
    constructor (element, offsetX, offsetY, mouseOptions) {
        super(element, mouseOptions);

        this.dragOffsetX = offsetX;
        this.dragOffsetY = offsetY;
    }

    _getDestination () {
        var startPoint = getAutomationPoint(this.element, this.offsetX, this.offsetY);
        var maxX       = styleUtils.getWidth(document);
        var maxY       = styleUtils.getHeight(document);

        var endPoint = {
            x: startPoint.x + this.dragOffsetX,
            y: startPoint.y + this.dragOffsetY
        };

        endPoint = {
            x: Math.min(Math.max(0, endPoint.x), maxX),
            y: Math.min(Math.max(0, endPoint.y), maxY)
        };

        var element = document.documentElement;

        var offsets = {
            offsetX: endPoint.x,
            offsetY: endPoint.y
        };

        return { element, offsets, endPoint };
    }
}
