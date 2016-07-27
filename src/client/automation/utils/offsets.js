import { positionUtils } from '../deps/testcafe-core';
import getAutomationPoint from './get-automation-point';

export function getDefaultAutomationOffsets (element) {
    var rect = positionUtils.getElementRectangle(element);

    return {
        offsetX: Math.round(rect.width / 2),
        offsetY: Math.round(rect.height / 2)
    };
}

export function getOffsetOptions (element, offsetX, offsetY) {
    var defaultOffsets = getDefaultAutomationOffsets(element);

    return {
        offsetX: typeof offsetX === 'number' ? Math.round(offsetX) : defaultOffsets.offsetX,
        offsetY: typeof offsetY === 'number' ? Math.round(offsetY) : defaultOffsets.offsetY
    };
}

export function getMoveAutomationOffsets (element, offsetX, offsetY) {
    var clickOnElement = positionUtils.containsOffset(element, offsetX, offsetY);

    if (clickOnElement)
        return { offsetX, offsetY };

    var actionPoint = getAutomationPoint(element, offsetX, offsetY);

    return {
        offsetX: actionPoint.x,
        offsetY: actionPoint.y
    };
}
