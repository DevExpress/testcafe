import hammerhead from '../deps/hammerhead';

const nativeIndexOf = Array.prototype.indexOf;
const nativeForEach = Array.prototype.forEach;
const nativeSome    = Array.prototype.some;
const nativeMap     = Array.prototype.map;
const nativeFilter  = Array.prototype.filter;
const nativeReverse = Array.prototype.reverse;
const nativeReduce  = Array.prototype.reduce;
const nativeSplice  = Array.prototype.splice;

export function toArray (arg) {
    const arr    = [];
    const length = arg.length;

    for (let i = 0; i < length; i++)
        arr.push(arg[i]);

    return arr;
}

export function reverse (arr) {
    return nativeReverse.call(arr);
}

export function isArray (arg) {
    return hammerhead.nativeMethods.objectToString.call(arg) === '[object Array]';
}

export function find (arr, callback) {
    const length = arr.length;

    for (let i = 0; i < length; i++) {
        if (callback(arr[i], i, arr))
            return arr[i];
    }

    return null;
}

export function indexOf (arr, arg) {
    return nativeIndexOf.call(arr, arg);
}

export function forEach (arr, callback) {
    nativeForEach.call(arr, callback);
}

export function some (arr, callback) {
    return nativeSome.call(arr, callback);
}

export function map (arr, callback) {
    return nativeMap.call(arr, callback);
}

export function filter (arr, callback) {
    return nativeFilter.call(arr, callback);
}

export function reduce (arr, callback, initialValue) {
    return nativeReduce.call(arr, callback, initialValue);
}

export function remove (arr, item) {
    const index = indexOf(arr, item);

    if (index > -1)
        nativeSplice.call(arr, index, 1);
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
