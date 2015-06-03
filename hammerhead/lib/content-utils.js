'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator').default;

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default').default;

exports.__esModule = true;
exports.parseCharset = parseCharset;
exports.parseCharsetFromMeta = parseCharsetFromMeta;
exports.isPageMIME = isPageMIME;
exports.isCSSResource = isCSSResource;
exports.isScriptResource = isScriptResource;
exports.isManifest = isManifest;
exports.isJSON = isJSON;
exports.decodeContent = decodeContent;
exports.encodeContent = encodeContent;

var _iconvLite = require('iconv-lite');

var _iconvLite2 = _interopRequireDefault(_iconvLite);

var _promise = require('promise');

var _promise2 = _interopRequireDefault(_promise);

var _zlib = require('zlib');

var _zlib2 = _interopRequireDefault(_zlib);

var _server_errs = require('./server_errs');

var _server_errs2 = _interopRequireDefault(_server_errs);

var gzip = _promise2.default.denodeify(_zlib2.default.gzip);
var deflate = _promise2.default.denodeify(_zlib2.default.deflate);
var gunzip = _promise2.default.denodeify(_zlib2.default.gunzip);
var inflate = _promise2.default.denodeify(_zlib2.default.inflate);
var inflateRaw = _promise2.default.denodeify(_zlib2.default.inflateRaw);

// Const
var PAGE_MIME_RE = /(text\/html)|(application\/xhtml\+xml)|(application\/xml)|(application\/x-ms-application)/i;
var CHARSET_RE = /(?:^|;)\s*charset=(.+)(?:;|$)/i;
var META_CHARSET_RE = /charset ?= ?['"]?([^ ;"']*)['"]?/i;
var JSON_MIME = 'application/json';
var MANIFEST_MIME = 'text/cache-manifest';
var CSS_MIME = 'text/css';

var SCRIPT_MIMES = ['application/javascript', 'text/javascript', 'application/x-javascript'];

var CHARSETS = ['iso-8859-1', 'iso-8859-2', 'iso-8859-3', 'iso-8859-4', 'iso-8859-5', 'iso-8859-6', 'iso-8859-7', 'iso-8859-8', 'iso-8859-9', 'iso-8859-10', 'iso-8859-11', 'iso-8859-12', 'iso-8859-13', 'iso-8859-14', 'iso-8859-15', 'iso-8859-16', 'windows-1250', 'windows-1251', 'windows-1252', 'windows-1253', 'windows-1254', 'windows-1255', 'windows-1256', 'windows-1257', 'windows-1258', 'windows-874', 'windows-866', 'koi8-r', 'koi8-u', 'utf-8', 'utf-16', 'utf-32', 'shift-jis', 'x-euc', 'big5', 'euc-kr'];

var NORMALIZED_CHARSETS_MAP = CHARSETS.reduce(function (charsetMap, charset) {
    charsetMap[getNormalizedCharsetMapKey(charset)] = charset;
    return charsetMap;
}, {});

var DEFAULT_CHARSET = 'iso-8859-1'; // NOTE: HTTP 1.1 specifies ISO-8859-1 as a default charset
// (see: http://www.w3.org/International/O-HTTP-charset.en.php).

// Charset
function getNormalizedCharsetMapKey(charset) {
    return charset.replace(/-/g, '').toLowerCase();
}

function normalizeCharset(charset) {
    var key = charset ? getNormalizedCharsetMapKey(charset) : null;
    return NORMALIZED_CHARSETS_MAP[key] || DEFAULT_CHARSET;
}

function parseCharset(contentTypeHeader) {
    var charsetMatch = contentTypeHeader && contentTypeHeader.match(CHARSET_RE);
    var charset = charsetMatch ? charsetMatch[1] : null;
    return normalizeCharset(charset);
}

// NOTE: parsing charset from meta-tags
// www.whatwg.org/specs/web-apps/current-work/multipage/parsing.html#determining-the-character-encoding
// Each <meta> descriptor should contain values of the "http-equiv", "content" and "charset" attributes.
//TODO test it!!!!

function parseCharsetFromMeta(metas) {
    var needPragma = null;
    var charset = null;

    metas.forEach(function (attrs) {
        var shouldParseFromContentAttr = needPragma !== false && atts.content && attrs.httpEquiv && attrs.httpEquiv.toLowerCase() === 'content-type';

        if (shouldParseFromContentAttr) {
            var charsetMatch = attrs.content.match(META_CHARSET_RE);

            if (charsetMatch) {
                needPragma = true;
                charset = charsetMatch[1];
            }
        }

        if (attrs.charset) {
            needPragma = false;
            charset = attrs.charset;
        }
    });

    return normalizeCharset(charset);
}

// Content type

function isPageMIME(header) {
    return header && PAGE_MIME_RE.test(header);
}

function isCSSResource(contentTypeHeader, acceptHeader) {
    return contentTypeHeader.indexOf(CSS_MIME) > -1 || acceptHeader === CSS_MIME;
}

function isScriptResource(contentTypeHeader, acceptHeader) {
    return SCRIPT_MIMES.some(function (mime) {
        return contentTypeHeader.indexOf(mime) > -1;
    }) || SCRIPT_MIMES.indexOf(acceptHeader) > -1;
}

function isManifest(contentTypeHeader) {
    return contentTypeHeader.indexOf(MANIFEST_MIME) > -1;
}

function isJSON(contentTypeHeader) {
    return contentTypeHeader.indexOf(JSON_MIME) > -1;
}

// Encoding / decoding

// NOTE: IIS bug has a bug then it sends 'raw deflate' compressed
// data for 'Deflate' Accept-Encoding header.
// (see: http://zoompf.com/2012/02/lose-the-wait-http-compression)
function inflateWithFallback(data) {
    return _regeneratorRuntime.async(function inflateWithFallback$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.prev = 0;
                context$1$0.next = 3;
                return inflate(data);

            case 3:
                return context$1$0.abrupt('return', context$1$0.sent);

            case 6:
                context$1$0.prev = 6;
                context$1$0.t0 = context$1$0['catch'](0);

                if (!(context$1$0.t0.code === 'Z_DATA_ERROR')) {
                    context$1$0.next = 14;
                    break;
                }

                context$1$0.next = 11;
                return inflateRaw(data);

            case 11:
                return context$1$0.abrupt('return', context$1$0.sent);

            case 14:
                throw context$1$0.t0;

            case 15:
            case 'end':
                return context$1$0.stop();
        }
    }, null, this, [[0, 6]]);
}

function decodeContent(content, encoding, charset) {
    return _regeneratorRuntime.async(function decodeContent$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                if (!(encoding === 'gzip')) {
                    context$1$0.next = 6;
                    break;
                }

                context$1$0.next = 3;
                return gunzip(content);

            case 3:
                content = context$1$0.sent;
                context$1$0.next = 10;
                break;

            case 6:
                if (!(encoding === 'deflate')) {
                    context$1$0.next = 10;
                    break;
                }

                context$1$0.next = 9;
                return inflateWithFallback(content);

            case 9:
                content = context$1$0.sent;

            case 10:
                return context$1$0.abrupt('return', _iconvLite2.default.decode(content, charset));

            case 11:
            case 'end':
                return context$1$0.stop();
        }
    }, null, this);
}

function encodeContent(content, encoding, charset) {
    return _regeneratorRuntime.async(function encodeContent$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                content = _iconvLite2.default.encode(content, charset);

                if (!(encoding === 'gzip')) {
                    context$1$0.next = 3;
                    break;
                }

                return context$1$0.abrupt('return', gzip(content));

            case 3:
                if (!(encoding === 'deflate')) {
                    context$1$0.next = 5;
                    break;
                }

                return context$1$0.abrupt('return', deflate(content));

            case 5:
                return context$1$0.abrupt('return', content);

            case 6:
            case 'end':
                return context$1$0.stop();
        }
    }, null, this);
}
//# sourceMappingURL=content-utils.js.map