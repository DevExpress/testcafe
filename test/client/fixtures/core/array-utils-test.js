const hammerhead   = window.getTestCafeModule('hammerhead');
const browserUtils = hammerhead.utils.browser;

const testCafeCore = window.getTestCafeModule('testCafeCore');
const arrayUtils   = testCafeCore.arrayUtils;

let array = [];

QUnit.testStart(function () {
    array = [1, 2, 3, 4, 5];
});

test('filter()', function () {
    array.filter = function () {
        throw Error('Some error');
    };

    deepEqual(arrayUtils.filter(array, function (item) {
        return item > 2;
    }), [3, 4, 5]);
});

test('map()', function () {
    array.map = function () {
        throw Error('Some error');
    };

    deepEqual(arrayUtils.map(array, function (item) {
        return item++;
    }), [1, 2, 3, 4, 5]);
});

test('slice()', function () {
    array.slice = function () {
        throw Error('Some error');
    };

    deepEqual(arrayUtils.slice(array, 1, 3), [2, 3]);
});

test('splice()', function () {
    array.splice = function () {
        throw Error('Some error');
    };

    const spliceResult = arrayUtils.splice(array, 1, 2, 'bar', 'baz');

    deepEqual(spliceResult, [2, 3]);
    deepEqual(array, [1, 'bar', 'baz', 4, 5]);
});

test('unshift()', function () {
    array.unshift = function () {
        throw Error('Some error');
    };

    arrayUtils.unshift(array, 'bar', 'baz');
    deepEqual(array, ['bar', 'baz', 1, 2, 3, 4, 5]);
});

test('forEach()', function () {
    array.forEach = function () {
        throw Error('Some error');
    };

    let forEachResult = 0;

    arrayUtils.forEach(array, function (item) {
        forEachResult += item;
    });

    deepEqual(forEachResult, 15);
});

test('indexOf()', function () {
    array.indexOf = function () {
        throw Error('Some error');
    };

    deepEqual(arrayUtils.indexOf(array, 2), 1);
    deepEqual(arrayUtils.indexOf(array, 'bar'), -1);
});

test('some()', function () {
    array.some = function () {
        throw Error('Some error');
    };

    deepEqual(arrayUtils.some(array, function (item) {
        return item > 4;
    }), true);

    deepEqual(arrayUtils.some(array, function (item) {
        return item === 'bar';
    }), false);
});

test('reverse()', function () {
    array.reverse = function () {
        throw Error('Some error');
    };

    deepEqual(arrayUtils.reverse(array), [5, 4, 3, 2, 1]);
});

test('reduce()', function () {
    array.reduce = function () {
        throw Error('Some error');
    };

    const reducer = function (accumulator, currentValue) {
        return accumulator + currentValue;
    };

    deepEqual(arrayUtils.reduce(array, reducer), 15);
});

test('concat()', function () {
    array.concat = function () {
        throw Error('Some error');
    };

    deepEqual(arrayUtils.concat(array, [6, 7], 8), [1, 2, 3, 4, 5, 6, 7, 8]);
});

test('join()', function () {
    array.join = function () {
        throw Error('Some error');
    };

    deepEqual(arrayUtils.join(array, ','), '1,2,3,4,5');
});

test('isArray()', function () {
    ok(arrayUtils.isArray(array));
    notOk(arrayUtils.isArray('array'));
});

test('from()', function () {
    deepEqual(arrayUtils.from('foo'), ['f', 'o', 'o']);

    if (!browserUtils.isIE) {
        deepEqual(arrayUtils.from(array, function (x) {
            return x + x;
        }), [2, 4, 6, 8, 10]);
    }
});

test('find()', function () {
    array.find = function () {
        throw Error('Some error');
    };

    deepEqual(arrayUtils.find(array, function (item) {
        return item >= 2;
    }), 2);
});

test('remove()', function () {
    arrayUtils.remove(array, 'bar');
    deepEqual(array, [1, 2, 3, 4, 5]);

    arrayUtils.remove(array, 3);
    deepEqual(array, [1, 2, 4, 5]);
});

test('equals()', function () {
    notOk(arrayUtils.equals(array, [5, 4, 3, 2, 1]));
    ok(arrayUtils.equals(array, [1, 2, 3, 4, 5]));
});

test('getCommonElement()', function () {
    deepEqual(arrayUtils.getCommonElement(array, ['bar', 'baz']), null);
    deepEqual(arrayUtils.getCommonElement(array, ['bar', 'baz', 5]), 5);
});
