import { ExternalCookies } from 'testcafe-hammerhead';
import { CookieOptions } from '../commands/options';
import { CookieProvider, CookieProviderBase } from './base';

export class ProxyCookieProvider extends CookieProviderBase implements CookieProvider {
    async getCookies (externalCookies: ExternalCookies[], urls: string[]): Promise<ExternalCookies[]> {
        const session = this.testRun.session;

        return session.cookies.getCookies(externalCookies, urls);
    }

    async setCookies (cookies: CookieOptions[], url: string): Promise<void> {
        const session = this.testRun.session;

        return session.cookies.setCookies(cookies, url);
    }

    async deleteCookies (cookies: CookieOptions[], urls: string[]): Promise<void> {
        const session = this.testRun.session;

        return session.cookies.deleteCookies(cookies, urls);
    }
}
