import { ProtocolApi } from 'chrome-remote-interface';
import Protocol from 'devtools-protocol/types/protocol';
import ExecutionContext from './execution-context';
import { Dictionary } from '../../../../../../configuration/interfaces';
import Dimensions from '../../../../../../shared/utils/values/dimensions';
import AxisValues, { LeftTopValues } from '../../../../../../shared/utils/values/axis-values';
import BoundaryValues, { BoundaryValuesData } from '../../../../../../shared/utils/values/boundary-values';

interface PositionDimensions extends Dimensions {
    paddings: BoundaryValuesData;
}

type ClientObject = string | { result: Protocol.Runtime.RemoteObject };

async function getIframeByElement ({ Runtime }: ProtocolApi, objectId: string): Promise<Protocol.Runtime.CallFunctionOnResponse> {
    return Runtime.callFunctionOn({
        functionDeclaration: `function () {
            return this.ownerDocument.defaultView.frameElement
        }`,
        objectId,
    });
}

async function getIFrameByIndex ({ Runtime }: ProtocolApi, objectId: string | undefined, index: number): Promise<Protocol.Runtime.CallFunctionOnResponse | null> {
    const frame = await Runtime.callFunctionOn({
        functionDeclaration: `function (index) {
                return this[index];
            }`,
        objectId:  objectId,
        arguments: [{ value: index }],
    });

    if (!frame.result.objectId)
        return null;

    return frame;
}

async function getIFrameElementByExecutionContext (client: ProtocolApi, context: ExecutionContext): Promise<Protocol.Runtime.CallFunctionOnResponse | null> {
    const { Runtime, DOM } = client;

    const expression = `
        (function findIframes(parentDocument, result = []) {
            if (!parentDocument)
                return [];

            const children = parentDocument.querySelectorAll('iframe');

            for (const child of children) {
                result.push(child, ...findIframes(child.contentDocument));
            }

            return result;
        })(document);
   `;

    const frames = await Runtime.evaluate({ expression });
    let index    = 0;
    let frame    = await getIFrameByIndex(client, frames.result.objectId, index);

    while (frame) {
        const { node } = await DOM.describeNode(frame.result);

        if (context.frameId === node.frameId)
            return frame;

        index++;

        frame = await getIFrameByIndex(client, frames.result.objectId, index);
    }

    return null;
}

async function getPaddings (client: ProtocolApi, nodeId: number): Promise<BoundaryValues> {
    const style = await getStyleProperties(client, nodeId, 'padding-right', 'padding-bottom', 'padding-left', 'padding-top');

    const right  = parseInt(style['padding-right'], 10);
    const bottom = parseInt(style['padding-bottom'], 10);
    const left   = parseInt(style['padding-left'], 10);
    const top    = parseInt(style['padding-top'], 10);

    return new BoundaryValues(top, right, bottom, left);
}

async function getScroll (client: ProtocolApi, objectId: string): Promise<LeftTopValues<string>> {
    const { scrollLeft, scrollTop } = await getProperties(client, objectId, 'scrollLeft', 'scrollTop');

    return { left: scrollLeft, top: scrollTop };
}

async function getElementDimensions (client: ProtocolApi, objectId: string): Promise<PositionDimensions> {
    // NOTE: for some reason this method call is required for CSS.getComputedStyleForNode
    // TODO: remove this line after the problem is clear
    await client.DOM.getDocument({ });

    const { nodeId } = await client.DOM.requestNode({ objectId });
    const boxModel   = await getBoxModel(client, objectId);
    const scroll     = await getScroll(client, objectId);
    const paddings   = await getPaddings(client, nodeId);

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

async function getBoxModel ({ DOM }: ProtocolApi, objectId: string): Promise<Protocol.DOM.BoxModel> {
    const boxModel = await DOM.getBoxModel({ objectId });

    return boxModel.model;
}

async function getProperties ({ Runtime }: ProtocolApi, objectId: string, ...names: string[]): Promise<Dictionary<string>> {
    const properties: Dictionary<string> = { };
    const { result }                     = await Runtime.getProperties({ objectId });

    result.filter(property => names.includes(property.name))
        .forEach(property => {
            properties[property.name] = property.value?.value;
        });

    return properties;
}

async function getStyleProperties ({ CSS }: ProtocolApi, nodeId: number, ...names: string[]): Promise<Dictionary<string>> {
    const properties: Dictionary<string> = { };
    const style                          = await CSS.getComputedStyleForNode({ nodeId });

    style.computedStyle.filter(property => names.includes(property.name))
        .forEach(property => {
            properties[property.name] = property.value;
        });

    return properties;
}

async function getObjectId ({ Runtime }: ProtocolApi, element: ClientObject ): Promise<string> {
    const node = typeof element === 'string' ? await Runtime.evaluate({ expression: `document.querySelector('${element}')` }) : element;

    return node.result?.objectId || '';
}

export async function getClientPosition (client: ProtocolApi, selector: string): Promise<AxisValues<number>> {
    const objectId = await getObjectId(client, selector);
    const boxModel = await getBoxModel(client, objectId);

    return new AxisValues<number>(boxModel.border[0], boxModel.border[1]);
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

export async function getIframeClientCoordinates (client: ProtocolApi, selector: string): Promise<BoundaryValues> {
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

    const objectId   = await getObjectId(client, iframe);
    const dimensions = await getClientDimensions(client, iframe);
    const { nodeId } = await client.DOM.requestNode({ objectId });
    const paddings   = await getPaddings(client, nodeId);

    const left = dimensions.left + dimensions.border.left + paddings.left + iframePoint.x;
    const top  = dimensions.top + dimensions.border.top + paddings.top + iframePoint.y;

    return new AxisValues<number>(left, top);
}
