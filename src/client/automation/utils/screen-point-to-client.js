import { positionUtils, styleUtils } from '../deps/testcafe-core';

export default function convertToClient (element, point) {
    var elementScroll = styleUtils.getElementScroll(element);

    if (!/html/i.test(element.tagName) && styleUtils.hasScroll(element)) {
        point.x -= elementScroll.left;
        point.y -= elementScroll.top;
    }

    return positionUtils.offsetToClientCoords(point);
}
