import * as positionUtils from './position';

function calcOffset (size: number): number {
    const offset = size / 2;

    return offset < 1 ? 0 : Math.round(offset);
}

export function getDefaultAutomationOffsets (element: any): { offsetX: number; offsetY: number } {
    const rect    = positionUtils.getElementRectangle(element);
    const offsetX = calcOffset(rect.width);
    const offsetY = calcOffset(rect.height);

    return { offsetX, offsetY };
}

export function getOffsetOptions (element: any, offsetX?: number, offsetY?: number): { offsetX: number; offsetY: number } {
    const defaultOffsets = getDefaultAutomationOffsets(element);

    offsetX = typeof offsetX === 'number' ? Math.round(offsetX) : defaultOffsets.offsetX;
    offsetY = typeof offsetY === 'number' ? Math.round(offsetY) : defaultOffsets.offsetY;

    if (offsetX > 0 && offsetY > 0)
        return { offsetX, offsetY };

    const dimensions = positionUtils.getClientDimensions(element);
    const width      = Math.round(Math.max(element.scrollWidth, dimensions.width));
    const height     = Math.round(Math.max(element.scrollHeight, dimensions.height));
    const maxX       = dimensions.scrollbar.right + dimensions.border.left + dimensions.border.right + width;
    const maxY       = dimensions.scrollbar.bottom + dimensions.border.top + dimensions.border.bottom + height;

    return {
        offsetX: offsetX < 0 ? maxX + offsetX : offsetX,
        offsetY: offsetY < 0 ? maxY + offsetY : offsetY,
    };
}
