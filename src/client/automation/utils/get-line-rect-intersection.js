import { positionUtils } from '../deps/testcafe-core';


function getPointsDistance (start, end) {
    return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
}

function findLineAndRectSideIntersection (startLinePoint, endLinePoint, rectSide) {
    var intersectionX            = null;
    var haveIntersectionInBounds = null;

    if (rectSide.isHorizontal) {
        intersectionX            = positionUtils.getLineXByYCoord(startLinePoint, endLinePoint, rectSide.y1);
        haveIntersectionInBounds = intersectionX && intersectionX >= rectSide.x1 && intersectionX <= rectSide.x2;

        return haveIntersectionInBounds ? { x: intersectionX, y: rectSide.y1 } : null;
    }

    var intersectionY = positionUtils.getLineYByXCoord(startLinePoint, endLinePoint, rectSide.x1);

    haveIntersectionInBounds = intersectionY && intersectionY >= rectSide.y1 && intersectionY <= rectSide.y2;

    return haveIntersectionInBounds ? { x: rectSide.x1, y: intersectionY } : null;
}

export default function (startLinePoint, endLinePoint, rect) {
    var res          = [];
    var intersection = null;

    var rectLines = [
        { x1: rect.left, y1: rect.top, x2: rect.left, y2: rect.bottom, isHorizontal: false }, // left-side
        { x1: rect.right, y1: rect.top, x2: rect.right, y2: rect.bottom, isHorizontal: false }, // right-side
        { x1: rect.left, y1: rect.top, x2: rect.right, y2: rect.top, isHorizontal: true }, // top-side
        { x1: rect.left, y1: rect.bottom, x2: rect.right, y2: rect.bottom, isHorizontal: true } // bottom-side
    ];

    for (var i = 0; i < rectLines.length; i++) {
        intersection = findLineAndRectSideIntersection(startLinePoint, endLinePoint, rectLines[i]);

        if (intersection)
            res.push(intersection);
    }

    if (!res.length)
        return null;

    if (res.length === 1)
        return res[0];

    // NOTE: if a line and rect have two intersection points, we return the nearest to startLinePoint
    return getPointsDistance(startLinePoint, res[0]) < getPointsDistance(startLinePoint, res[1]) ? res[0] : res[1];
}
