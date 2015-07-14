'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check').default;

exports.__esModule = true;

var _toughCookie = require('tough-cookie');

var Cookies = (function () {
    function Cookies() {
        _classCallCheck(this, Cookies);

        this.cookieJar = new _toughCookie.CookieJar();
    }

    Cookies.prototype._set = function _set(url, cookies, isClient) {
        var _this = this;

        cookies = Array.isArray(cookies) ? cookies : [cookies];

        cookies.forEach(function (cookieStr) {
            _this.cookieJar.setCookieSync(cookieStr, url, {
                http: !isClient,
                ignoreError: true
            });
        });
    };

    Cookies.prototype.setByServer = function setByServer(url, cookies) {
        this._set(url, cookies, false);
    };

    Cookies.prototype.setByClient = function setByClient(url, cookies) {
        this._set(url, cookies, true);
    };

    Cookies.prototype.getClientString = function getClientString(url) {
        return this.cookieJar.getCookieStringSync(url, { http: false });
    };

    Cookies.prototype.getHeader = function getHeader(url) {
        return this.cookieJar.getCookieStringSync(url, { http: true }) || null;
    };

    return Cookies;
})();

exports.default = Cookies;
module.exports = exports.default;
//# sourceMappingURL=cookies.js.map