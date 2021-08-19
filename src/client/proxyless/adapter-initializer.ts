import { ClientFunctionAdapter } from '../driver/command-executors/client-functions/types';
import nativeMethods from './native-methods';
import * as domUtils from './dom-utils';


const initializer: ClientFunctionAdapter = {
    isProxyless:   true,
    nativeMethods: nativeMethods,
    PromiseCtor:   nativeMethods.Promise,

    // eslint-disable-next-line hammerhead/use-native-methods
    delay: (ms: number) => new nativeMethods.Promise(resolve => nativeMethods.setTimeout(resolve, ms)),

    isShadowRoot:     domUtils.isShadowRoot,
    isDomElement:     domUtils.isDomElement,
    isTextNode:       domUtils.isTextNode,
    isOptionElement:  domUtils.isOptionElement,
    getTagName:       domUtils.getTagName,
    getActiveElement: domUtils.getActiveElement,

    isOptionElementVisible: domUtils.isOptionElementVisible,
    isElementVisible:       domUtils.isElementVisible,
};

export default initializer;
