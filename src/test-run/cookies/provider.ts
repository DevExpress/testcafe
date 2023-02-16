import { ExternalCookies } from 'testcafe-hammerhead';
import { CookieOptions } from '../commands/options';
import { CookieProvider, CookieProviderBase } from './base';
import { castArray } from 'lodash';

export class ProxyCookieProvider extends CookieProviderBase implements CookieProvider {
    async getCookies (externalCookies: ExternalCookies[], urls: string[]): Promise<ExternalCookies[]> {
        const session = this.testRun.session;

        return session.cookies.getCookies(externalCookies, urls);
    }

    async setCookies (cookies: string | string[] | CookieOptions[], url: string): Promise<void> {
        const cookiesArray = castArray<string | CookieOptions>(cookies);
        const session      = this.testRun.session;

        if (this._isCookieOptionsArray(cookiesArray))
            return session.cookies.setCookies(cookiesArray, url);

        return session.cookies.copySyncCookies(cookiesArray.join(';'), url);
    }

    async deleteCookies (cookies: CookieOptions[], urls: string[]): Promise<void> {
        const session = this.testRun.session;

        return session.cookies.deleteCookies(cookies, urls);
    }

    async getCookieHeader (url: string, hostname: string): Promise<string | null> {
        return this.testRun.session.cookies.getHeader({ url, hostname });
    }
}
