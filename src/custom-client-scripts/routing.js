import getCustomClientScriptUrl from './get-url';
import getCustomClientScriptCode from './get-code';
import CONTENT_TYPES from '../assets/content-types';

export function register (proxy, tests) {
    const routes = [];

    tests.forEach(test => {
        if (test.isLegacy)
            return;

        test.clientScripts.forEach(script => {
            const route = getCustomClientScriptUrl(script);

            proxy.GET(route, {
                content:     getCustomClientScriptCode(script),
                contentType: CONTENT_TYPES.javascript
            });

            routes.push(route);
        });
    });

    return routes;
}

export function unRegister (proxy, routes) {
    routes.forEach(route => {
        proxy.unRegisterRoute(route, 'GET');
    });
}
