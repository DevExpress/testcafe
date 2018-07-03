'use strict';

exports.__esModule = true;
exports.assertUrl = assertUrl;
exports.resolvePageUrl = resolvePageUrl;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _osFamily = require('os-family');

var _osFamily2 = _interopRequireDefault(_osFamily);

var _runtime = require('../errors/runtime');

var _message = require('../errors/runtime/message');

var _message2 = _interopRequireDefault(_message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PROTOCOL_RE = /^([\w-]+?)(?=:\/\/)/;
var SUPPORTED_PROTOCOL_RE = /^(https?|file):/;
var IMPLICIT_PROTOCOL_RE = /^\/\//;
var ABSOLUTE_PATH_RE = /^\/[^/]/;
var WIN_ABSOLUTE_PATH_RE = /^\w:[/\\]/;
var RELATIVE_PATH_RE = /^\.\.?[/\\]/;

function isAbsolutePath(url) {
    return _osFamily2.default.win ? WIN_ABSOLUTE_PATH_RE.test(url) : ABSOLUTE_PATH_RE.test(url);
}

function resolveFileUrl(url, testFileName) {
    var testFileDir = _path2.default.dirname(testFileName);

    if (RELATIVE_PATH_RE.test(url)) url = _path2.default.join(testFileDir, url);

    return 'file://' + url;
}

function assertUrl(url, callsiteName) {
    var protocol = url.match(PROTOCOL_RE);
    var hasUnsupportedProtocol = protocol && !SUPPORTED_PROTOCOL_RE.test(url);
    var isWinAbsolutePath = _osFamily2.default.win && WIN_ABSOLUTE_PATH_RE.test(url);

    if (hasUnsupportedProtocol && !isWinAbsolutePath && url !== 'about:blank') throw new _runtime.APIError(callsiteName, _message2.default.unsupportedUrlProtocol, url, protocol[0]);
}

function resolvePageUrl(url, testFileName) {
    if (SUPPORTED_PROTOCOL_RE.test(url) || url === 'about:blank') return url;

    if (isAbsolutePath(url) || RELATIVE_PATH_RE.test(url)) return resolveFileUrl(url, testFileName);

    var protocol = IMPLICIT_PROTOCOL_RE.test(url) ? 'http:' : 'http://';

    return protocol + url;
}