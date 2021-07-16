import { NativeMethods } from '../driver/command-executors/client-functions/types';


const nativeMethods: NativeMethods = {
    Function:       window.Function,
    Node:           window.Node,
    Promise:        window.Promise,
    NodeList:       window.NodeList,
    HTMLCollection: window.HTMLCollection,
    elementClass:   window.Element,

    objectKeys:           window.Object.keys,
    objectAssign:         window.Object.assign,
    objectToString:       window.Object.prototype.toString,
    objectGetPrototypeOf: window.Object.getPrototypeOf,

    // eslint-disable-next-line no-restricted-properties
    dateNow:    window.Date.now,
    isArray:    window.Array.isArray,
    setTimeout: window.setTimeout,
    closest:    window.Element.prototype.closest,
};

export default nativeMethods;
