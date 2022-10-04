// @ts-ignore
import { nativeMethods } from '../../../deps/hammerhead';
import {
    // @ts-ignore
    domUtils,
    // @ts-ignore
    positionUtils,
    // @ts-ignore
    stringifyElement,
} from '../../../deps/testcafe-core';
// @ts-ignore
import { selectElement } from '../../../deps/testcafe-ui';
import elementHiddenReasons from '../../../../../shared/errors/element-hidden-reasons';


export function isElementVisible (el: Node): boolean {
    if (domUtils.isOptionElement(el) || domUtils.getTagName(el as Element) === 'optgroup')
        return selectElement.isOptionElementVisible(el);

    return positionUtils.isElementVisible(el);
}

export function getHiddenReason (el?: Node): string | null {
    const isOptionElement = domUtils.isOptionElement(el) || domUtils.getTagName(el as Element) === 'optgroup';

    if (isOptionElement && !selectElement.isOptionElementVisible(el)) {
        const optionParent    = domUtils.getSelectParent(el);
        const optionParentStr = stringifyElement(optionParent);
        const optionStr       = stringifyElement(el);

        return elementHiddenReasons.optionNotVisible(optionStr, optionParentStr);
    }

    return positionUtils.getHiddenReason(el);
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
