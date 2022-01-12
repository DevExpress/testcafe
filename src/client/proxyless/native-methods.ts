import { NativeMethods } from '../driver/command-executors/client-functions/types';


const nativeMethods: NativeMethods = {
    Function:        window.Function,
    Node:            window.Node,
    Promise:         window.Promise,
    NodeList:        window.NodeList,
    HTMLCollection:  window.HTMLCollection,
    elementClass:    window.Element,
    svgElementClass: window.SVGElement,

    objectKeys:           window.Object.keys,
    objectAssign:         window.Object.assign,
    objectToString:       window.Object.prototype.toString,
    objectGetPrototypeOf: window.Object.getPrototypeOf,

    // eslint-disable-next-line no-restricted-properties
    dateNow:          window.Date.now,
    isArray:          window.Array.isArray,
    arrayFilter:      window.Array.prototype.filter,
    setTimeout:       window.setTimeout,
    closest:          window.Element.prototype.closest,
    matches:          window.Element.prototype.matches,
    getAttribute:     window.Element.prototype.getAttribute,
    querySelector:    window.HTMLElement.prototype.querySelector,
    querySelectorAll: window.HTMLElement.prototype.querySelectorAll,
    scrollTo:         window.scrollTo,

    // @ts-ignore
    contentWindowGetter: window.Object.getOwnPropertyDescriptor(window.HTMLIFrameElement.prototype, 'contentWindow').get,
};

export default nativeMethods;
