import remoteChrome from 'chrome-remote-interface';
import { ExternalCookies } from 'testcafe-hammerhead';
import Protocol from 'devtools-protocol';
import Cookie = Protocol.Network.Cookie;
import { URL } from 'url';
import { isMatch } from 'lodash';
import { CookieOptions } from '../test-run/commands/options';
import { CookieProvider, CookieProviderBase } from '../test-run/cookies/base';

declare type CookieSameSite = 'Lax' | 'Strict' | 'None';

const MAX_TIMESTAMP = 8640000000000000;

export class CdpCookieProvider extends CookieProviderBase implements CookieProvider {
    async getCdpClient (): Promise<remoteChrome.ProtocolApi> {
        const browserConnection = this.testRun.browserConnection;
        const browser           = browserConnection.provider.plugin.openedBrowsers[browserConnection.id];

        return browser.browserClient.getActiveClient();
    }

    filterCookies (cookies: Cookie[], cookieFilters: ExternalCookies[]): Cookie[] {
        if (!cookieFilters.length)
            return cookies;

        const result = [];

        for (const cookie of cookies) {
            for (const cookieFilter of cookieFilters) {
                if (isMatch(cookie, cookieFilter))
                    result.push(cookie);
            }
        }

        return result;
    }

    async initialize (): Promise<void> {
        return this.deleteCookies();
    }

    async getCookies (externalCookies: ExternalCookies[]): Promise<ExternalCookies[]> {
        const client      = await this.getCdpClient();
        const { cookies } = await client.Storage.getCookies({});

        return this.filterCookies(cookies, externalCookies).map(cookie => {
            const result: unknown = {
                name:     cookie.name,
                value:    cookie.value,
                domain:   cookie.domain,
                maxAge:   void 0,
                path:     cookie.path,
                expires:  void 0,
                secure:   cookie.secure,
                httpOnly: cookie.httpOnly,
                sameSite: cookie.sameSite ?? 'none',
            };

            return result as ExternalCookies;
        });
    }

    async setCookies (cookies: CookieOptions[], url: string): Promise<void> {
        const client = await this.getCdpClient();
        const { hostname = '', pathname = '/' } = url ? new URL(url) : {};

        await client.Network.setCookies({
            cookies: cookies.map(cookie => {
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
            }),
        });
    }

    async deleteCookies (cookies: CookieOptions[] = [], urls: string[] = []): Promise<void> {
        const client = await this.getCdpClient();

        if (!cookies || !cookies.length)
            return client.Network.clearBrowserCookies();

        const parsedUrls = urls.map(url => {
            const { hostname, pathname } = new URL(url);

            return { domain: hostname, path: pathname };
        });

        let existingCookies = await this.getCookies([]);

        if (parsedUrls.length) {
            existingCookies = existingCookies.filter(cookie => parsedUrls
                .find(url => url.domain === cookie.domain && url.path === cookie.path));
        }

        for (const existingCookie of existingCookies) {
            for (const cookieFilter of cookies) {
                if (isMatch(existingCookie, cookieFilter)) {
                    await client.Network.deleteCookies({
                        name:   existingCookie.name,
                        domain: existingCookie.domain,
                        path:   existingCookie.path,
                    });
                }
            }
        }

        return void 0;
    }
}
