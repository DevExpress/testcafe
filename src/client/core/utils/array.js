import { nativeMethods } from '../deps/hammerhead';

const ARRAY_METHODS_PREFIX = 'array';

function createNativeMethodWrapper (methodName) {
    const nativeMethodName = ARRAY_METHODS_PREFIX + methodName.charAt(0).toUpperCase() + methodName.slice(1);
    const nativeMethod     = nativeMethods[nativeMethodName];

    return (...args) => nativeMethod.call(...args);
}

export const filter  = createNativeMethodWrapper('filter');
export const map     = createNativeMethodWrapper('map');
export const slice   = createNativeMethodWrapper('slice');
export const splice  = createNativeMethodWrapper('splice');
export const unshift = createNativeMethodWrapper('unshift');
export const forEach = createNativeMethodWrapper('forEach');
export const indexOf = createNativeMethodWrapper('indexOf');
export const some    = createNativeMethodWrapper('some');
export const reverse = createNativeMethodWrapper('reverse');
export const reduce  = createNativeMethodWrapper('reduce');
export const concat  = createNativeMethodWrapper('concat');
export const join    = createNativeMethodWrapper('join');

export function isArray (arg) {
    return nativeMethods.objectToString.call(arg) === '[object Array]';
}

export function from (arg, ...args) {
    if (nativeMethods.arrayFrom)
        return nativeMethods.arrayFrom(arg, ...args);

    // NOTE: this logic is for IE
    const arr    = [];
    const length = arg.length;

    for (let i = 0; i < length; i++)
        arr.push(arg[i]);

    return arr;
}

export function find (arr, callback) {
    if (nativeMethods.arrayFind)
        return nativeMethods.arrayFind.call(arr, callback);

    // NOTE: this logic is for IE
    const length = arr.length;

    for (let i = 0; i < length; i++) {
        if (callback(arr[i], i, arr))
            return arr[i];
    }

    return null;
}

export function remove (arr, item) {
    const index = nativeMethods.arrayIndexOf.call(arr, item);

    if (index > -1)
        nativeMethods.arraySplice.call(arr, index, 1);
}

export function equals (arr1, arr2) {
    if (arr1.length !== arr2.length)
        return false;

    for (let i = 0, l = arr1.length; i < l; i++) {
        if (arr1[i] !== arr2[i])
            return false;
    }

    return true;
}

export function getCommonElement (arr1, arr2) {
    for (let i = 0; i < arr1.length; i++) {
        for (let t = 0; t < arr2.length; t++) {
            if (arr1[i] === arr2[t])
                return arr1[i];
        }
    }

    return null;
}

