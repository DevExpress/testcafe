import hammerhead from '../deps/hammerhead';

var nativeIndexOf = Array.prototype.indexOf;
var nativeForEach = Array.prototype.forEach;
var nativeSome    = Array.prototype.some;
var nativeMap     = Array.prototype.map;
var nativeFilter  = Array.prototype.filter;
var nativeReverse = Array.prototype.reverse;
var nativeReduce  = Array.prototype.reduce;
var nativeSplice  = Array.prototype.splice;

export function toArray (arg) {
    var arr    = [];
    var length = arg.length;

    for (var i = 0; i < length; i++)
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
    var length = arr.length;

    for (var i = 0; i < length; i++) {
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
    var index = indexOf(arr, item);

    if (index > -1)
        nativeSplice.call(arr, index, 1);
}

export function equals (arr1, arr2) {
    if (arr1.length !== arr2.length)
        return false;

    for (var i = 0, l = arr1.length; i < l; i++) {
        if (arr1[i] !== arr2[i])
            return false;
    }

    return true;
}

export function getCommonElement (arr1, arr2) {
    for (var i = 0; i < arr1.length; i++) {
        for (var t = 0; t < arr2.length; t++) {
            if (arr1[i] === arr2[t])
                return arr1[i];
        }
    }

    return null;
}
