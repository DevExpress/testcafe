'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default').default;

exports.__esModule = true;
exports.respond404 = respond404;
exports.respond500 = respond500;
exports.respondWithJSON = respondWithJSON;
exports.fetchBody = fetchBody;

var _promise = require('promise');

var _promise2 = _interopRequireDefault(_promise);

function respond404(res) {
    res.statusCode = 404;
    res.end();
}

function respond500(res, err) {
    res.statusCode = 500;
    res.end(err || '');
}

function respondWithJSON(res, data, skipContentType) {
    if (!skipContentType) res.setHeader('content-type', 'application/json');

    res.end(data ? JSON.stringify(data) : '');
}

function fetchBody(r) {
    return new _promise2.default(function (resolve) {
        var chunks = [];

        r.on('data', function (chunk) {
            return chunks.push(chunk);
        });
        r.on('end', function () {
            return resolve(Buffer.concat(chunks));
        });
    });
}
//# sourceMappingURL=http-utils.js.map