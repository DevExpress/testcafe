'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default').default;

exports.__esModule = true;
exports.check = check;

var _sharedConst = require('../shared/const');

var _sharedConst2 = _interopRequireDefault(_sharedConst);

// NOTE: https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS

function check(ctx) {
    var reqOrigin = ctx.dest.reqOrigin;

    // PASSED: Same origin
    if (ctx.dest.domain === reqOrigin) return true;

    // Ok, we have a cross-origin request
    var xhrHeader = ctx.req.headers[_sharedConst2.default.XHR_REQUEST_MARKER_HEADER];
    var corsSupported = xhrHeader & _sharedConst2.default.XHR_CORS_SUPPORTED_FLAG;

    // FAILED: CORS not supported
    if (!corsSupported) return false;

    // PASSED: we have a "preflight" request
    if (ctx.req.method === 'OPTIONS') return true;

    var withCredentials = xhrHeader & _sharedConst2.default.XHR_WITH_CREDENTIALS_FLAG;
    var allowOriginHeader = ctx.destRes.headers['access-control-allow-origin'];
    var allowCredentialsHeader = ctx.destRes.headers['access-control-allow-credentials'];
    var allowCredentials = String(allowCredentialsHeader).toLowerCase() === 'true';
    var allowedOrigins = Array.isArray(allowOriginHeader) ? allowOriginHeader : [allowOriginHeader];
    var wildcardAllowed = allowedOrigins.indexOf('*') > -1;

    // FAILED: Credentialed requests are not allowed or wild carding was used
    // for the allowed origin (credentialed requests should specify exact domain).
    if (withCredentials && (!allowCredentials || wildcardAllowed)) return false;

    // FINAL CHECK: request origin should match one of the allowed origins
    return wildcardAllowed || allowedOrigins.indexOf(reqOrigin) > -1;
}
//# sourceMappingURL=same-origin-policy.js.map