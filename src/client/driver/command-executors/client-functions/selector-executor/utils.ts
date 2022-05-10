import adapter from '..//adapter/index';


export function visible (el: Node): boolean {
    if (adapter.isIframeElement(el))
        return adapter.isIframeVisible(el);

    if (!adapter.isDomElement(el) && !adapter.isTextNode(el))
        return false;

    if (adapter.isOptionElement(el) || adapter.getTagName(el as Element) === 'optgroup')
        return adapter.isOptionElementVisible(el);

    return adapter.isElementVisible(el);
}

export function isNodeCollection (obj: unknown): obj is HTMLCollection | NodeList {
    return obj instanceof adapter.nativeMethods.HTMLCollection || obj instanceof adapter.nativeMethods.NodeList;
}

export function castToArray (list: HTMLCollection | NodeList): Node[] {
    const length = list.length;
    const result = [];

    for (let i = 0; i < length; i++)
        result.push(list[i]);

    return result;
}

export function isArrayOfNodes (obj: unknown): obj is Node[] {
    if (!adapter.nativeMethods.isArray(obj))
        return false;

    for (let i = 0; i < obj.length; i++) {
        if (!(obj[i] instanceof adapter.nativeMethods.Node))
            return false;
    }

    return true;
}
