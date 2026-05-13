'use strict';

// Tests for the inlined replicator utility (originally from https://github.com/inikulin/replicator)

const assert      = require('assert');
const Replicator  = require('../../lib/utils/replicator');
const helpersGH16 = require('./helpers/replicator-tests-helper');

describe('Replicator', function () {
    it('Should add and remove transforms', function () {
        const replicator = new Replicator();
        const transform1 = { type: 'transform1' };
        const transform2 = { type: 'transform2' };

        replicator.transforms    = [];
        replicator.transformsMap = {};

        replicator
            .addTransforms(transform1)
            .addTransforms(transform2);

        assert.deepStrictEqual(replicator.transforms, [transform1, transform2]);

        replicator.removeTransforms(transform1);

        assert.deepStrictEqual(replicator.transforms, [transform2]);
    });

    it('Should raise error if transform already added', function () {
        const replicator = new Replicator();
        const transform  = { type: '42' };

        replicator.addTransforms(transform);

        assert.throws(function () {
            replicator.addTransforms(transform);
        }, /Transform with type "42" was already added/);
    });

    describe('Encoding/decoding', function () {
        it('Should encode and restore objects using transforms', function () {
            const replicator = new Replicator();

            replicator.transforms    = [];
            replicator.transformsMap = {};

            const SomeClass = function () {};

            SomeClass.prototype.func1 = function () {
                return 'yo1';
            };

            SomeClass.prototype.func2 = function () {
                return 'yo2';
            };

            replicator
                .addTransforms([
                    {
                        type: 'SomeClass',

                        shouldTransform: function (type, val) {
                            return val instanceof SomeClass;
                        },

                        toSerializable: function (val) {
                            return [val.func1, val.func2];
                        },

                        fromSerializable: function (val) {
                            return {
                                func1: val[0],
                                func2: val[1],
                            };
                        },
                    },
                    {
                        type: 'function',

                        shouldTransform: function (type) {
                            return type === 'function';
                        },

                        toSerializable: function (val) {
                            return val.toString().replace(/\s/g, '');
                        },

                        fromSerializable: function (val) {
                            /* eslint-disable no-eval */
                            return eval('(' + val + ')');
                            /* eslint-enable no-eval */
                        },
                    },
                    {
                        type: 'Error',

                        shouldTransform: function (type, val) {
                            return val instanceof Error;
                        },

                        toSerializable: function (val) {
                            return val.message;
                        },

                        fromSerializable: function (val) {
                            return new Error(val);
                        },
                    },
                ]);

            const obj = {
                someClassProp: new SomeClass(),
                otherObjects:  [
                    new Error('Hey ya!'),

                    function () {
                        return '42';
                    },

                    {
                        strProperty:    'yo',
                        numberProperty: 42,
                    },
                ],
            };

            const actual = replicator.decode(replicator.encode(obj));

            assert.strictEqual(actual.someClassProp.func1(), 'yo1');
            assert.strictEqual(actual.someClassProp.func2(), 'yo2');
            assert(actual.otherObjects[0] instanceof Error);
            assert.strictEqual(actual.otherObjects[0].message, 'Hey ya!');
            assert.strictEqual(actual.otherObjects[1](), '42');
            assert.deepStrictEqual(actual.otherObjects[2], {
                strProperty:    'yo',
                numberProperty: 42,
            });
        });

        it('Should not modify original object', function () {
            const replicator = new Replicator();

            const obj = {
                someProp1: {
                    prop: ['Hey ya'],
                },
                someProp2: ['yo'],
            };

            replicator.addTransforms({
                type: 'single-item-array',

                shouldTransform: function (type, val) {
                    return Array.isArray(val) && val.length === 1;
                },

                toSerializable: function (val) {
                    return val[0];
                },

                fromSerializable: function (val) {
                    return [val];
                },
            });

            const actual = replicator.decode(replicator.encode(obj));

            assert.deepStrictEqual(actual, obj);
            assert.deepStrictEqual(obj, {
                someProp1: {
                    prop: ['Hey ya'],
                },
                someProp2: ['yo'],
            });
        });

        it('Should encode circular references', function () {
            const replicator = new Replicator();
            const obj        = {};

            const SomeClass = function () {
                this.arr = [];
            };

            obj.a = obj;

            obj.b = {
                ba: 123,
                bb: obj,
            };

            obj.c = {
                ca: obj.b,
            };

            obj.b.bc = obj.c;
            obj.d    = [obj, obj.c];
            obj.c.cb = obj.d;

            obj.e = new SomeClass();
            obj.e.arr.push(obj.e);

            replicator.addTransforms({
                type: 'SomeClass',

                shouldTransform: function (type, val) {
                    return val instanceof SomeClass;
                },

                toSerializable: function (val) {
                    return val.arr;
                },

                fromSerializable: function (val) {
                    const inst = new SomeClass();

                    inst.arr = val;

                    return inst;
                },
            });

            const actual = replicator.decode(replicator.encode(obj));

            assert.strictEqual(actual.a, actual);
            assert.strictEqual(actual.b.ba, 123);
            assert.strictEqual(actual.b.bb, actual);
            assert.strictEqual(actual.c.ca, actual.b);
            assert.strictEqual(actual.b.bc, actual.c);
            assert.strictEqual(actual.d[0], actual);
            assert.strictEqual(actual.d[1], actual.c);
            assert.strictEqual(actual.c.cb, actual.d);
            assert(actual.e instanceof SomeClass);
            assert.strictEqual(actual.e.arr[0], actual.e);
        });

        it('Should escape object keys when necessary', function () {
            const obj = {
                '@t':    1,
                '###@t': 2,
                '#@t':   3,
                '@r':    4,
                '##@r':  5,
            };

            const replicator = new Replicator();
            const actual     = replicator.decode(replicator.encode(obj));

            assert.deepStrictEqual(actual, obj);
        });
    });

    describe('Built-in transforms', function () {
        const replicator = new Replicator();

        it('Should transform NaN', function () {
            const actual = replicator.decode(replicator.encode(NaN));

            assert.strictEqual(typeof actual, 'number');
            assert(isNaN(actual));
        });

        it('Should transform undefined', function () {
            const actual = replicator.decode(replicator.encode({ obj: void 0 }));

            assert.strictEqual(actual.obj, void 0);
        });

        it('Should transform Date', function () {
            const actual = replicator.decode(replicator.encode(new Date(2016, 5, 6)));

            assert(actual instanceof Date);
            assert.strictEqual(actual.getFullYear(), 2016);
            assert.strictEqual(actual.getMonth(), 5);
        });

        it('Should transform RegExp', function () {
            const actual = replicator.decode(replicator.encode(/\d+/gim));

            assert(actual instanceof RegExp);
            assert.strictEqual(actual.source, '\\d+');
            assert.strictEqual(actual.global, true);
            assert.strictEqual(actual.ignoreCase, true);
            assert.strictEqual(actual.multiline, true);
        });

        it('Should transform Error', function () {
            const obj = {
                error:       new Error('err1'),
                syntaxError: new SyntaxError('err2'),
            };

            obj.error.stack       = 'stack1';
            obj.syntaxError.stack = 'stack2';

            const actual = replicator.decode(replicator.encode(obj));

            assert(actual.error instanceof Error);
            assert(actual.syntaxError instanceof SyntaxError);
            assert.strictEqual(actual.error.toString(), 'Error: err1');
            assert.strictEqual(actual.syntaxError.toString(), 'SyntaxError: err2');
            assert.strictEqual(actual.error.stack, 'stack1');
            assert.strictEqual(actual.syntaxError.stack, 'stack2');
        });

        it('Should transform ArrayBuffer', function () {
            const buf  = new ArrayBuffer(4 * 2);
            const view = new Uint32Array(buf);

            view.set([5500, 2000]);

            const actual     = replicator.decode(replicator.encode(buf));
            const actualView = new Uint32Array(actual);

            assert(actual instanceof ArrayBuffer);
            assert.strictEqual(actualView.length, 2);
            assert.strictEqual(actualView[0], 5500);
            assert.strictEqual(actualView[1], 2000);
        });

        it('Should transform Buffer', function () {
            if (typeof Buffer !== 'function')
                return;

            const buffer = Buffer.from([3, 5]);
            const actual = replicator.decode(replicator.encode(buffer));

            assert(actual instanceof Buffer);
            assert.strictEqual(actual.length, 2);
            assert.strictEqual(actual[0], 3);
            assert.strictEqual(actual[1], 5);
        });

        it('Should transform TypedArray', function () {
            const actual = replicator.decode(replicator.encode({
                uint8:   new Uint8Array([1, 230]),
                float32: new Float32Array([4.23, 9, 2.45]),
                int32:   new Int32Array([-3, 9000]),
            }));

            assert(actual.uint8 instanceof Uint8Array);
            assert(actual.float32 instanceof Float32Array);
            assert(actual.int32 instanceof Int32Array);
            assert.strictEqual(actual.uint8.length, 2);
            assert.strictEqual(actual.float32.length, 3);
            assert.strictEqual(actual.int32.length, 2);
            assert(Math.abs(actual.float32[2] - 2.45) < 0.0000001);
            assert.strictEqual(actual.int32[0], -3);
            assert.strictEqual(actual.int32[1], 9000);
        });

        it('Should transform Map', function () {
            if (typeof Map !== 'function')
                return;

            const map    = new Map();
            const arrKey = [1, 2, 3];
            const reKey  = /(123).*/i;

            map.set(arrKey, 'value1');
            map.set(reKey, 'value2');

            const actual = replicator.decode(replicator.encode({
                arrKey: arrKey,
                reKey:  reKey,
                map:    map,
            }));

            assert.strictEqual(actual.map.get(actual.arrKey), 'value1');
            assert.strictEqual(actual.map.get(actual.reKey), 'value2');
        });

        it('Should transform Set', function () {
            if (typeof Set !== 'function')
                return;

            const set = new Set();
            const re  = /(123).*/i;
            const str = 'Some text';

            set.add(42);
            set.add(str);
            set.add(re);

            const actual = replicator.decode(replicator.encode({
                re:  re,
                str: str,
                set: set,
            }));

            assert(actual.set.has(42));
            assert(actual.set.has(actual.str));
            assert(actual.set.has(actual.re));
            assert(!actual.set.has('yo'));
        });
    });

    describe('Regression', function () {
        const replicator = new Replicator();

        it('Should not throw if one of the typed array types is not supported (GH-1)', function () {
            const arr              = new Uint8Array([1, 230]);
            const savedUint8Array  = global.Uint8Array;

            global.Uint8Array = void 0;

            const actual = replicator.decode(replicator.encode(arr));

            assert.strictEqual(actual[0], 1);
            assert.strictEqual(actual[1], 230);

            global.Uint8Array = savedUint8Array;
        });

        it('Should encode objects with null as a prototype', function () {
            const obj = Object.create(null);

            obj.foo = 'bar';
            obj.ans = 42;

            const actual = replicator.decode(replicator.encode(obj));

            assert.strictEqual(actual.foo, 'bar');
            assert.strictEqual(actual.ans, 42);
        });

        it('Should not allow RCE when deserializing TypedArrays (GH-16)', function () {
            replicator.decode(helpersGH16.vulnerableData);

            return helpersGH16.checkIfBroken()
                .then(function (result) {
                    assert.strictEqual(result, false);
                })
                .then(helpersGH16.resetEvilFlag);
        });
    });
});
