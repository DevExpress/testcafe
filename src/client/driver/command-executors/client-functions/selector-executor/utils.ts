// @ts-ignore
import { nativeMethods, utils } from '../../../deps/hammerhead';
// @ts-ignore
import { domUtils, positionUtils } from '../../../deps/testcafe-core';
// @ts-ignore
import { isOptionElementVisible } from '../../../deps/testcafe-ui';

export function visible (el: Node): boolean {
    if (domUtils.isIframeElement(el))
        return positionUtils.isIframeVisible(el);

    if (!utils.dom.isDomElement(el) && !utils.dom.isTextNode(el))
        return false;

    if (domUtils.isOptionElement(el) || domUtils.getTagName(el as Element) === 'optgroup')
        return isOptionElementVisible(el);

    return domUtils.isElementVisible(el);
}

export function isNodeCollection (obj: unknown): obj is HTMLCollection | NodeList {
    return obj instanceof nativeMethods.HTMLCollection || obj instanceof nativeMethods.NodeList;
}

export function castToArray (list: HTMLCollection | NodeList): Node[] {
    const length = list.length;
    const result = [];

    for (let i = 0; i < length; i++)
        result.push(list[i]);

    return result;
}

export function isArrayOfNodes (obj: unknown): obj is Node[] {
    if (!nativeMethods.isArray(obj))
        return false;

    for (let i = 0; i < (obj as []).length; i++) {
        // @ts-ignore
        if (!(obj[i] instanceof nativeMethods.Node))
            return false;
    }

    return true;
}
