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

interface RegisterClientScriptsInfo {
    proxy: Proxy;
    test: Test;
    nativeAutomation: boolean;
    folderName: string;
}

export function isLegacyTest (test: TestItem): test is LegacyTest {
    return !!(test as LegacyTest).isLegacy;
}

export function register ({ proxy, test, nativeAutomation, folderName }: RegisterClientScriptsInfo): string[] {
    const routes: string[] = [];

    if (isLegacyTest(test))
        return routes;

    test.clientScripts.forEach((script: ClientScriptInit) => {
        const route = (script as ClientScript).getResultUrl(folderName);

        proxy.GET(route, {
            content:     getCustomClientScriptCode(script as ClientScript, nativeAutomation),
            contentType: CONTENT_TYPES.javascript,
        });

        routes.push(route);
    });

    return routes;
}

export function unRegister (proxy: Proxy, routes: string[]): void {
    routes.forEach(route => {
        proxy.unRegisterRoute(route, 'GET');
    });
}
