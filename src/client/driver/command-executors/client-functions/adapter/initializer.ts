// @ts-ignore
import { Promise, nativeMethods } from '../../../deps/hammerhead';
import {
    // @ts-ignore
    delay,
    // @ts-ignore
    domUtils,
    // @ts-ignore
    positionUtils,
} from '../../../deps/testcafe-core';
// @ts-ignore
import { selectElement as selectElementUI } from '../../../deps/testcafe-ui';
import { ClientFunctionAdapter } from '../types';

// Hack, remove it
nativeMethods.isArray = Array.isArray;

const initializer: ClientFunctionAdapter = {
    isProxyless:            false,
    nativeMethods:          nativeMethods,
    PromiseCtor:            Promise,
    delay:                  delay,
    isShadowRoot:           domUtils.isShadowRoot,
    isDomElement:           domUtils.isDomElement,
    isTextNode:             domUtils.isTextNode,
    isOptionElement:        domUtils.isOptionElement,
    getTagName:             domUtils.getTagName,
    isOptionElementVisible: selectElementUI.isOptionElementVisible,
    isElementVisible:       positionUtils.isElementVisible,
    getActiveElement:       domUtils.getActiveElement,
};

export default initializer;
