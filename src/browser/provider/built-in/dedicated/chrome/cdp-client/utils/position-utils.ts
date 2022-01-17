import Protocol from 'devtools-protocol/types/protocol';
import ExecutionContext from '../execution-context';
import AxisValues, { AxisValuesData, LeftTopValues } from '../../../../../../../shared/utils/values/axis-values';
import BoundaryValues, { BoundaryValuesData } from '../../../../../../../shared/utils/values/boundary-values';
import { findIframeByWindow } from './dom-utils';
import * as clientsManager from '../clients-manager';
import { ServerNode } from '../types';

import {
    getBoxModel,
    getClientDimensions,
    getDocumentScroll,
    getElementPadding,
    getProperties,
} from './style-utils';

export async function getClientPosition (node: ServerNode): Promise<AxisValues<number>> {
    const boxModel = await getBoxModel(node);

    return new AxisValues<number>(boxModel.border[0], boxModel.border[1]);
}

export async function getOffsetPosition (node: ServerNode): Promise<LeftTopValues<number>> {
    const dimensions    = await getClientDimensions(node);
    const { left, top } = await getDocumentScroll(node);

    return { left: dimensions.left + left, top: dimensions.top + top };
}

export async function containsOffset (node: ServerNode, offsetX: number, offsetY: number): Promise<boolean> {
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

export async function getIframePointRelativeToParentFrame (iframePoint: AxisValues<number>, context: ExecutionContext): Promise<AxisValues<number> | null> {
    const iframe = await findIframeByWindow(context);

    if (!iframe)
        return null;

    const dimensions = await getClientDimensions(iframe);
    const paddings   = await getElementPadding(iframe);

    const left = dimensions.left + dimensions.border.left + paddings.left + iframePoint.x;
    const top  = dimensions.top + dimensions.border.top + paddings.top + iframePoint.y;

    return new AxisValues<number>(left, top);
}

export async function getElementFromPoint (point: AxisValuesData<number>): Promise<Protocol.DOM.ResolveNodeResponse | null> {
    const { DOM } = clientsManager.getClient();

    try {
        const { backendNodeId } = await DOM.getNodeForLocation({ x: point.x, y: point.y });

        return DOM.resolveNode({ backendNodeId });
    }
    catch {
        //
    }

    return null;
}

export async function getWindowPosition (): Promise<AxisValues<number>> {
    const { Runtime } = clientsManager.getClient();

    const args: Protocol.Runtime.EvaluateRequest = {
        expression: `({
            x: window.screenLeft || window.screenX,
            y: window.screenTop || window.screenY
        })`,
        returnByValue: true,
    };

    const { result } = await Runtime.evaluate(args);

    return result.value;
}
