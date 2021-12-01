import Protocol from 'devtools-protocol/types/protocol';
import { ProtocolApi } from 'chrome-remote-interface';
import ExecutionContext from '../execution-context';
import { ClientObject } from '../interfaces';
import { getObjectId } from './index';

export async function getIframeByElement ({ Runtime }: ProtocolApi, objectId: string): Promise<Protocol.Runtime.CallFunctionOnResponse> {
    return Runtime.callFunctionOn({
        functionDeclaration: `function () {
            return this.ownerDocument.defaultView.frameElement
        }`,
        objectId,
    });
}

export async function getIFrameByIndex ({ Runtime }: ProtocolApi, objectId: string | undefined, index: number): Promise<Protocol.Runtime.CallFunctionOnResponse | null> {
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

export async function getIFrameElementByExecutionContext (client: ProtocolApi, context: ExecutionContext): Promise<Protocol.Runtime.CallFunctionOnResponse | null> {
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

async function hasTagName (client: ProtocolApi, element: ClientObject, tagName: string): Promise<boolean> {
    const objectId = await getObjectId(client, element);
    const { node } = await client.DOM.describeNode({ objectId });

    return node.nodeName.toLowerCase() === tagName.toLowerCase();
}

export async function isHtmlElement (client: ProtocolApi, element: ClientObject): Promise<boolean> {
    return hasTagName(client, element, 'html');
}

export async function isBodyElement (client: ProtocolApi, element: ClientObject): Promise<boolean> {
    return hasTagName(client, element, 'body');
}

export async function getScrollingElement (client: ProtocolApi, element?: ClientObject): Promise<Protocol.Runtime.CallFunctionOnResponse> {
    const args: Protocol.Runtime.CallFunctionOnRequest = {
        functionDeclaration: `function () {
            const doc = this !== window ? this.ownerDocument : document;
            
            return doc.scrollingElement;
        }`,
    };

    if (element)
        args.objectId = await getObjectId(client, element);
    else
        args.executionContextId = ExecutionContext.top.ctxId;

    return client.Runtime.callFunctionOn(args);
}
