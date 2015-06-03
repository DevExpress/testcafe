HammerheadClient.define('DOMSandbox.Cookie', function (require, exports) {
    var $ = require('jQuery'),
        CookieUtil = require('CookieUtil'),
        ServiceCommands = require('Shared.ServiceCommands'),
        Settings = null,
        Transport = require('Transport'),
        UrlUtil = require('UrlUtil'),
        Util = require('Util');

    Settings = (window !== window.top && !Util.isCrossDomainWindows(window, window.top)) ?
               window.top.HammerheadClient.get('Settings') :
               require('Settings');

    exports.getCookie = function () {
        return Settings.COOKIE;
    };

    exports.setCookie = function (document, value) {
        //NOTE: let browser validate other stuff (e.g. Path attribute), so we add unique prefix
        //to the cookie key, pass cookie to the browser then clean up and return result.
        function getBrowserProcessedCookie(parsedCookie) {
            var parsedCookieCopy = {};

            for (var prop in parsedCookie) {
                if (parsedCookie.hasOwnProperty(prop))
                    parsedCookieCopy[prop] = parsedCookie[prop];
            }

            var uniquePrefix = Math.floor(Math.random() * 1e10) + '|';

            parsedCookieCopy.key = uniquePrefix + parsedCookieCopy.key;

            document.cookie = CookieUtil.format(parsedCookieCopy);

            var processedByBrowserCookieStr = CookieUtil.get(document, parsedCookieCopy.key);

            CookieUtil['delete'](document, parsedCookieCopy.key);

            if (processedByBrowserCookieStr)
                return processedByBrowserCookieStr.substr(uniquePrefix.length);

            return null;
        }

        //NOTE: perform validations which can't be processed by browser due to proxying
        function isValidCookie(parsedCookie) {
            if (!parsedCookie)
                return false;

            //NOTE: HttpOnly cookies can't be accessed from client code
            if (parsedCookie.httponly)
                return false;

            var originProtocol = UrlUtil.OriginLocation.getParsed().protocol;

            //NOTE: TestCafe tunnels HTTPS requests via HTTP so we should validate Secure attribute manually
            if (parsedCookie.secure && originProtocol !== 'https:')
                return false;

            //NOTE: add protocol portion to the domain, so we can use urlUtil for same origin check
            var domain = parsedCookie.domain && ('http://' + parsedCookie.domain);

            //NOTE: all TestCafe jobs has same domain, so we should validate Domain attribute manually
            //according to test url
            return !domain || UrlUtil.sameOriginCheck(document.location.toString(), domain);
        }

        function updateClientCookieStr(cookieKey, newCookieStr) {
            var cookies = Settings.COOKIE ? Settings.COOKIE.split(';') : [],
                replaced = false;

            //NOTE: replace cookie if it's already exists
            for (var i = 0; i < cookies.length; i++) {
                cookies[i] = $.trim(cookies[i]);

                if (cookies[i].indexOf(cookieKey + '=') === 0 || cookies[i] === cookieKey) {
                    //NOTE: delete or update cookie string
                    if (newCookieStr === null)
                        cookies.splice(i, 1);
                    else
                        cookies[i] = newCookieStr;

                    replaced = true;
                }
            }

            if (!replaced && newCookieStr !== null)
                cookies.push(newCookieStr);

            Settings.COOKIE = cookies.join('; ');
        }

        function setCookie(cookie) {
            var parsedCookie = CookieUtil.parse(cookie);

            if (isValidCookie(parsedCookie)) {
                //NOTE: this attributes shouldn't be processed by browser
                delete parsedCookie.secure;
                delete parsedCookie.domain;

                var clientCookieStr = getBrowserProcessedCookie(parsedCookie);

                if (!clientCookieStr) {
                    //NOTE: we have two options here:
                    //1)cookie was invalid, so it was ignored
                    //2)cookie was deleted by setting Expired attribute
                    //We need to check the second option and delete cookie in our cookie string manually
                    delete parsedCookie.expires;

                    //NOTE: we should delete cookie
                    if (getBrowserProcessedCookie(parsedCookie))
                        updateClientCookieStr(parsedCookie.key, null);

                } else
                    updateClientCookieStr(parsedCookie.key, clientCookieStr);
            }
        }

        //NOTE: at first try to update our client cookie cache with client-validated cookie string,
        //so sync code can immediately access cookie
        setCookie(value);

        var setCookieMsg = {
            cmd: ServiceCommands.SET_COOKIE,
            cookie: value,
            url: document.location.href
        };

        //NOTE: meanwhile sync cookies with server cookie jar
        Transport.queuedAsyncServiceMsg(setCookieMsg);

        return value;
    };
});
