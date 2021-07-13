// @ts-ignore
import { domUtils, positionUtils } from '../deps/testcafe-core';
// @ts-ignore
import { selectElement as selectElementUI } from '../deps/testcafe-ui';

// NOTE: save original ctors and methods because they may be overwritten by page code
const isArray        = Array.isArray;
const Node           = window.Node;
const HTMLCollection = window.HTMLCollection;
const NodeList       = window.NodeList;


export function visible (el: Node): boolean {
    if (!domUtils.isDomElement(el) && !domUtils.isTextNode(el))
        return false;

    if (domUtils.isOptionElement(el) || domUtils.getTagName(el) === 'optgroup')
        return selectElementUI.isOptionElementVisible(el);

    return positionUtils.isElementVisible(el);
}

export function isNodeCollection (obj: unknown): obj is HTMLCollection | NodeList {
    return obj instanceof HTMLCollection || obj instanceof NodeList;
}

export function castToArray (list: HTMLCollection | NodeList): Node[] {
    const length = list.length;
    const result = [];

    for (let i = 0; i < length; i++)
        result.push(list[i]);

    return result;
}

export function isArrayOfNodes (obj: unknown): obj is Node[] {
    if (!isArray(obj))
        return false;

    for (let i = 0; i < obj.length; i++) {
        if (!(obj[i] instanceof Node))
            return false;
    }

    return true;
}
