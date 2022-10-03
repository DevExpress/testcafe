import TestRun from '../';
import { CdpCookieProvider } from '../../proxyless/cookie-provider';
import { CookieProvider } from './base';
import { ProxyCookieProvider } from './provider';

export class CookieProviderFactory {
    public static create (testRun: TestRun, isProxyless: boolean): CookieProvider {
        return isProxyless ? new CdpCookieProvider(testRun) : new ProxyCookieProvider(testRun);
    }
}
