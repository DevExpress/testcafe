import { AxisValuesData } from './values/axis-values';

export function getLineYByXCoord (startLine: AxisValuesData<number>, endLine: AxisValuesData<number>, x: number): number {
    if (endLine.x === startLine.x)
        return 0;

    const equationSlope      = (endLine.y - startLine.y) / (endLine.x - startLine.x);
    const equationYIntercept = startLine.x * (startLine.y - endLine.y) / (endLine.x - startLine.x) + startLine.y;

    return Math.round(equationSlope * x + equationYIntercept);
}

export function getLineXByYCoord (startLine: AxisValuesData<number>, endLine: AxisValuesData<number>, y: number): number {
    if (endLine.y - startLine.y === 0)
        return 0;

    const equationSlope      = (endLine.x - startLine.x) / (endLine.y - startLine.y);
    const equationXIntercept = startLine.y * (startLine.x - endLine.x) / (endLine.y - startLine.y) + startLine.x;

    return Math.round(equationSlope * y + equationXIntercept);
}
