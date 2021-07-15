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

export default function initializeAdapter (adapter: ClientFunctionAdapter): void {
    adapter.isProxyless            = false;
    adapter.nativeMethods          = nativeMethods;
    adapter.PromiseCtor            = Promise;
    adapter.delay                  = delay;
    adapter.isShadowRoot           = domUtils.isShadowRoot;
    adapter.isDomElement           = domUtils.isDomElement;
    adapter.isTextNode             = domUtils.isTextNode;
    adapter.isOptionElement        = domUtils.isOptionElement;
    adapter.getTagName             = domUtils.getTagName;
    adapter.isOptionElementVisible = selectElementUI.isOptionElementVisible;
    adapter.isElementVisible       = positionUtils.isElementVisible;
    adapter.getActiveElement       = domUtils.getActiveElement;
}
