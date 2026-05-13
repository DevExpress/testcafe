/* eslint-disable no-var */

// Const
var TRANSFORMED_TYPE_KEY    = '@t';
var CIRCULAR_REF_KEY        = '@r';
var KEY_REQUIRE_ESCAPING_RE = /^#*@(t|r)$/;

var TYPED_ARRAY_CTORS = {
    'Int8Array':         typeof Int8Array === 'function' ? Int8Array : void 0,
    'Uint8Array':        typeof Uint8Array === 'function' ? Uint8Array : void 0,
    'Uint8ClampedArray': typeof Uint8ClampedArray === 'function' ? Uint8ClampedArray : void 0,
    'Int16Array':        typeof Int16Array === 'function' ? Int16Array : void 0,
    'Uint16Array':       typeof Uint16Array === 'function' ? Uint16Array : void 0,
    'Int32Array':        typeof Int32Array === 'function' ? Int32Array : void 0,
    'Uint32Array':       typeof Uint32Array === 'function' ? Uint32Array : void 0,
    'Float32Array':      typeof Float32Array === 'function' ? Float32Array : void 0,
    'Float64Array':      typeof Float64Array === 'function' ? Float64Array : void 0,
};

var SAFE_ERROR_CTORS = {
    'Error':          Error,
    'EvalError':      EvalError,
    'RangeError':     RangeError,
    'ReferenceError': ReferenceError,
    'SyntaxError':    SyntaxError,
    'TypeError':      TypeError,
    'URIError':       URIError,
};

var ARRAY_BUFFER_SUPPORTED = typeof ArrayBuffer === 'function';
var MAP_SUPPORTED          = typeof Map === 'function';
var SET_SUPPORTED          = typeof Set === 'function';
var BUFFER_FROM_SUPPORTED  = typeof Buffer === 'function';

var TYPED_ARRAY_SUPPORTED = function (typeName) {
    return !!TYPED_ARRAY_CTORS[typeName];
};

// Saved proto functions
var arrSlice = Array.prototype.slice;

// Default serializer
var JSONSerializer = {
    serialize: function (val) {
        return JSON.stringify(val);
    },

    deserialize: function (val) {
        return JSON.parse(val);
    },
};

// EncodingTransformer
var EncodingTransformer = function (val, transforms) {
    this.references               = val;
    this.transforms               = transforms;
    this.circularCandidates       = [];
    this.circularCandidatesDescrs = [];
    this.circularRefCount         = 0;
};

EncodingTransformer._createRefMark = function (idx) {
    var obj = Object.create(null);

    obj[CIRCULAR_REF_KEY] = idx;

    return obj;
};

EncodingTransformer.prototype._createCircularCandidate = function (val, parent, key) {
    this.circularCandidates.push(val);
    this.circularCandidatesDescrs.push({ parent: parent, key: key, refIdx: -1 });
};

EncodingTransformer.prototype._applyTransform = function (val, parent, key, transform) {
    var result          = Object.create(null);
    var serializableVal = transform.toSerializable(val);

    if (typeof serializableVal === 'object')
        this._createCircularCandidate(val, parent, key);

    result[TRANSFORMED_TYPE_KEY] = transform.type;
    result.data                  = this._handleValue(serializableVal, parent, key);

    return result;
};

EncodingTransformer.prototype._handleArray = function (arr) {
    var result = [];

    for (var i = 0; i < arr.length; i++)
        result[i] = this._handleValue(arr[i], result, i);

    return result;
};

EncodingTransformer.prototype._handlePlainObject = function (obj) {
    var replicator       = this;
    var result           = Object.create(null);
    var ownPropertyNames = Object.getOwnPropertyNames(obj);

    ownPropertyNames.forEach(key => {
        var resultKey = KEY_REQUIRE_ESCAPING_RE.test(key) ? '#' + key : key;

        result[resultKey] = replicator._handleValue(obj[key], result, resultKey);
    });

    return result;
};

EncodingTransformer.prototype._handleObject = function (obj, parent, key) {
    this._createCircularCandidate(obj, parent, key);

    return Array.isArray(obj) ? this._handleArray(obj) : this._handlePlainObject(obj);
};

EncodingTransformer.prototype._ensureCircularReference = function (obj) {
    var circularCandidateIdx = this.circularCandidates.indexOf(obj);

    if (circularCandidateIdx > -1) {
        var descr = this.circularCandidatesDescrs[circularCandidateIdx];

        if (descr.refIdx === -1)
            descr.refIdx = descr.parent ? ++this.circularRefCount : 0;

        return EncodingTransformer._createRefMark(descr.refIdx);
    }

    return null;
};

EncodingTransformer.prototype._handleValue = function (val, parent, key) {
    var type     = typeof val;
    var isObject = type === 'object' && val !== null;

    if (isObject) {
        var refMark = this._ensureCircularReference(val);

        if (refMark)
            return refMark;
    }

    for (var i = 0; i < this.transforms.length; i++) {
        var transform = this.transforms[i];

        if (transform.shouldTransform(type, val))
            return this._applyTransform(val, parent, key, transform);
    }

    if (isObject)
        return this._handleObject(val, parent, key);

    return val;
};

EncodingTransformer.prototype.transform = function () {
    var references = [this._handleValue(this.references, null, null)];

    for (var i = 0; i < this.circularCandidatesDescrs.length; i++) {
        var descr = this.circularCandidatesDescrs[i];

        if (descr.refIdx > 0) {
            references[descr.refIdx] = descr.parent[descr.key];
            descr.parent[descr.key]  = EncodingTransformer._createRefMark(descr.refIdx);
        }
    }

    return references;
};

// DecodingTransformer
var DecodingTransformer = function (references, transformsMap) {
    this.references            = references;
    this.transformMap          = transformsMap;
    this.activeTransformsStack = [];
    this.visitedRefs           = Object.create(null);
};

DecodingTransformer.prototype._handlePlainObject = function (obj) {
    var replicator       = this;
    var unescaped        = Object.create(null);
    var ownPropertyNames = Object.getOwnPropertyNames(obj);

    ownPropertyNames.forEach(key => {
        replicator._handleValue(obj[key], obj, key);

        if (KEY_REQUIRE_ESCAPING_RE.test(key)) {
            // NOTE: use intermediate object to avoid unescaped and escaped keys interference
            // E.g. unescaped "##@t" will be "#@t" which can overwrite escaped "#@t".
            unescaped[key.substring(1)] = obj[key];
            delete obj[key];
        }
    });

    for (var unescapedKey in unescaped)
        obj[unescapedKey] = unescaped[unescapedKey];
};

DecodingTransformer.prototype._handleTransformedObject = function (obj, parent, key) {
    var transformType = obj[TRANSFORMED_TYPE_KEY];
    var transform     = this.transformMap[transformType];

    if (!transform)
        throw new Error('Can\'t find transform for "' + transformType + '" type.');

    this.activeTransformsStack.push(obj);
    this._handleValue(obj.data, obj, 'data');
    this.activeTransformsStack.pop();

    parent[key] = transform.fromSerializable(obj.data);
};

DecodingTransformer.prototype._handleCircularSelfRefDuringTransform = function (refIdx, parent, key) {
    // NOTE: we've hit a hard case: object reference itself during transformation.
    // We can't dereference it since we don't have resulting object yet. And we'll
    // not be able to restore reference lately because we will need to traverse
    // transformed object again and reference might be unreachable or new object contain
    // new circular references. As a workaround we create getter, so once transformation
    // complete, dereferenced property will point to correct transformed object.
    var references = this.references;
    var val        = void 0;

    Object.defineProperty(parent, key, {
        configurable: true,
        enumerable:   true,

        get: function () {
            if (val === void 0)
                val = references[refIdx];

            return val;
        },

        set: function (value) {
            val = value;

            // eslint-disable-next-line no-setter-return
            return val;
        },
    });
};

DecodingTransformer.prototype._handleCircularRef = function (refIdx, parent, key) {
    if (this.activeTransformsStack.indexOf(this.references[refIdx]) > -1)
        this._handleCircularSelfRefDuringTransform(refIdx, parent, key);

    else {
        if (!this.visitedRefs[refIdx]) {
            this.visitedRefs[refIdx] = true;
            this._handleValue(this.references[refIdx], this.references, refIdx);
        }

        parent[key] = this.references[refIdx];
    }
};

DecodingTransformer.prototype._handleValue = function (val, parent, key) {
    if (typeof val !== 'object' || val === null)
        return;

    var refIdx = val[CIRCULAR_REF_KEY];

    if (refIdx !== void 0)
        this._handleCircularRef(refIdx, parent, key);

    else if (val[TRANSFORMED_TYPE_KEY])
        this._handleTransformedObject(val, parent, key);

    else if (Array.isArray(val)) {
        for (var i = 0; i < val.length; i++)
            this._handleValue(val[i], val, i);
    }

    else
        this._handlePlainObject(val);
};

DecodingTransformer.prototype.transform = function () {
    this.visitedRefs[0] = true;
    this._handleValue(this.references[0], this.references, 0);

    return this.references[0];
};

// Transforms
var builtInTransforms = [
    {
        type: '[[NaN]]',

        shouldTransform: function (type, val) {
            return type === 'number' && isNaN(val);
        },

        toSerializable: function () {
            return '';
        },

        fromSerializable: function () {
            return NaN;
        },
    },

    {
        type: '[[undefined]]',

        shouldTransform: function (type) {
            return type === 'undefined';
        },

        toSerializable: function () {
            return '';
        },

        fromSerializable: function () {
            return void 0;
        },
    },

    {
        type: '[[Date]]',

        shouldTransform: function (type, val) {
            return val instanceof Date;
        },

        toSerializable: function (date) {
            return date.getTime();
        },

        fromSerializable: function (val) {
            var date = new Date();

            date.setTime(val);

            return date;
        },
    },

    {
        type: '[[RegExp]]',

        shouldTransform: function (type, val) {
            return val instanceof RegExp;
        },

        toSerializable: function (re) {
            var result = {
                src:   re.source,
                flags: '',
            };

            if (re.global)
                result.flags += 'g';

            if (re.ignoreCase)
                result.flags += 'i';

            if (re.multiline)
                result.flags += 'm';

            return result;
        },

        fromSerializable: function (val) {
            return new RegExp(val.src, val.flags);
        },
    },

    {
        type: '[[Error]]',

        shouldTransform: function (type, val) {
            return val instanceof Error;
        },

        toSerializable: function (err) {
            return {
                name:    err.name,
                message: err.message,
                stack:   err.stack,
            };
        },

        fromSerializable: function (val) {
            var Ctor = SAFE_ERROR_CTORS[val.name] || Error;
            var err  = new Ctor(val.message);

            err.stack = val.stack;

            return err;
        },
    },

    {
        type: '[[ArrayBuffer]]',

        shouldTransform: function (type, val) {
            return ARRAY_BUFFER_SUPPORTED && val instanceof ArrayBuffer;
        },

        toSerializable: function (buffer) {
            var view = new Int8Array(buffer);

            return arrSlice.call(view);
        },

        fromSerializable: function (val) {
            if (ARRAY_BUFFER_SUPPORTED) {
                var buffer = new ArrayBuffer(val.length);
                var view   = new Int8Array(buffer);

                view.set(val);

                return buffer;
            }

            return val;
        },
    },

    {
        type: '[[Buffer]]',

        shouldTransform: function (type, val) {
            return BUFFER_FROM_SUPPORTED && val instanceof Buffer;
        },

        toSerializable: function (buffer) {
            return arrSlice.call(buffer);
        },

        fromSerializable: function (val) {
            if (BUFFER_FROM_SUPPORTED)
                return Buffer.from(val);

            return val;
        },
    },

    {
        type: '[[TypedArray]]',

        shouldTransform: function (type, val) {
            return Object.keys(TYPED_ARRAY_CTORS).some(ctorName => {
                return TYPED_ARRAY_SUPPORTED(ctorName) && val instanceof TYPED_ARRAY_CTORS[ctorName];
            });
        },

        toSerializable: function (arr) {
            return {
                ctorName: arr.constructor.name,
                arr:      arrSlice.call(arr),
            };
        },

        fromSerializable: function (val) {
            return TYPED_ARRAY_SUPPORTED(val.ctorName) ? new TYPED_ARRAY_CTORS[val.ctorName](val.arr) : val.arr;
        },
    },

    {
        type: '[[Map]]',

        shouldTransform: function (type, val) {
            return MAP_SUPPORTED && val instanceof Map;
        },

        toSerializable: function (map) {
            var flattenedKVArr = [];

            map.forEach((val, key) => {
                flattenedKVArr.push(key);
                flattenedKVArr.push(val);
            });

            return flattenedKVArr;
        },

        fromSerializable: function (val) {
            if (MAP_SUPPORTED) {
                // NOTE: new Map(iterable) is not supported by all browsers
                var map = new Map();

                for (var i = 0; i < val.length; i += 2)
                    map.set(val[i], val[i + 1]);

                return map;
            }

            var kvArr = [];

            for (var j = 0; j < val.length; j += 2)
                kvArr.push([val[j], val[j + 1]]);

            return kvArr;
        },
    },

    {
        type: '[[Set]]',

        shouldTransform: function (type, val) {
            return SET_SUPPORTED && val instanceof Set;
        },

        toSerializable: function (set) {
            var arr = [];

            set.forEach(val => {
                arr.push(val);
            });

            return arr;
        },

        fromSerializable: function (val) {
            if (SET_SUPPORTED) {
                // NOTE: new Set(iterable) is not supported by all browsers
                var set = new Set();

                for (var i = 0; i < val.length; i++)
                    set.add(val[i]);

                return set;
            }

            return val;
        },
    },
];

// Replicator
var Replicator = function (serializer) {
    this.transforms    = [];
    this.transformsMap = Object.create(null);
    this.serializer    = serializer || JSONSerializer;

    this.addTransforms(builtInTransforms);
};

// Manage transforms
Replicator.prototype.addTransforms = function (transforms) {
    transforms = Array.isArray(transforms) ? transforms : [transforms];

    for (var i = 0; i < transforms.length; i++) {
        var transform = transforms[i];

        if (this.transformsMap[transform.type])
            throw new Error('Transform with type "' + transform.type + '" was already added.');

        this.transforms.push(transform);
        this.transformsMap[transform.type] = transform;
    }

    return this;
};

Replicator.prototype.removeTransforms = function (transforms) {
    transforms = Array.isArray(transforms) ? transforms : [transforms];

    for (var i = 0; i < transforms.length; i++) {
        var transform = transforms[i];
        var idx       = this.transforms.indexOf(transform);

        if (idx > -1)
            this.transforms.splice(idx, 1);

        delete this.transformsMap[transform.type];
    }

    return this;
};

Replicator.prototype.encode = function (val) {
    var transformer = new EncodingTransformer(val, this.transforms);
    var references  = transformer.transform();

    return this.serializer.serialize(references);
};

Replicator.prototype.decode = function (val) {
    var references  = this.serializer.deserialize(val);
    var transformer = new DecodingTransformer(references, this.transformsMap);

    return transformer.transform();
};

export default Replicator;
