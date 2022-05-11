import { ClientFunctionAdapter } from '../driver/command-executors/client-functions/types';
import nativeMethods from './native-methods';
import * as domUtils from './utils/dom';
import * as styleUtils from './utils/style';
import { isElementVisible, isIframeVisible } from '../core/utils/shared/visibility';


const initializer: ClientFunctionAdapter = {
    isProxyless:   true,
    nativeMethods: nativeMethods,
    PromiseCtor:   nativeMethods.Promise,

    // eslint-disable-next-line hammerhead/use-native-methods
    delay: (ms: number) => new nativeMethods.Promise(resolve => nativeMethods.setTimeout.call(window, resolve, ms)),

    isShadowRoot:     domUtils.isShadowRoot,
    isDomElement:     domUtils.isDomElement,
    isTextNode:       domUtils.isTextNode,
    isOptionElement:  domUtils.isOptionElement,
    getTagName:       domUtils.getTagName,
    getActiveElement: domUtils.getActiveElement,
    isIframeVisible:  isIframeVisible,
    isIframeElement:  domUtils.isIframeElement,

    isOptionElementVisible: styleUtils.isOptionElementVisible,
    isElementVisible:       isElementVisible,
};

export default initializer;
