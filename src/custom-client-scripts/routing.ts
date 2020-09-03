import getCustomClientScriptUrl from './get-url';
import getCustomClientScriptCode from './get-code';
import CONTENT_TYPES from '../assets/content-types';
import ClientScript from './client-script';
import { Proxy } from 'testcafe-hammerhead';
import ClientScriptInit from './client-script-init';

interface Test {
    clientScripts: ClientScriptInit[];
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

        test.clientScripts.forEach((script: ClientScriptInit) => {
            const route = getCustomClientScriptUrl(script as ClientScript);

            proxy.GET(route, {
                content:     getCustomClientScriptCode(script as ClientScript),
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
