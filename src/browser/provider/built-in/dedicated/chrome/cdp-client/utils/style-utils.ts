import { ProtocolApi } from 'chrome-remote-interface';
import { ClientObject, PositionDimensions } from '../interfaces';
import { LeftTopValues } from '../../../../../../../shared/utils/values/axis-values';
import BoundaryValues, { BoundaryValuesData } from '../../../../../../../shared/utils/values/boundary-values';
import { Dictionary } from '../../../../../../../configuration/interfaces';
import Protocol from 'devtools-protocol/types/protocol';
import { getObjectId } from './index';
import { getScrollingElement, getIframeByElement } from './dom-utils';
import ExecutionContext from '../execution-context';

async function getPadding (client: ProtocolApi, objectId: string): Promise<BoundaryValuesData> {
    const { nodeId } = await client.DOM.requestNode({ objectId });
    const style      = await getStyleProperties(client, nodeId, 'padding-right', 'padding-bottom', 'padding-left', 'padding-top');

    const right  = parseInt(style['padding-right'], 10);
    const bottom = parseInt(style['padding-bottom'], 10);
    const left   = parseInt(style['padding-left'], 10);
    const top    = parseInt(style['padding-top'], 10);

    return new BoundaryValues(top, right, bottom, left);
}

export async function getStyleProperties ({ CSS }: ProtocolApi, nodeId: number, ...names: string[]): Promise<Dictionary<string>> {
    const properties: Dictionary<string> = { };
    const style                          = await CSS.getComputedStyleForNode({ nodeId });

    style.computedStyle.filter(property => names.includes(property.name))
        .forEach(property => {
            properties[property.name] = property.value;
        });

    return properties;
}

export async function getProperties ({ Runtime }: ProtocolApi, objectId: string, ...names: string[]): Promise<Dictionary<string>> {
    const properties: Dictionary<string> = { };
    const { result }                     = await Runtime.getProperties({ objectId });

    result.filter(property => names.includes(property.name))
        .forEach(property => {
            properties[property.name] = property.value?.value;
        });

    return properties;
}

export async function getScroll (client: ProtocolApi, objectId: string): Promise<LeftTopValues<number>> {
    const { scrollLeft, scrollTop } = await getProperties(client, objectId, 'scrollLeft', 'scrollTop');

    return { left: Number(scrollLeft), top: Number(scrollTop) };
}

export async function getBoxModel ({ DOM }: ProtocolApi, objectId: string): Promise<Protocol.DOM.BoxModel> {
    const boxModel = await DOM.getBoxModel({ objectId });

    return boxModel.model;
}

async function getElementDimensions (client: ProtocolApi, objectId: string): Promise<PositionDimensions> {
    // NOTE: for some reason this method call is required for CSS.getComputedStyleForNode
    // TODO: remove this line after the problem is clear
    await client.DOM.getDocument({ });

    const boxModel = await getBoxModel(client, objectId);
    const scroll   = await getScroll(client, objectId);
    const paddings = await getPadding(client, objectId);

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

export async function getClientDimensions (client: ProtocolApi, element: ClientObject): Promise<PositionDimensions> {
    const objectId            = await getObjectId(client, element);
    const elementDimensions   = await getElementDimensions(client, objectId);
    const parentFrame         = await getIframeByElement(client, objectId);
    const parentFrameObjectId = parentFrame.result?.objectId?.toString();

    if (parentFrameObjectId) {
        const frameBoxModel = await getBoxModel(client, parentFrameObjectId);

        elementDimensions.left   -= frameBoxModel.content[0];
        elementDimensions.top    -= frameBoxModel.content[1];
        elementDimensions.bottom -= frameBoxModel.content[1];
        elementDimensions.right  -= frameBoxModel.content[0];
    }

    return elementDimensions;
}

export async function getBordersWidth (client: ProtocolApi, element: ClientObject): Promise<BoundaryValuesData> {
    const objectId   = await getObjectId(client, element);
    const dimensions = await getElementDimensions(client, objectId);

    return dimensions.border;
}

export async function getElementPadding (client: ProtocolApi, element: ClientObject): Promise<BoundaryValuesData> {
    const objectId = await getObjectId(client, element);

    return getPadding(client, objectId);
}

export async function getElementScroll (client: ProtocolApi, element: ClientObject): Promise<LeftTopValues<number>> {
    const objectId = await getObjectId(client, element);

    return getScroll(client, objectId);
}

export async function getWindowDimensions ({ Runtime }: ProtocolApi, executionContext?: ExecutionContext): Promise<BoundaryValues> {
    const args: Protocol.Runtime.EvaluateRequest = {
        expression: `({
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight
        })`,
        returnByValue: true,
    };

    if (executionContext)
        args.contextId = executionContext.ctxId;

    const { result }        = await Runtime.evaluate(args);
    const { width, height } = result.value;

    return new BoundaryValues(0, width, height, 0);
}

export async function getDocumentScroll (client: ProtocolApi, element?: ClientObject): Promise<LeftTopValues<number>> {
    const document = await getScrollingElement(client, element);

    return getElementScroll(client, document);
}
