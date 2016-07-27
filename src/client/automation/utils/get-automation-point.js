import { positionUtils } from '../deps/testcafe-core';

export default function getAutomationPoint (element, offsetX, offsetY) {
    var elementOffset = positionUtils.getOffsetPosition(element);
    var left          = element === document.documentElement ? 0 : elementOffset.left;
    var top           = element === document.documentElement ? 0 : elementOffset.top;

    return {
        x: left + offsetX,
        y: top + offsetY
    };
}
