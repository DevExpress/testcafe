import { getPathname } from '../shared/url_util';


// Const
const PARAM_RE = /^{(\S+)}$/;


// Static
function buildRouteParamsMap (routeMatch, paramNames) {
    return paramNames.reduce((params, paramName, i) => {
        params[paramName] = routeMatch[i + 1];
        return params;
    }, {});

}


// Router
export default class Router {
    constructor () {
        this.routes           = {};
        this.routesWithParams = [];
    }

    _registerRoute (pattern, method, handler) {
        // NOTE: we always expect trailing '/'
        if (pattern[pattern.length - 1] !== '/')
            pattern += '/';

        var tokens            = pattern.split('/');
        var isRouteWithParams = tokens.some((token) => PARAM_RE.test(token));

        if (isRouteWithParams)
            this._registerRouteWithParams(tokens, method, handler);

        else {
            this.routes[method + ' ' + pattern] = {
                handler:  handler,
                isStatic: typeof handler !== 'function'
            };
        }
    }

    _registerRouteWithParams (tokens, method, handler) {
        var paramNames = [];

        var reParts = tokens
            .filter((token) => !!token)
            .map((token) => {
                var paramMatch = token.match(PARAM_RE);

                if (paramMatch) {
                    paramNames.push(paramMatch[1]);
                    return '(\\S+?)';
                }

                return token;
            });

        this.routesWithParams.push({
            paramNames: paramNames,
            re:         new RegExp('^' + method + ' /' + reParts.join('/') + '/$'),
            handler:    handler
        });
    }

    _route (req, res) {
        var routerQuery = req.method + ' ' + getPathname(req.url);

        // NOTE: we always expect trailing '/'
        if (routerQuery[routerQuery.length - 1] !== '/')
            routerQuery += '/';

        var route = this.routes[routerQuery];

        if (route) {
            if (route.isStatic) {
                //NOTE: store content for 1 hour (60*60 = 3600 seconds)
                res.setHeader('cache-control', 'max-age=3600, public');
                res.setHeader('content-type', route.handler.contentType);
                res.end(route.handler.content);
            }
            else
                route.handler(req, res);

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
    }

    // API
    GET (pattern, handler) {
        this._registerRoute(pattern, 'GET', handler);
    }

    POST (pattern, handler) {
        this._registerRoute(pattern, 'POST', handler);
    }
}