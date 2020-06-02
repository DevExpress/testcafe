import getCustomClientScriptUrl from './get-url';
import getCustomClientScriptCode from './get-code';
import CONTENT_TYPES from '../assets/content-types';
import ClientScript from './client-script';
import { Proxy } from 'testcafe-hammerhead';


interface Test {
    clientScripts: ClientScript[];
}

interface LegacyTest {
    isLegacy: boolean;
}

type TestItem = Test | LegacyTest;

export function isLegacyTest (test: TestItem): test is LegacyTest {
    return !!(test as LegacyTest).isLegacy;
}

export function register (proxy: Proxy, tests: Test[]): string[] {
    const routes: string[] = [];

    tests.forEach(test => {
        if (isLegacyTest(test))
            return;

        test.clientScripts.forEach((script: ClientScript) => {
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

export function unRegister (proxy: Proxy, routes: string[]): void {
    routes.forEach(route => {
        proxy.unRegisterRoute(route, 'GET');
    });
}
