import { positionUtils } from '../deps/testcafe-core';

export default function getAutomationPoint (element, offsetX, offsetY, roundFn) {
    const elementOffset = positionUtils.getOffsetPosition(element, roundFn);
    const left          = element === document.documentElement ? 0 : elementOffset.left;
    const top           = element === document.documentElement ? 0 : elementOffset.top;

    return {
        x: left + offsetX,
        y: top + offsetY
    };
}
