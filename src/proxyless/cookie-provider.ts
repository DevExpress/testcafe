import remoteChrome from 'chrome-remote-interface';
import { ExternalCookies } from 'testcafe-hammerhead';
import Protocol from 'devtools-protocol';
import Cookie = Protocol.Network.Cookie;
import { URL } from 'url';
import { CookieOptions } from '../test-run/commands/options';
import { CookieProvider, CookieProviderBase } from '../test-run/cookies/base';
import CookieParam = Protocol.Network.CookieParam;
import matchCollection from '../utils/match-collection';

declare type CookieSameSite = 'Lax' | 'Strict' | 'None';

const MAX_TIMESTAMP = 8640000000000000;

export class CdpCookieProvider extends CookieProviderBase implements CookieProvider {
    private async _getCdpClient (): Promise<remoteChrome.ProtocolApi> {
        const browserConnection = this.testRun.browserConnection;
        const browser           = browserConnection.provider.plugin.openedBrowsers[browserConnection.id];

        return browser.browserClient.getActiveClient();
    }

    async initialize (): Promise<void> {
        return this.deleteCookies();
    }

    async getCookies (externalCookies: ExternalCookies[]): Promise<ExternalCookies[]> {
        const client      = await this._getCdpClient();
        const { cookies } = await client.Storage.getCookies({});

        return (matchCollection(cookies, externalCookies) as Cookie[]).map(this._cdpCookieToExternalCookie);
    }

    async setCookies (cookies: CookieOptions[], url: string): Promise<void> {
        const client = await this._getCdpClient();
        const { hostname = '', pathname = '/' } = url ? new URL(url) : {};

        await client.Network.setCookies({
            cookies: cookies.map(cookie => this._cookieOptionToCdpCookieParam(cookie, hostname, pathname)),
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
                name:   cookie.name,
                domain: cookie.domain,
                path:   cookie.path,
            });
        }

        return void 0;
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
}
