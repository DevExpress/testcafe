import { domUtils, positionUtils } from '../../deps/testcafe-core';
import { selectElement as selectElementUI } from '../../deps/testcafe-ui';

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
