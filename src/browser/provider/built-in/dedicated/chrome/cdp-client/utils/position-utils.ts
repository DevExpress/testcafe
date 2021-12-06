import { ProtocolApi } from 'chrome-remote-interface';
import Protocol from 'devtools-protocol/types/protocol';
import ExecutionContext from '../execution-context';
import AxisValues, { LeftTopValues } from '../../../../../../../shared/utils/values/axis-values';
import BoundaryValues, { BoundaryValuesData } from '../../../../../../../shared/utils/values/boundary-values';
import { getIFrameElementByExecutionContext } from './dom-utils';
import { getObjectId } from './index';

import {
    getBoxModel,
    getClientDimensions, getDocumentScroll,
    getElementPadding,
    getProperties,
} from './style-utils';

import { ClientObject } from '../interfaces';

export async function getClientPosition (client: ProtocolApi, selector: string): Promise<AxisValues<number>> {
    const objectId = await getObjectId(client, selector);
    const boxModel = await getBoxModel(client, objectId);

    return new AxisValues<number>(boxModel.border[0], boxModel.border[1]);
}

export async function getOffsetPosition (client: ProtocolApi, element: ClientObject): Promise<LeftTopValues<number>> {
    const dimensions    = await getClientDimensions(client, element);
    const { left, top } = await getDocumentScroll(client, element);

    return { left: dimensions.left + left, top: dimensions.top + top };
}

export async function containsOffset (client: ProtocolApi, selector: string, offsetX: number, offsetY: number): Promise<boolean> {
    const dimensions = await getClientDimensions(client, selector);
    const objectId   = await getObjectId(client, selector);
    const properties = await getProperties(client, objectId, 'scrollWidth', 'scrollHeight');

    const width  = Math.max(Number(properties.scrollWidth), dimensions.width);
    const height = Math.max(Number(properties.scrollHeight), dimensions.height);
    const maxX   = dimensions.scrollbar.right + dimensions.border.left + dimensions.border.right + width;
    const maxY   = dimensions.scrollbar.bottom + dimensions.border.top + dimensions.border.bottom + height;

    return (typeof offsetX === 'undefined' || offsetX >= 0 && maxX >= offsetX) &&
        (typeof offsetY === 'undefined' || offsetY >= 0 && maxY >= offsetY);
}

export async function getIframeClientCoordinates (client: ProtocolApi, selector: string): Promise<BoundaryValuesData> {
    const dimensions = await getClientDimensions(client, selector);

    const [ left, top, right, bottom ] = [
        dimensions.left + dimensions.border.left + dimensions.paddings.left,
        dimensions.top + dimensions.border.top + dimensions.paddings.left,
        dimensions.right - dimensions.border.right - dimensions.paddings.right,
        dimensions.bottom - dimensions.border.bottom - dimensions.paddings.bottom,
    ];

    return new BoundaryValues(top, right, bottom, left);
}

export async function getIframePointRelativeToParentFrame (client: ProtocolApi, iframePoint: AxisValues<number>, context: ExecutionContext): Promise<AxisValues<number> | null> {
    const iframe = await getIFrameElementByExecutionContext(client, context);

    if (!iframe)
        return null;

    const dimensions = await getClientDimensions(client, iframe);
    const paddings   = await getElementPadding(client, iframe);

    const left = dimensions.left + dimensions.border.left + paddings.left + iframePoint.x;
    const top  = dimensions.top + dimensions.border.top + paddings.top + iframePoint.y;

    return new AxisValues<number>(left, top);
}

export async function getElementFromPoint ({ DOM }: ProtocolApi, x: number, y: number): Promise<Protocol.DOM.ResolveNodeResponse> {
    const { backendNodeId } = await DOM.getNodeForLocation({ x, y });

    return DOM.resolveNode({ backendNodeId });
}
