'use strict';

exports.__esModule = true;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.respond404 = respond404;
exports.respond500 = respond500;
exports.redirect = redirect;
exports.respondWithJSON = respondWithJSON;
exports.preventCaching = preventCaching;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function respond404(res) {
    res.statusCode = 404;
    res.end();
}

function respond500(res, err) {
    res.statusCode = 500;
    res.end(err || '');
}

function redirect(res, url) {
    res.statusCode = 302;
    res.setHeader('location', url);
    res.end();
}

function respondWithJSON(res, data) {
    preventCaching(res);
    res.setHeader('content-type', 'application/json');
    res.end(data ? (0, _stringify2.default)(data) : '');
}

function preventCaching(res) {
    res.setHeader('cache-control', 'no-cache, no-store, must-revalidate');
    res.setHeader('pragma', 'no-cache');
}