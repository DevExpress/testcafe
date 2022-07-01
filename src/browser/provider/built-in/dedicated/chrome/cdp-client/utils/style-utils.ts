import { LeftTopValues } from '../../../../../../../shared/utils/values/axis-values';
import BoundaryValues, { BoundaryValuesData } from '../../../../../../../shared/utils/values/boundary-values';
import { Dictionary } from '../../../../../../../configuration/interfaces';
import Protocol from 'devtools-protocol/types/protocol';
import { getScrollingElement } from './dom-utils';
import { ServerNode, PositionDimensions } from '../types';

async function getPadding (node: ServerNode): Promise<BoundaryValuesData> {
    return new BoundaryValues(0, 0, 0, 0);
}

export async function getStyleProperties (nodeId: number, ...names: string[]): Promise<Dictionary<string>> {
    const properties: Dictionary<string> = { };

    return properties;
}

export async function getProperties (node: ServerNode, ...names: string[]): Promise<Dictionary<string>> {
    const properties: Dictionary<string> = { };

    return properties;
}

export async function getScroll (node: ServerNode): Promise<LeftTopValues<number>> {
    const { scrollLeft, scrollTop } = await getProperties(node, 'scrollLeft', 'scrollTop');

    return { left: Number(scrollLeft), top: Number(scrollTop) };
}

export async function getBoxModel (node: ServerNode): Promise<Protocol.DOM.BoxModel> {
    return {} as Protocol.DOM.BoxModel;
}

export async function getElementDimensions (node: ServerNode): Promise<PositionDimensions> {
    return {} as PositionDimensions;
}

export async function getBordersWidth (node: ServerNode): Promise<BoundaryValuesData> {
    const dimensions = await getElementDimensions(node);

    return dimensions.border;
}

export async function getElementPadding (node: ServerNode): Promise<BoundaryValuesData> {
    return getPadding(node);
}

export async function getElementScroll (node: ServerNode): Promise<LeftTopValues<number>> {
    return getScroll(node);
}

export async function hasScroll (node: ServerNode): Promise<boolean> {
    const scroll = await getElementScroll(node);

    return scroll.left > 0 || scroll.top > 0;
}

export async function getWindowDimensions (executionContext?: any): Promise<BoundaryValues> {
    return new BoundaryValues(0, 0, 0, 0);
}

export async function getDocumentScroll (node: ServerNode): Promise<LeftTopValues<number>> {
    const document = await getScrollingElement(node);

    return getElementScroll(document);
}
