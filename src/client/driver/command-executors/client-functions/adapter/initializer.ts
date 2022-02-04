import hammerhead from '../../../deps/hammerhead';
import testCafeCore from '../../../deps/testcafe-core';
import testCafeUI from '../../../deps/testcafe-ui';
import { ClientFunctionAdapter } from '../types';

const {
    Promise,
    nativeMethods,
    processScript,
} = hammerhead;
const {
    delay,
    domUtils,
    positionUtils,
} = testCafeCore;
const selectElementUI = testCafeUI.selectElement;


const initializer: ClientFunctionAdapter = {
    isProxyless:            false,
    nativeMethods:          nativeMethods,
    PromiseCtor:            Promise,
    processScript:          processScript,
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
