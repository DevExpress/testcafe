import Protocol from 'devtools-protocol/types/protocol';
import ExecutionContext from '../execution-context';
import { describeNode } from './index';
import * as clientsManager from '../clients-manager';
import { ServerNode } from '../types';

export async function getIframeByElement ({ objectId }: ServerNode): Promise<ServerNode | null> {
    const { Runtime, DOM } = clientsManager.getClient();

    const frame = await Runtime.callFunctionOn({
        functionDeclaration: `function () {
            return this.ownerDocument.defaultView.frameElement
        }`,
        objectId,
    });

    if (frame.result.value !== null)
        return describeNode(DOM, frame.result.objectId || '');

    return null;
}

export async function getIFrameByIndex (objectId: string | undefined, index: number): Promise<ServerNode | null> {
    const { Runtime, DOM } = clientsManager.getClient();

    const frame = await Runtime.callFunctionOn({
        functionDeclaration: `function (index) {
                return this[index];
            }`,
        objectId:  objectId,
        arguments: [{ value: index }],
    });

    const frameObjectId = frame.result.objectId;

    if (frameObjectId)
        return describeNode(DOM, frameObjectId);

    return null;
}

export async function findIframeByWindow (context: ExecutionContext): Promise<ServerNode | null> {
    const { Runtime } = clientsManager.getClient();

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
    let frame    = await getIFrameByIndex(frames.result.objectId, index);

    while (frame) {
        if (context.frameId === frame.frameId)
            return frame;

        index++;

        frame = await getIFrameByIndex(frames.result.objectId, index);
    }

    return null;
}

function hasTagName (node: ServerNode, tagName: string): boolean {
    return node.nodeName.toLowerCase() === tagName.toLowerCase();
}

export function isHtmlElement (node: ServerNode): boolean {
    return hasTagName(node, 'html');
}

export function isBodyElement (node: ServerNode): boolean {
    return hasTagName(node, 'body');
}

export async function getScrollingElement (node?: ServerNode): Promise<ServerNode> {
    const client = clientsManager.getClient();

    const args: Protocol.Runtime.CallFunctionOnRequest = {
        functionDeclaration: `function () {
            const doc = this !== window ? this.ownerDocument : document;
            
            return doc.scrollingElement;
        }`,
    };

    if (node)
        args.objectId = node.objectId;
    else
        args.executionContextId = ExecutionContext.top.ctxId;

    const { result } = await client.Runtime.callFunctionOn(args);

    return describeNode(client.DOM, result.objectId || '');
}
