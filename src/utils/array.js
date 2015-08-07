var concat = [].concat;

export function concatFlattened (oldArr, newArr) {
    return concat.apply(oldArr, newArr);
}

export function find (arr, predicate) {
    for (var item of arr) {
        if (predicate(item))
            return item;
    }

    return void 0;
}

export function remove (arr, item) {
    var idx = arr.indexOf(item);

    arr.splice(idx, 1);
}
