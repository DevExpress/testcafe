import { ServerNode } from '../types';

export async function getIframeByElement ({ objectId }: ServerNode): Promise<ServerNode | null> { // eslint-disable-line
    return null;
}

export async function getIFrameByIndex (objectId: string | undefined, index: number): Promise<ServerNode | null> { // eslint-disable-line
    return null;
}

export async function findIframeByWindow (context: any): Promise<ServerNode | null> { // eslint-disable-line
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


export async function getScrollingElement (node?: ServerNode): Promise<ServerNode> { // eslint-disable-line
    return {} as ServerNode;
}

export function isDomElement (node: ServerNode): boolean {
    return node.nodeType === 1;
}

export function isNodeEqual (el1: ServerNode, el2: ServerNode): boolean {
    return el1.backendNodeId === el2.backendNodeId;
}

export async function getDocumentElement (win: any): Promise<ServerNode> { // eslint-disable-line
    return {} as ServerNode;
}

export async function isDocumentElement (el: ServerNode): Promise<boolean> {
    const docEl = await getDocumentElement(null);

    return isNodeEqual(el, docEl);
}

export async function isIframeWindow (): Promise<boolean> {
    return false;
}

export async function closest (el: ServerNode, selector: string): Promise<ServerNode | null> { // eslint-disable-line
    return null;
}

export async function getNodeText (el: ServerNode): Promise<string> { // eslint-disable-line
    return '';
}

export async function containsElement (el1: ServerNode, el2: ServerNode): Promise<boolean> { // eslint-disable-line
    return true;
}

export function getImgMapName (el: ServerNode): string {
    if (!el.attributes)
        return '';

    const useMapIndex = el.attributes.indexOf('usemap');

    if (useMapIndex === -1)
        return '';

    return el.attributes[useMapIndex + 1].substring(1);
}

export async function getParentNode ({ objectId }: ServerNode): Promise<ServerNode | null> { // eslint-disable-line
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
