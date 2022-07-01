import AxisValues, { AxisValuesData, LeftTopValues } from '../../../../../../../shared/utils/values/axis-values';
import BoundaryValues, { BoundaryValuesData } from '../../../../../../../shared/utils/values/boundary-values';
import { findIframeByWindow, getIframeByElement } from './dom-utils';
import { PositionDimensions, ServerNode } from '../types';

import {
    getBoxModel,
    getDocumentScroll,
    getElementPadding,
    getElementDimensions,
    getProperties,
} from './style-utils';

import { ElementRectangle } from '../../../../../../../client/core/utils/shared/types';


export async function getClientPosition (node: ServerNode): Promise<AxisValues<number>> {
    const boxModel = await getBoxModel(node);

    return new AxisValues<number>(boxModel.border[0], boxModel.border[1]);
}

export async function getOffsetPosition (node: ServerNode): Promise<LeftTopValues<number>> {
    const dimensions    = await getClientDimensions(node);
    const { left, top } = await getDocumentScroll(node);

    return { left: dimensions.left + left, top: dimensions.top + top };
}

export async function containsOffset (node: ServerNode, offsetX?: number, offsetY?: number): Promise<boolean> {
    const dimensions = await getClientDimensions(node);
    const properties = await getProperties(node, 'scrollWidth', 'scrollHeight');

    const width  = Math.max(Number(properties.scrollWidth), dimensions.width);
    const height = Math.max(Number(properties.scrollHeight), dimensions.height);
    const maxX   = dimensions.scrollbar.right + dimensions.border.left + dimensions.border.right + width;
    const maxY   = dimensions.scrollbar.bottom + dimensions.border.top + dimensions.border.bottom + height;

    return (typeof offsetX === 'undefined' || offsetX >= 0 && maxX >= offsetX) &&
        (typeof offsetY === 'undefined' || offsetY >= 0 && maxY >= offsetY);
}

export async function getIframeClientCoordinates (node: ServerNode): Promise<BoundaryValuesData> {
    const dimensions = await getClientDimensions(node);

    const [ left, top, right, bottom ] = [
        dimensions.left + dimensions.border.left + dimensions.paddings.left,
        dimensions.top + dimensions.border.top + dimensions.paddings.left,
        dimensions.right - dimensions.border.right - dimensions.paddings.right,
        dimensions.bottom - dimensions.border.bottom - dimensions.paddings.bottom,
    ];

    return new BoundaryValues(top, right, bottom, left);
}

export async function getIframePointRelativeToParentFrame (iframePoint: AxisValues<number>, context: any): Promise<AxisValues<number> | null> {
    const iframe = await findIframeByWindow(context);

    if (!iframe)
        return null;

    const dimensions = await getClientDimensions(iframe);
    const paddings   = await getElementPadding(iframe);

    const left = dimensions.left + dimensions.border.left + paddings.left + iframePoint.x;
    const top  = dimensions.top + dimensions.border.top + paddings.top + iframePoint.y;

    return new AxisValues<number>(left, top);
}

export async function getElementFromPoint (point: AxisValuesData<number>): Promise<ServerNode | null> { // eslint-disable-line
    return null;
}

export async function getElementRectangle (node: ServerNode): Promise<ElementRectangle> {
    const dimensions = await getElementDimensions(node);

    return {
        height: dimensions.height,
        left:   dimensions.left,
        top:    dimensions.top,
        width:  dimensions.width,
    };
}

export async function getClientDimensions (node: ServerNode): Promise<PositionDimensions> {
    const elementDimensions = await getElementDimensions(node);
    const parentFrame       = await getIframeByElement(node);

    if (parentFrame) {
        const frameBoxModel = await getBoxModel(parentFrame);

        elementDimensions.left   -= frameBoxModel.content[0];
        elementDimensions.top    -= frameBoxModel.content[1];
        elementDimensions.bottom -= frameBoxModel.content[1];
        elementDimensions.right  -= frameBoxModel.content[0];
    }

    return elementDimensions;
}

export async function getWindowPosition (): Promise<AxisValues<number>> {
    return {} as AxisValues<number>;
}

// TODO: implement
export async function offsetToClientCoords (point: AxisValues<number>): Promise<AxisValues<number>> {
    return point;
}
