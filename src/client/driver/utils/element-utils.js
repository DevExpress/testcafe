import { domUtils, positionUtils } from '../deps/testcafe-core';
import { selectElement as selectElementUI } from '../deps/testcafe-ui';

// NOTE: save original ctors and methods because they may be overwritten by page code
const isArray        = Array.isArray;
const Node           = window.Node;
const HTMLCollection = window.HTMLCollection;
const NodeList       = window.NodeList;

export function exists (el) {
    return !!el;
}

export function visible (el) {
    if (!domUtils.isDomElement(el) && !domUtils.isTextNode(el))
        return false;

    if (domUtils.isOptionElement(el) || domUtils.getTagName(el) === 'optgroup')
        return selectElementUI.isOptionElementVisible(el);

    return positionUtils.isElementVisible(el);
}

export function IsNodeCollection (obj) {
    return obj instanceof HTMLCollection || obj instanceof NodeList || isArrayOfNodes(obj);
}

function isArrayOfNodes (obj) {
    if (!isArray(obj))
        return false;

    for (let i = 0; i < obj.length; i++) {
        if (!(obj[i] instanceof Node))
            return false;
    }

    return true;
}
