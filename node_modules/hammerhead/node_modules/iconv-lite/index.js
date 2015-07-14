
var IconvLiteEncoderStream = false,
    IconvLiteDecoderStream = false;

var iconv = module.exports = {
    // All codecs and aliases are kept here, keyed by encoding name.
    // They are lazy loaded in `getCodec` by `/encodings/index.js` to make initial module loading fast.
    encodings: null,

    codecData: {},

    // Characters emitted in case of error.
    defaultCharUnicode: '�',
    defaultCharSingleByte: '?',

    // Public API
    encode: function(str, encoding, options) {
        str = ensureString(str);
        var encoder = iconv.getCodec(encoding).encoder(options);
        var front = encoder.write(str);
        var end = encoder.end();
        if (end)
            return Buffer.concat([front, end]);
        else
            return front;
    },
    decode: function(buf, encoding, options) {
        buf = ensureBuffer(buf);
        var decoder = iconv.getCodec(encoding).decoder(options);
        var front = decoder.write(buf);
        var end = decoder.end();
        if (end)
            return front + end;
        else
            return front;
    },

    encodeStream: function(encoding, options) {
        if (!IconvLiteEncoderStream)
            throw new Error("Iconv-lite streams supported only since Node v0.10.");

        return new IconvLiteEncoderStream(iconv.getCodec(encoding).encoder(options), options);
    },
    decodeStream: function(encoding, options) {
        if (!IconvLiteDecoderStream)
            throw new Error("Iconv-lite streams supported only since Node v0.10.");

        return new IconvLiteDecoderStream(iconv.getCodec(encoding).decoder(options), options);
    },

    encodingExists: function(enc) {
        try {
            iconv.getCodec(enc);
            return true;
        } catch (e) {
            return false;
        }
    },
    supportsStreams: function() {
        return !!IconvLiteEncoderStream;
    },
    extendNodeEncodings: extendNodeEncodings,
    undoExtendNodeEncodings: undoExtendNodeEncodings,

    // Search for a codec.
    getCodec: function(encoding) {
        if (!iconv.encodings)
            iconv.encodings = require("./encodings"); // Lazy load all encoding definitions.
        
        // Canonicalize encoding name: strip all non-alphanumeric chars and appended year.
        var enc = (''+encoding).toLowerCase().replace(/[^0-9a-z]|:\d{4}$/g, "");

        var codecOptions, saveEnc;
        while (1) {
            var codecData = iconv.codecData[enc];
            if (codecData)
                return codecData;

            var codec = iconv.encodings[enc];

            switch (getType(codec)) {
                case "String": // Direct alias to other encoding.
                    enc = codec;
                    break;

                case "Object": // Alias with additional options. Can be layered.
                    if (!codecOptions) {
                        codecOptions = codec;
                        saveEnc = enc;
                    }
                    else
                        for (var key in codec)
                            codecOptions[key] = codec[key];

                    enc = codec.type;
                    break;

                case "Function": // Codec itself.
                    codecOptions.iconv = iconv;
                    codecData = codec(codecOptions);
                    iconv.codecData[saveEnc || enc] = codecData; // Save it to be reused later.
                    return codecData;

                default:
                    throw new Error("Encoding not recognized: '" + encoding + "' (searched as: '"+enc+"')");
            }
        }
    },

};

// Legacy aliases to convert functions
iconv.toEncoding = iconv.encode;
iconv.fromEncoding = iconv.decode;


// Utilities
function getType(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1);
}

function ensureBuffer(buf) {
    buf = buf || new Buffer(0);
    return (buf instanceof Buffer) ? buf : new Buffer(""+buf, "binary");
}

function ensureString(str) {
    str = str || "";
    return (str instanceof Buffer) ? str.toString('utf8') : (""+str);
}

// Streaming support for Node v0.10+
var nodeVer = process.versions.node.split(".").map(Number);
if (nodeVer[0] > 0 || nodeVer[1] >= 10) {
    var Transform = require("stream").Transform;

    // == Encoder stream =======================================================
    IconvLiteEncoderStream = function IconvLiteEncoderStream(conv, options) {
        this.conv = conv;
        options = options || {};
        options.decodeStrings = false; // We accept only strings, so we don't need to decode them.
        Transform.call(this, options);
    }

    IconvLiteEncoderStream.prototype = Object.create(Transform.prototype, {
        constructor: { value: IconvLiteEncoderStream }
    });

    IconvLiteEncoderStream.prototype._transform = function(chunk, encoding, done) {
        if (typeof chunk != 'string')
            return done(new Error("Iconv encoding stream needs strings as its input."));
        try {
            var res = this.conv.write(chunk);
            if (res && res.length) this.push(res);
            done();
        }
        catch (e) {
            done(e);
        }
    }

    IconvLiteEncoderStream.prototype._flush = function(done) {
        try {
            var res = this.conv.end();
            if (res && res.length) this.push(res);
            done();
        }
        catch (e) {
            done(e);
        }
    }

    IconvLiteEncoderStream.prototype.collect = function(cb) {
        var chunks = [];
        this.on('error', cb);
        this.on('data', function(chunk) { chunks.push(chunk); });
        this.on('end', function() {
            cb(null, Buffer.concat(chunks));
        });
        return this;
    }


    // == Decoder stream =======================================================
    IconvLiteDecoderStream = function IconvLiteDecoderStream(conv, options) {
        this.conv = conv;
        options = options || {};
        options.encoding = this.encoding = 'utf8'; // We output strings.
        Transform.call(this, options);
    }

    IconvLiteDecoderStream.prototype = Object.create(Transform.prototype, {
        constructor: { value: IconvLiteDecoderStream }
    });

    IconvLiteDecoderStream.prototype._transform = function(chunk, encoding, done) {
        if (!Buffer.isBuffer(chunk))
            return done(new Error("Iconv decoding stream needs buffers as its input."));
        try {
            var res = this.conv.write(chunk);
            if (res && res.length) this.push(res, this.encoding);
            done();
        }
        catch (e) {
            done(e);
        }
    }

    IconvLiteDecoderStream.prototype._flush = function(done) {
        try {
            var res = this.conv.end();
            if (res && res.length) this.push(res, this.encoding);                
            done();
        }
        catch (e) {
            done(e);
        }
    }

    IconvLiteDecoderStream.prototype.collect = function(cb) {
        var res = '';
        this.on('error', cb);
        this.on('data', function(chunk) { res += chunk; });
        this.on('end', function() {
            cb(null, res);
        });
        return this;
    }
}

// == Extend Node primitives to use iconv-lite =================================
var original = undefined; // original functions.

function extendNodeEncodings() {
    if (original)
        throw new Error("require('iconv-lite').extendNodeEncodings() is already called.")
    original = {};

    var nodeNativeEncodings = {
        'hex': true, 'utf8': true, 'utf-8': true, 'ascii': true, 'binary': true, 
        'base64': true, 'ucs2': true, 'ucs-2': true, 'utf16le': true, 'utf-16le': true,
    };

    Buffer.isNativeEncoding = function(enc) {
        return nodeNativeEncodings[enc && enc.toLowerCase()];
    }

    // -- SlowBuffer -----------------------------------------------------------
    var SlowBuffer = require('buffer').SlowBuffer;

    original.SlowBufferToString = SlowBuffer.prototype.toString;
    SlowBuffer.prototype.toString = function(encoding, start, end) {
        encoding = String(encoding || 'utf8').toLowerCase();
        start = +start || 0;
        if (typeof end !== 'number') end = this.length;

        // Fastpath empty strings
        if (+end == start)
            return '';

        // Use native conversion when possible
        if (Buffer.isNativeEncoding(encoding))
            return original.SlowBufferToString.call(this, encoding, start, end);

        // Otherwise, use our decoding method.
        if (typeof start == 'undefined') start = 0;
        if (typeof end == 'undefined') end = this.length;
        return iconv.decode(this.slice(start, end), encoding);
    }

    original.SlowBufferWrite = SlowBuffer.prototype.write;
    SlowBuffer.prototype.write = function(string, offset, length, encoding) {
        // Support both (string, offset, length, encoding)
        // and the legacy (string, encoding, offset, length)
        if (isFinite(offset)) {
            if (!isFinite(length)) {
                encoding = length;
                length = undefined;
            }
        } else {  // legacy
            var swap = encoding;
            encoding = offset;
            offset = length;
            length = swap;
        }

        offset = +offset || 0;
        var remaining = this.length - offset;
        if (!length) {
            length = remaining;
        } else {
            length = +length;
            if (length > remaining) {
                length = remaining;
            }
        }
        encoding = String(encoding || 'utf8').toLowerCase();

        // Use native conversion when possible
        if (Buffer.isNativeEncoding(encoding))
            return original.SlowBufferWrite.call(this, string, offset, length, encoding);

        if (string.length > 0 && (length < 0 || offset < 0))
            throw new RangeError('attempt to write beyond buffer bounds');

        // Otherwise, use our encoding method.
        var buf = iconv.encode(string, encoding);
        if (buf.length < length) length = buf.length;
        buf.copy(this, offset, 0, length);
        return length;
    }

    // -- Buffer ---------------------------------------------------------------

    original.BufferIsEncoding = Buffer.isEncoding;
    Buffer.isEncoding = function(encoding) {
        return Buffer.isNativeEncoding(encoding) || iconv.encodingExists(encoding);
    }

    original.BufferByteLength = Buffer.byteLength;
    Buffer.byteLength = SlowBuffer.byteLength = function(str, encoding) {
        encoding = String(encoding || 'utf8').toLowerCase();

        // Use native conversion when possible
        if (Buffer.isNativeEncoding(encoding))
            return original.BufferByteLength.call(this, str, encoding);

        // Slow, I know, but we don't have a better way yet.
        return iconv.encode(str, encoding).length;
    }

    original.BufferToString = Buffer.prototype.toString;
    Buffer.prototype.toString = function(encoding, start, end) {
        encoding = String(encoding || 'utf8').toLowerCase();

        // Use native conversion when possible
        if (Buffer.isNativeEncoding(encoding))
            return original.BufferToString.call(this, encoding, start, end);

        // Otherwise, use our decoding method.
        if (typeof start == 'undefined') start = 0;
        if (typeof end == 'undefined') end = this.length;
        return iconv.decode(this.slice(start, end), encoding);
    }

    original.BufferWrite = Buffer.prototype.write;
    Buffer.prototype.write = function(string, offset, length, encoding) {
        var _offset = offset, _length = length, _encoding = encoding;
        // Support both (string, offset, length, encoding)
        // and the legacy (string, encoding, offset, length)
        if (isFinite(offset)) {
            if (!isFinite(length)) {
                encoding = length;
                length = undefined;
            }
        } else {  // legacy
            var swap = encoding;
            encoding = offset;
            offset = length;
            length = swap;
        }

        encoding = String(encoding || 'utf8').toLowerCase();

        // Use native conversion when possible
        if (Buffer.isNativeEncoding(encoding))
            return original.BufferWrite.call(this, string, _offset, _length, _encoding);

        offset = +offset || 0;
        var remaining = this.length - offset;
        if (!length) {
            length = remaining;
        } else {
            length = +length;
            if (length > remaining) {
                length = remaining;
            }
        }

        if (string.length > 0 && (length < 0 || offset < 0))
            throw new RangeError('attempt to write beyond buffer bounds');

        // Otherwise, use our encoding method.
        var buf = iconv.encode(string, encoding);
        if (buf.length < length) length = buf.length;
        buf.copy(this, offset, 0, length);
        return length;

        // TODO: Set _charsWritten.
    }


    // -- Readable -------------------------------------------------------------
    if (iconv.supportsStreams()) {
        var Readable = require('stream').Readable;

        original.ReadableSetEncoding = Readable.prototype.setEncoding;
        Readable.prototype.setEncoding = function setEncoding(enc, options) {
            // Try to use original function when possible.
            if (Buffer.isNativeEncoding(enc))
                return original.ReadableSetEncoding.call(this, enc);

            // Try to use our own decoder, it has the same interface.
            this._readableState.decoder = iconv.getCodec(enc).decoder(options);
            this._readableState.encoding = enc;
        }

        Readable.prototype.collect = IconvLiteDecoderStream.prototype.collect;
    }
}


function undoExtendNodeEncodings() {
    if (!original)
        throw new Error("require('iconv-lite').undoExtendNodeEncodings(): Nothing to undo; extendNodeEncodings() is not called.")

    delete Buffer.isNativeEncoding;

    var SlowBuffer = require('buffer').SlowBuffer;

    SlowBuffer.prototype.toString = original.SlowBufferToString;
    SlowBuffer.prototype.write = original.SlowBufferWrite;

    Buffer.isEncoding = original.BufferIsEncoding;
    Buffer.byteLength = original.BufferByteLength;
    Buffer.prototype.toString = original.BufferToString;
    Buffer.prototype.write = original.BufferWrite;

    if (iconv.supportsStreams()) {
        var Readable = require('stream').Readable;

        Readable.prototype.setEncoding = original.ReadableSetEncoding;
        delete Readable.prototype.collect;
    }

    original = undefined;
}


