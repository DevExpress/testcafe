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
