import testCafeCore from '../deps/testcafe-core';

var positionUtils = testCafeCore.positionUtils;
var styleUtils    = testCafeCore.styleUtils;


export function getDefaultAutomationOffsets (element) {
    var elementCenter = positionUtils.getElementCenter(element);

    return {
        offsetX: elementCenter.x,
        offsetY: elementCenter.y
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

export function getAutomationPoint (element, offsetX, offsetY) {
    var elementOffset = positionUtils.getOffsetPosition(element);
    var left          = element === document.documentElement ? 0 : elementOffset.left;
    var top           = element === document.documentElement ? 0 : elementOffset.top;

    return {
        x: left + offsetX,
        y: top + offsetY
    };
}

export function convertToClient (element, point) {
    var elementScroll = styleUtils.getElementScroll(element);

    if (!/html/i.test(element.tagName) && styleUtils.hasScroll(element)) {
        point.x -= elementScroll.left;
        point.y -= elementScroll.top;
    }

    return positionUtils.offsetToClientCoords(point);
}

export function getOffsetOptions (element, offsetX, offsetY) {
    var defaultOffsets = getDefaultAutomationOffsets(element);

    return {
        offsetX: typeof offsetX === 'number' ? Math.round(offsetX) : defaultOffsets.offsetX,
        offsetY: typeof offsetY === 'number' ? Math.round(offsetY) : defaultOffsets.offsetY
    };
}
