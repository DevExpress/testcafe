import remoteChrome from 'chrome-remote-interface';
import { ExternalCookies } from 'testcafe-hammerhead';
import Protocol from 'devtools-protocol';
import Cookie = Protocol.Network.Cookie;
import { URL } from 'url';
import { CookieOptions } from '../test-run/commands/options';
import { CookieProvider, CookieProviderBase } from '../test-run/cookies/base';
import CookieParam = Protocol.Network.CookieParam;
import matchCollection from '../utils/match-collection';
import { getActiveClient } from './utils/get-active-client';
import { parse } from 'set-cookie-parser';
import { castArray } from 'lodash';

declare type CookieSameSite = 'Lax' | 'Strict' | 'None';

const MAX_TIMESTAMP = 8640000000000000;

export class CdpCookieProvider extends CookieProviderBase implements CookieProvider {
    private async _getCdpClient (): Promise<remoteChrome.ProtocolApi> {
        const browserConnection = this.testRun.browserConnection;

        return getActiveClient(browserConnection);
    }

    async initialize (): Promise<void> {
        return this.deleteCookies();
    }

    async getCookies (externalCookies: ExternalCookies[]): Promise<ExternalCookies[]> {
        const client      = await this._getCdpClient();
        const { cookies } = await client.Storage.getCookies({});

        return (matchCollection(cookies, externalCookies) as Cookie[]).map(this._cdpCookieToExternalCookie);
    }

    async setCookies (cookies: string | string[] | CookieOptions[], url: string): Promise<void> {
        const client                            = await this._getCdpClient();
        const { hostname = '', pathname = '/' } = url ? new URL(url) : {};
        const cookiesArray                      = castArray<string | CookieOptions>(cookies);

        const parsedCookies = this._isCookieOptionsArray(cookiesArray)
            ? cookiesArray
            : this._parseSetCookieStrings(cookiesArray as string[]);

        await client.Network.setCookies({
            cookies: parsedCookies.map(cookie => this._cookieOptionToCdpCookieParam(cookie, hostname, pathname)),
        });
    }

    async deleteCookies (cookies: CookieOptions[] = [], urls: string[] = []): Promise<void> {
        const client = await this._getCdpClient();

        if (!cookies || !cookies.length)
            return client.Network.clearBrowserCookies();

        const parsedUrls    = this._parseUrls(urls);
        let existingCookies = await this.getCookies([]);

        if (parsedUrls.length) {
            existingCookies = existingCookies.filter(cookie => parsedUrls
                .find(url => url.domain === cookie.domain && url.path === cookie.path));
        }

        existingCookies = matchCollection(existingCookies, cookies) as ExternalCookies[];

        for (const cookie of existingCookies) {
            await client.Network.deleteCookies({
                name:   cookie.name || '',
                domain: cookie.domain,
                path:   cookie.path,
            });
        }

        return void 0;
    }

    async getCookieHeader (url: string): Promise<string | null> {
        const [{ domain, path }] = this._parseUrls([url]);
        const cookies            = await this.getCookies([{ domain }]);
        const filteredCookies    = cookies.filter(c => this._includesPath(c.path || '/', path));

        return filteredCookies.map(c => `${ c.name }=${ c.value }`).join(';');
    }

    private _cdpCookieToExternalCookie (cookie: Cookie): ExternalCookies {
        return {
            name:     cookie.name,
            value:    cookie.value,
            domain:   cookie.domain,
            maxAge:   void 0,
            path:     cookie.path,
            expires:  void 0,
            secure:   cookie.secure,
            httpOnly: cookie.httpOnly,
            sameSite: cookie.sameSite ?? 'none',
        } as unknown as ExternalCookies;
    }

    private _cookieOptionToCdpCookieParam (cookie: CookieOptions, hostname: string, pathname: string): CookieParam {
        return {
            name:     cookie.name,
            value:    cookie.value,
            domain:   cookie.domain ?? hostname,
            path:     cookie.path ?? pathname,
            secure:   cookie.secure,
            httpOnly: false,
            sameSite: cookie.sameSite as CookieSameSite,
            expires:  cookie.expires?.getTime() || MAX_TIMESTAMP,
        };
    }

    private _parseUrls (urls: string[]): { domain: string, path: string }[] {
        return urls.map(url => {
            const { hostname, pathname } = new URL(url);

            return { domain: hostname, path: pathname };
        });
    }

    private _includesPath (cookiePath: string, urlPath: string): boolean {
        if (cookiePath === '/')
            return true;

        const cookieParts = cookiePath.split('/');
        const urlParts    = urlPath.split('/');

        if (cookieParts.length > urlParts.length)
            return false;

        while (cookieParts.length) {
            if (cookieParts.shift() !== urlParts.shift())
                return false;
        }

        return true;
    }

    private _parseSetCookieStrings (cookies: string[]): CookieOptions[] {
        return parse(cookies) as CookieOptions[];
    }
}
