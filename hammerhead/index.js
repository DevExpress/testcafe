var Proxy = require('./lib/proxy'),
    ERR = require('./lib/server_errs'),
    jsProcessor = require('./shared/js_processor'),
    CLIENT_ERR = require('./shared/client_errs'),
    injector = require('./lib/injector'),
    CookieShelf = require('./lib/cookie_shelf');

var Hammerhead = module.exports.Hammerhead = function (port, crossDomainPort, hostname, options) {
    var staticResources = options ? options.staticResources : {},
        cookieShelf = new CookieShelf();

    this.proxy = new Proxy(cookieShelf, port, crossDomainPort, hostname, staticResources);
    this.crossDomainProxy = new Proxy(cookieShelf, crossDomainPort, port, hostname, staticResources);

    this.injectInPage = function(ctx, body, encoding, charset, callback) {
        var injectionOptions = this.proxy.server.getInjectOptions(ctx);

        injector.injectInPage(body, encoding, charset, injectionOptions, callback);
    };

    // ----- Temporary hammerhead API -----------
    this.staticScripts = this.proxy.staticScripts;

    this.serviceEvents = this.proxy.serviceEvents;
    this.proxyEvents = this.proxy.proxyEvents;

    this.crossDomainServiceEvents = this.crossDomainProxy.serviceEvents;
    this.crossDomainProxyEvents = this.crossDomainProxy.proxyEvents;
    // ------------------------------------------

    this.SERVER_ERRS = ERR;
};

// ----- Temporary hammerhead API -----------
exports.SERVER_ERRS = ERR;
exports.CLIENT_ERRS = CLIENT_ERR;

Hammerhead.prototype.start = function () {
    this.proxy.start();
    this.crossDomainProxy.start();
};

Hammerhead.prototype.close = function () {
    this.proxy.close();
    this.crossDomainProxy.close();
};

Hammerhead.prototype.getProxyUrl = function() {
    return this.proxy.getProxyUrl.apply(this.proxy, arguments);
};

Hammerhead.prototype.getOriginUrl = function(proxyUrl) {
    return this.proxy.server.getOriginUrl(proxyUrl);
};

Hammerhead.prototype.removeCookies = function() {
    return this.proxy.removeCookies.apply(this.proxy, arguments);
};

Hammerhead.prototype.getProxyPage = function() {
    return this.proxy.getProxyPage.apply(this.proxy, arguments);
};

exports.wrapDomAccessors = function (code, beautify) {
    return jsProcessor.process(code, beautify);
};
// ------------------------------------------

