// @ts-ignore
import { nativeMethods } from '../../../deps/hammerhead';


export function isNodeCollection (obj: unknown): obj is HTMLCollection | NodeList {
    return obj instanceof nativeMethods.HTMLCollection || obj instanceof nativeMethods.NodeList;
}

export function castToArray (list: HTMLCollection | NodeList): Node[] {
    const length = list.length;
    const result = [];

    for (let i = 0; i < length; i++)
        result.push(list[i]);

    return result;
}

export function isArrayOfNodes (obj: unknown): obj is Node[] {
    if (!nativeMethods.isArray(obj))
        return false;

    for (let i = 0; i < (obj as []).length; i++) {
        // @ts-ignore
        if (!(obj[i] instanceof nativeMethods.Node))
            return false;
    }

    return true;
}
