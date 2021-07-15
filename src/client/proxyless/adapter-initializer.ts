import { ClientFunctionAdapter } from '../driver/command-executors/client-functions/types';

export default function initializeAdapter (adapter: ClientFunctionAdapter): void {
    adapter.isProxyless   = true;
    //adapter.nativeMethods = nativeMethods;
    adapter.PromiseCtor   = Promise;
    //adapter.delay         = delay;
    //adapter.isShadowRoot  = (_node: Node): boolean => false; //domUtils.isShadowRoot;
}

/*


const ElementCtor  = window.Element;
const PromiseCtor  = window.Promise;
const setTimeoutFn = window.setTimeout;


$0.ownerDocument.defaultView


export default class CommandExecutorsAdapter extends CommandExecutorsAdapterBase {
    private readonly _nativeMethods = {
        Function,
        Node,
        Promise,
        objectKeys: Object.keys,
    };

    public isProxyless (): boolean {
        return true;
    }

    public getNativeMethods (): NativeMethods {
        return this._nativeMethods;
    }

    public getPromiseCtor (): typeof Promise {
        return PromiseCtor;
    }

    public delay (ms: number): Promise<void> {
        return new Promise(resolve => setTimeoutFn(resolve, ms));
    }

    public isShadowRoot (root: Node): root is ShadowRoot {
        return root instanceof root.ownerDocument?.defaultView?.ShadowRoot;
    }

    public visible (el: Node): boolean {
        if (!this._isDomElement(el) && !domUtils.isTextNode(el))
            return false;

        if (domUtils.isOptionElement(el) || domUtils.getTagName(el) === 'optgroup')
            return selectElementUI.isOptionElementVisible(el);

        return positionUtils.isElementVisible(el);
    }

    // NOTE: Transferred from testcafe-hammerhead
    private _isDomElement (el) {
        if (el instanceof ElementCtor)
            return true;

        return el && /^\[object HTML.*?Element]$/i.test(instanceToString(el)) && isElementNode(el) && el.tagName;


        return node && node.nodeType === Node.ELEMENT_NODE;


        return instanceToString(el) === '[object HTMLOptionElement]';


        return el && typeof el.tagName === 'string' ? el.tagName.toLowerCase() : '';
    }

    // positionUtils.isElementVisible

    // domUtils.getActiveElement

    //domUtils.isShadowRoot
}
*/
