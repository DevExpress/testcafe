import TestRun from '../';
import { CdpCookieProvider } from '../../native-automation/cookie-provider';
import { CookieProvider } from './base';
import { ProxyCookieProvider } from './provider';

export class CookieProviderFactory {
    public static create (testRun: TestRun, isNativeAutomation: boolean): CookieProvider {
        return isNativeAutomation ? new CdpCookieProvider(testRun) : new ProxyCookieProvider(testRun);
    }
}
