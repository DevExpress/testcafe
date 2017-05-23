import { positionUtils } from '../deps/testcafe-core';
import { getMoveAutomationOffsets } from './offsets';

export default function getMoveArguments (el, offsets, speed) {
    var relateToDocument  = !positionUtils.containsOffset(el, offsets.x, offsets.y);
    var moveActionOffsets = getMoveAutomationOffsets(el, offsets.x, offsets.y);

    return {
        element: relateToDocument ? document.documentElement : el,
        offsetX: moveActionOffsets.offsetX,
        offsetY: moveActionOffsets.offsetY,
        speed:   speed
    };
}
