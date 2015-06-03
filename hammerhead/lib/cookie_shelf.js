var util = require('util'),
    CookieJar = require('tough-cookie').CookieJar;

//Utils
function getJarUid(jobInfo) {
    return jobInfo.ownerToken + jobInfo.uid;
}

//NOTE: The CookieShelf is a part of the proxy cookies management mechanism, which also includes a
//cookie proxy (see: src/client_runtime/shared/dom_sandbox.js) and HTTP-headers management code in the http proxy (see: ./proxy.js).
//The main idea behind this mechanism is that all test runs/records are run in an absolutely blank
//environment (like each test run/record started in a new tab in the browser 'incognito'-mode). For this purpose we
//store all cookies provided by the server and client in the CookieShelf instead of the browser cookie jar.
//Here is the scheme of all 4 cases of the cookies management:
//1)Client set cookie via document.cookie --> cookie proxy setter --> serviceMsg SET_COOKIE to proxy -->
//  --> CookieShelf.setCookieByClient
//2)Client get cookie via document.cookie --> cookie proxy getter --> serviceMsg GET_COOKIE to proxy -->
//  --> CookieShelf.getCookieByClient --> write result to serviceMsg response and then use it as getter return value
//3)Server set cookie via Set-Cookie header --> proxy intercepts header --> CookieShelf.setCookieByServer -->
//  --> proxy deletes header from it's response --> nothing goes to client
//4)Client request to server --> proxy extracts origin url --> CookieShelf.getCookieHeader --> Cookie header sent

var CookieShelf = module.exports = function () {
    this.jars = {};
};

//Proto
CookieShelf.prototype._getJar = function (jobInfo, createIfNotExist) {
    var jarUid = getJarUid(jobInfo),
        jar = this.jars[jarUid];

    if (!jar && createIfNotExist)
        jar = this.jars[jarUid] = new CookieJar();

    return jar;
};

CookieShelf.prototype._setCookie = function (jobInfo, resourceUrl, cookie, client) {
    var jar = this._getJar(jobInfo, true);

    cookie = util.isArray(cookie) ? cookie : [cookie];

    cookie.forEach(function (cookieEntry) {
        jar.setCookieSync(cookieEntry, resourceUrl, {
            http: !client,
            ignoreError: true
        });
    });
};

CookieShelf.prototype._getCookieString = function (jobInfo, resourceUrl, client) {
    var jar = this._getJar(jobInfo);

    return jar ? jar.getCookieStringSync(resourceUrl, {http: !client}) : null;
};

CookieShelf.prototype.setCookieByServer = function (jobInfo, resourceUrl, cookie) {
    this._setCookie(jobInfo, resourceUrl, cookie, false);
};

CookieShelf.prototype.setCookieByClient = function (jobInfo, resourceUrl, cookie) {
    this._setCookie(jobInfo, resourceUrl, cookie, true);
};

CookieShelf.prototype.getClientCookieString = function (jobInfo, resourceUrl) {
    return this._getCookieString(jobInfo, resourceUrl, true) || '';
};

CookieShelf.prototype.getCookieHeader = function (jobInfo, resourceUrl) {
    return this._getCookieString(jobInfo, resourceUrl, false) || null;
};

CookieShelf.prototype.removeCookies = function (jobInfo) {
    var jarUid = getJarUid(jobInfo);

    delete this.jars[jarUid];
};