var ServiceChannel = require('./service_channel'),
    Server = require('./server'),
    util = require('util');

var renderTaskScript = require('./task-script').render;

var Proxy = module.exports = function (cookieShelf, port, crossDomainProxyPort, hostname, staticResources) {
    this.crossDomainProxyPort = crossDomainProxyPort;

    this.cookieShelf = cookieShelf;
    this.serviceChannel = new ServiceChannel(port, crossDomainProxyPort, hostname, cookieShelf, staticResources);

    this.server = new Server(port, crossDomainProxyPort, hostname, this.cookieShelf, this.serviceChannel);

    this.staticScripts = this.serviceChannel.staticScripts;

    this.serviceEvents = this.serviceChannel.events;
    this.proxyEvents = this.server.events;
};

//Const
var STATIC_SCRIPT_TEMPLATE = '<script type="text/javascript" src="%s"></script> ',

    PROXY_PAGE_HTML_TEMPLATE_BEGIN = '<!DOCTYPE html>' +
                                     '<html>' +
                                     '<head>' +
                                     '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' +
                                     '<title></title>' +
                                     '<link href="%s" rel="stylesheet" type="text/css">' +
                                     STATIC_SCRIPT_TEMPLATE,

    PROXY_PAGE_HTML_TEMPLATE_END = '<script type="text/javascript">%s</script> ' +
                                   '</head>' +
                                   '<body></body>' +
                                   '</html>';

Proxy.prototype.getProxyPage = function (ctx, taskScript) {
    var html = [];

    html.push(util.format(PROXY_PAGE_HTML_TEMPLATE_BEGIN, this.serviceChannel.staticCssUrl, this.serviceChannel.hammerheadScriptUrl));

    for (var i = 0; i < this.serviceChannel.staticScripts.length; i++) {
        var script = this.serviceChannel.staticScripts[i];

        if (!script.requiredJobOwnerToken || script.requiredJobOwnerToken === ctx.jobInfo.ownerToken)
            html.push(util.format(STATIC_SCRIPT_TEMPLATE, script.url));
    }

    var renderedScript = this.getTaskScript(ctx, taskScript);

    html.push(util.format(PROXY_PAGE_HTML_TEMPLATE_END, renderedScript));

    return html.join('');
};

Proxy.prototype.start = function () {
    this.server.start();
};

Proxy.prototype.close = function () {
    this.server.close();
};

Proxy.prototype.getProxyUrl = function () {
    return this.server.getProxyUrl.apply(this.server, arguments);
};

Proxy.prototype.removeCookies = function () {
    return this.cookieShelf.removeCookies.apply(this.cookieShelf, arguments);
};

Proxy.prototype.getTaskScript = function (ctx, task) {
    var serviceChannel = this.serviceChannel,
        proxy = this,
        options = {
            jobUid: ctx.jobInfo.uid,
            jobOwnerToken: ctx.jobInfo.ownerToken,
            serviceMsgUrl: serviceChannel.serviceMsgUrl,
            originHost: ctx.dest.host,
            originProtocol: ctx.dest.protocol,
            originHostname: ctx.dest.hostname,
            originPort: ctx.dest.port,
            crossDomainProxyPort: proxy.crossDomainProxyPort,
            taskScript: task,
            cookie: ''
        };

    return renderTaskScript(options);
};