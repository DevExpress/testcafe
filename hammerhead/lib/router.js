'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check').default;

exports.__esModule = true;

var _sharedUrl_util = require('../shared/url_util');

// Const
var PARAM_RE = /^{(\S+)}$/;

// Static
function buildRouteParamsMap(routeMatch, paramNames) {
    return paramNames.reduce(function (params, paramName, i) {
        params[paramName] = routeMatch[i + 1];
        return params;
    }, {});
}

// Router

var Router = (function () {
    function Router() {
        _classCallCheck(this, Router);

        this.routes = {};
        this.routesWithParams = [];
    }

    Router.prototype._registerRoute = function _registerRoute(pattern, method, handler) {
        // NOTE: we always expect trailing '/'
        if (pattern[pattern.length - 1] !== '/') pattern += '/';

        var tokens = pattern.split('/');
        var isRouteWithParams = tokens.some(function (token) {
            return PARAM_RE.test(token);
        });

        if (isRouteWithParams) this._registerRouteWithParams(tokens, method, handler);else {
            this.routes[method + ' ' + pattern] = {
                handler: handler,
                isStatic: typeof handler !== 'function'
            };
        }
    };

    Router.prototype._registerRouteWithParams = function _registerRouteWithParams(tokens, method, handler) {
        var paramNames = [];

        var reParts = tokens.filter(function (token) {
            return !!token;
        }).map(function (token) {
            var paramMatch = token.match(PARAM_RE);

            if (paramMatch) {
                paramNames.push(paramMatch[1]);
                return '(\\S+?)';
            }

            return token;
        });

        this.routesWithParams.push({
            paramNames: paramNames,
            re: new RegExp('^' + method + ' /' + reParts.join('/') + '/$'),
            handler: handler
        });
    };

    Router.prototype._route = function _route(req, res) {
        var routerQuery = req.method + ' ' + (0, _sharedUrl_util.getPathname)(req.url);

        // NOTE: we always expect trailing '/'
        if (routerQuery[routerQuery.length - 1] !== '/') routerQuery += '/';

        var route = this.routes[routerQuery];

        if (route) {
            if (route.isStatic) {
                //NOTE: store content for 1 hour (60*60 = 3600 seconds)
                res.setHeader('cache-control', 'max-age=3600, public');
                res.setHeader('content-type', route.handler.contentType);
                res.end(route.handler.content);
            } else route.handler(req, res);

            return true;
        }

        for (var i = 0; i < this.routesWithParams.length; i++) {
            route = this.routesWithParams[i];

            var routeMatch = routerQuery.match(route.re);

            if (routeMatch) {
                var params = buildRouteParamsMap(routeMatch, route.paramNames);

                route.handler(req, res, params);
                return true;
            }
        }

        return false;
    };

    // API

    Router.prototype.GET = function GET(pattern, handler) {
        this._registerRoute(pattern, 'GET', handler);
    };

    Router.prototype.POST = function POST(pattern, handler) {
        this._registerRoute(pattern, 'POST', handler);
    };

    return Router;
})();

exports.default = Router;
module.exports = exports.default;
//# sourceMappingURL=router.js.map