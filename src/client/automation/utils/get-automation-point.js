import { positionUtils } from '../deps/testcafe-core';
import hammerhead from '../deps/hammerhead';

const browserUtils = hammerhead.utils.browser;

export default function getAutomationPoint (element, offsetX, offsetY) {
    const roundFn       = browserUtils.isFirefox ? Math.ceil : Math.round;
    const elementOffset = positionUtils.getOffsetPosition(element, roundFn);
    const left          = element === document.documentElement ? 0 : elementOffset.left;
    const top           = element === document.documentElement ? 0 : elementOffset.top;

    return {
        x: left + offsetX,
        y: top + offsetY
    };
}
