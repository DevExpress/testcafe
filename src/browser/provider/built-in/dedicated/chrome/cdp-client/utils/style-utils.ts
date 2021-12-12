import { LeftTopValues } from '../../../../../../../shared/utils/values/axis-values';
import BoundaryValues, { BoundaryValuesData } from '../../../../../../../shared/utils/values/boundary-values';
import { Dictionary } from '../../../../../../../configuration/interfaces';
import Protocol from 'devtools-protocol/types/protocol';
import { getScrollingElement, getIframeByElement } from './dom-utils';
import ExecutionContext from '../execution-context';
import { ServerNode, PositionDimensions } from '../types';
import { getClient } from '../clients-manager';


async function getPadding (node: ServerNode): Promise<BoundaryValuesData> {
    const client     = getClient();
    const { nodeId } = await client.DOM.requestNode(node);
    const style      = await getStyleProperties(nodeId, 'padding-right', 'padding-bottom', 'padding-left', 'padding-top');

    const right  = parseInt(style['padding-right'], 10);
    const bottom = parseInt(style['padding-bottom'], 10);
    const left   = parseInt(style['padding-left'], 10);
    const top    = parseInt(style['padding-top'], 10);

    return new BoundaryValues(top, right, bottom, left);
}

export async function getStyleProperties (nodeId: number, ...names: string[]): Promise<Dictionary<string>> {
    const { CSS } = getClient();

    const properties: Dictionary<string> = { };
    const style                          = await CSS.getComputedStyleForNode({ nodeId });

    style.computedStyle.filter(property => names.includes(property.name))
        .forEach(property => {
            properties[property.name] = property.value;
        });

    return properties;
}

export async function getProperties (node: ServerNode, ...names: string[]): Promise<Dictionary<string>> {
    const { Runtime } = getClient();

    const properties: Dictionary<string> = { };
    const { result }                     = await Runtime.getProperties(node);

    result.filter(property => names.includes(property.name))
        .forEach(property => {
            properties[property.name] = property.value?.value;
        });

    return properties;
}

export async function getScroll (node: ServerNode): Promise<LeftTopValues<number>> {
    const { scrollLeft, scrollTop } = await getProperties(node, 'scrollLeft', 'scrollTop');

    return { left: Number(scrollLeft), top: Number(scrollTop) };
}

export async function getBoxModel (node: ServerNode): Promise<Protocol.DOM.BoxModel> {
    const { DOM }  = getClient();
    const boxModel = await DOM.getBoxModel({ objectId: node.objectId });

    return boxModel.model;
}

export async function getElementDimensions (node: ServerNode): Promise<PositionDimensions> {
    // NOTE: for some reason this method call is required for CSS.getComputedStyleForNode
    // TODO: remove this line after the problem is clear
    await getClient().DOM.getDocument({ });

    const boxModel = await getBoxModel(node);
    const scroll   = await getScroll(node);
    const paddings = await getPadding(node);

    const { width, height, border, padding, content } = boxModel;

    const left   = Math.round(border[0]);
    const top    = border[1];
    const bottom = top + height;
    const right  = left + width;

    const borders = {
        top:    padding[1] - border[1],
        right:  border[4] - padding[4],
        bottom: border[5] - padding[5],
        left:   padding[0] - border[0],
    };

    const scrollbar = {
        right:  Math.round(padding[2] - content[2] - paddings.right),
        bottom: Math.round(padding[7] - content[7] - paddings.bottom),
    };

    return {
        border: borders,
        bottom,
        height,
        left,
        right,
        scroll: {
            left: Math.round(Number(scroll.left)),
            top:  Math.round(Number(scroll.top)),
        },
        scrollbar,
        paddings,
        top,
        width,
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

export async function getWindowDimensions (executionContext?: ExecutionContext): Promise<BoundaryValues> {
    const { Runtime } = getClient();

    const args: Protocol.Runtime.EvaluateRequest = {
        expression: `({
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight
        })`,
        returnByValue: true,
    };

    if (executionContext)
        args.contextId = executionContext.ctxId;

    const { result }        = await getClient().Runtime.evaluate(args);
    const { width, height } = result.value;

    return new BoundaryValues(0, width, height, 0);
}

export async function getDocumentScroll (node: ServerNode): Promise<LeftTopValues<number>> {
    const document = await getScrollingElement(node);

    return getElementScroll(document);
}
