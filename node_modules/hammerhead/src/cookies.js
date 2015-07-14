import { CookieJar } from 'tough-cookie';

export default class Cookies {
    constructor () {
        this.cookieJar = new CookieJar();
    }

    _set (url, cookies, isClient) {
        cookies = Array.isArray(cookies) ? cookies : [cookies];

        cookies.forEach((cookieStr) => {
            this.cookieJar.setCookieSync(cookieStr, url, {
                http:        !isClient,
                ignoreError: true
            });
        });
    }

    setByServer (url, cookies) {
        this._set(url, cookies, false);
    }

    setByClient (url, cookies) {
        this._set(url, cookies, true);
    }

    getClientString (url) {
        return this.cookieJar.getCookieStringSync(url, { http: false });
    }

    getHeader (url) {
        return this.cookieJar.getCookieStringSync(url, { http: true }) || null;
    }
}