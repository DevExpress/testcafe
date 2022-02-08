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

export function getTagName (node: ServerNode): string {
    return node.nodeName.toLowerCase();
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

export function isImgElement (node: ServerNode): boolean {
    return hasTagName(node, 'img');
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

export function isDomElement (node: ServerNode): boolean {
    return node.nodeType === 1;
}

export function isNodeEqual (el1: ServerNode, el2: ServerNode): boolean {
    return el1.backendNodeId === el2.backendNodeId;
}

export async function getDocumentElement (win: ExecutionContext): Promise<ServerNode> {
    const { Runtime, DOM } = clientsManager.getClient();

    const { exceptionDetails, result: resultObj } = await Runtime.evaluate({
        expression: 'document.documentElement',
        contextId:  win.ctxId,
    });

    if (exceptionDetails)
        throw exceptionDetails;

    return describeNode(DOM, resultObj.objectId as string);
}

export async function isDocumentElement (el: ServerNode): Promise<boolean> {
    const docEl = await getDocumentElement(ExecutionContext.current);

    return isNodeEqual(el, docEl);
}

export async function isIframeWindow (): Promise<boolean> {
    return false;
}

export async function closest (el: ServerNode, selector: string): Promise<ServerNode | null> {
    const { Runtime, DOM } = clientsManager.getClient();

    const { exceptionDetails, result: resultObj } = await Runtime.callFunctionOn({
        arguments:           [{ objectId: el.objectId }, { value: selector }],
        functionDeclaration: `function (el, selector) {
            debugger;
            return window["%proxyless%"].nativeMethods.closest.call(el, selector);
        }`,
        executionContextId: ExecutionContext.getCurrentContextId(),
    });

    if (exceptionDetails)
        throw exceptionDetails;

    return resultObj.value ? describeNode(DOM, resultObj.value.objectId) : null;
}

export async function getNodeText (el: ServerNode): Promise<string> {
    const { Runtime } = clientsManager.getClient();

    const { exceptionDetails, result: resultObj } = await Runtime.callFunctionOn({
        arguments:           [{ objectId: el.objectId }],
        functionDeclaration: `function (el) {
            return window["%proxyless%"].nativeMethods.nodeTextContentGetter.call(el);
        }`,
        executionContextId: ExecutionContext.getCurrentContextId(),
    });

    if (exceptionDetails)
        throw exceptionDetails;

    return resultObj.value;
}

export async function containsElement (el1: ServerNode, el2: ServerNode): Promise<boolean> {
    const { Runtime } = clientsManager.getClient();

    const { exceptionDetails, result: resultObj } = await Runtime.callFunctionOn({
        arguments:           [{ objectId: el1.objectId }, { objectId: el2.objectId }],
        functionDeclaration: `function (el1, el2) {
            do {
                if (el2.parentNode === el1)
                    return true;
            }
            while(el2 = el2.parentNode);
            return false;
        }`,
        executionContextId: ExecutionContext.getCurrentContextId(),
    });

    if (exceptionDetails)
        throw exceptionDetails;

    return resultObj.value;
}

export function getImgMapName (el: ServerNode): string {
    if (!el.attributes)
        return '';

    const useMapIndex = el.attributes.indexOf('usemap');

    if (useMapIndex === -1)
        return '';

    return el.attributes[useMapIndex + 1].substring(1);
}

export async function getParentNode ({ objectId }: ServerNode): Promise<ServerNode | null> {
    const { Runtime, DOM } = clientsManager.getClient();

    const parent = await Runtime.callFunctionOn({
        functionDeclaration: `function () {
            const el = this.assignedSlot || this;

            return this.parentNode || el.host;
        }`,
        objectId,
    });

    if (parent.result.value !== null && parent.result.objectId)
        return describeNode(DOM, parent.result.objectId || '');

    return null;
}

export async function getParents (el: ServerNode): Promise<ServerNode[]> {
    // TODO: check this method
    const result = [];

    let parent = await getParentNode(el);

    while (parent) {
        result.push(parent);

        parent = await getParentNode(parent);
    }

    return result;
}
