import { getLineXByYCoord, getLineYByXCoord } from '../../../core/utils/get-line-by';
import { BoundaryValuesData } from '../../../core/utils/values/boundary-values';
import AxisValues, { AxisValuesData } from '../../../core/utils/values/axis-values';


function findIntersectionHorizontal (startLinePoint: AxisValuesData<number>, endLinePoint: AxisValuesData<number>, rectSide: BoundaryValuesData): AxisValues<number> | null {
    const intersectionX            = getLineXByYCoord(startLinePoint, endLinePoint, rectSide.top);
    const haveIntersectionInBounds = intersectionX && intersectionX >= rectSide.left && intersectionX <= rectSide.right;

    return haveIntersectionInBounds ? new AxisValues(intersectionX, rectSide.top) : null;
}

function findIntersectionVertical (startLinePoint: AxisValuesData<number>, endLinePoint: AxisValuesData<number>, rectSide: BoundaryValuesData): AxisValues<number> | null {
    const intersectionY            = getLineYByXCoord(startLinePoint, endLinePoint, rectSide.left);
    const haveIntersectionInBounds = intersectionY && intersectionY >= rectSide.top && intersectionY <= rectSide.bottom;

    return haveIntersectionInBounds ? new AxisValues(rectSide.left, intersectionY) : null;
}

export default function (startLine: AxisValues<number>, endLine: AxisValues<number>, rect: BoundaryValuesData): AxisValues<number> | null {
    const res       = [];
    const rectLines = [
        { left: rect.left, top: rect.top, right: rect.left, bottom: rect.bottom, isHorizontal: false }, // left-side
        { left: rect.right, top: rect.top, right: rect.right, bottom: rect.bottom, isHorizontal: false }, // right-side
        { left: rect.left, top: rect.top, right: rect.right, bottom: rect.top, isHorizontal: true }, // top-side
        { left: rect.left, top: rect.bottom, right: rect.right, bottom: rect.bottom, isHorizontal: true }, // bottom-side
    ];

    for (const rectLine of rectLines) {
        const intersection = rectLine.isHorizontal
            ? findIntersectionHorizontal(startLine, endLine, rectLine)
            : findIntersectionVertical(startLine, endLine, rectLine);

        if (intersection)
            res.push(intersection);
    }

    if (!res.length)
        return null;

    if (res.length === 1)
        return res[0];

    // NOTE: if a line and rect have two intersection points, we return the nearest to startLinePoint
    return res[0].distance(startLine) < res[1].distance(startLine) ? res[0] : res[1];
}
