var http     = require('http'),
    url      = require('url'),
    ERR      = require('./server_errs'),
    Events   = require('./events'),
    formData = require('./form_data'),
    injector = require('./injector'),
    urlUtil  = require('./url_util');

var PipelineContext       = require('./pipeline-context');
var DestinationRequest    = require('./destination-request');
var headerTransforms      = require('./header-transforms');
var checkSameOriginPolicy = require('./same-origin-policy').check;
var fetchBody             = require('./http-utils').fetchBody;


//Ctor
//--------------------------------------------------------------------------------------------------------------
var Server = module.exports = function (port, crossDomainProxyPort, hostname, cookieShelf, serviceChannel) {
    this.port                 = port;
    this.crossDomainProxyPort = crossDomainProxyPort;
    this.hostname             = hostname;
    this.events               = new Events();
    this.cookieShelf          = cookieShelf;
    this.serviceChannel       = serviceChannel;

    var server = this;

    this.server = http.createServer(function (req, res) {
        //NOTE: skip browsers favicon requests which we can't process
        if (req.url === '/favicon.ico') {
            res.statusCode = 404;
            res.end();
            return;
        }

        var ctx = new PipelineContext(req, res);

        server._onProxyRequest(ctx);
    });

    this.server.on('error', function (err) {
        if (err.code === 'EADDRINUSE') {
            server.events.broadcast.emit('fatalError', {
                code: ERR.PROXY_PORT_IS_ALREADY_IN_USE,
                port: server.port
            });
        }
    });
};

//Start/close
//--------------------------------------------------------------------------------------------------------------
Server.prototype.start = function () {
    this.server.listen(this.port);
};

Server.prototype.close = function () {
    this.server.close();
};

//Proxy URL
//--------------------------------------------------------------------------------------------------------------
Server.prototype.getProxyUrl = function (originUrl, jobUid, jobOwnerToken, resourceType) {
    return urlUtil.getProxyUrl(originUrl, this.hostname, this.port, jobUid, jobOwnerToken, resourceType);
};

Server.prototype.getInjectOptions = function (ctx) {
    var injectionOptions = {
        crossDomainProxyPort: this.crossDomainProxyPort,
        isIFrame:             ctx.contentInfo.isIFrame,
        styleUrl:             this.serviceChannel.staticCssUrl,
        scripts:              [],
        urlReplacer:          this.getResourceUrlReplacer(ctx)
    };

    injectionOptions.scripts.push(this.serviceChannel.hammerheadScriptUrl);

    var isIframeWithImageSrc = ctx.contentInfo && ctx.contentInfo.isIFrame && !ctx.contentInfo.isPage;

    if (isIframeWithImageSrc)
        injectionOptions.iframeImageSrc = ctx.dest.url;

    for (var i = 0; i < this.serviceChannel.staticScripts.length; i++) {
        var script = this.serviceChannel.staticScripts[i];

        if (!script.requiredJobOwnerToken || script.requiredJobOwnerToken === ctx.jobInfo.ownerToken)
            injectionOptions.scripts.push(script.url);
    }

    var scriptUrl = ctx.contentInfo && ctx.contentInfo.isIFrame ?
                    this.serviceChannel.iframeTaskScriptUrl :
                    this.serviceChannel.taskScriptUrl;

    injectionOptions.scripts.push(scriptUrl);

    return injectionOptions;
};

Server.prototype.injectInPage = function (ctx, callback) {
    var injectionOptions = this.getInjectOptions(ctx),
        body             = ctx.destResBody,
        encoding         = ctx.contentInfo.encoding,
        charset          = ctx.contentInfo.charset;

    injector.injectInPage(body, encoding, charset, injectionOptions, callback);
};

Server.prototype.getResourceUrlReplacer = function (ctx) {
    var server = this;

    return function (resourceUrl, resourceType, baseUrl) {
        // NOTE: resolve base url without a protocol ('//google.com/path' for example)
        baseUrl     = baseUrl ? url.resolve(ctx.dest.url, baseUrl) : '';
        resourceUrl = urlUtil.prepareUrl(resourceUrl);

        var resolvedUrl = url.resolve(baseUrl || ctx.dest.url, resourceUrl);

        try {
            return server.getProxyUrl(resolvedUrl, ctx.jobInfo.uid, ctx.jobInfo.ownerToken, resourceType);
        } catch (err) {
            return resourceUrl;
        }
    };
};


//Error handling
//--------------------------------------------------------------------------------------------------------------
Server.prototype._error = function (ctx, err) {
    var eventsInCtx = this.events.in(ctx);

    if (eventsInCtx.canHandle('error'))
        eventsInCtx.emit('error', err);
    else {
        //NOTE: just finish request if we are missing any job identity
        ctx.closeWithError(500);
    }
};

//Proxy request
//--------------------------------------------------------------------------------------------------------------
Server.prototype._onProxyRequest = function (ctx) {
    var server = this;

    fetchBody(ctx.req).then(function (body) {
        ctx.reqBody = body;

        if (ctx.isServiceRequest)
            server.serviceChannel.process(ctx);

        else {
            if (!ctx.dest) {
                ctx.closeWithError(404);
                return;
            }
            server._sendOriginRequest(ctx);
        }

    });
};


//Origin request
//--------------------------------------------------------------------------------------------------------------
Server.prototype._getReqOpts = function (ctx) {
    var cred = null;

    this.events.in(ctx).emit('authCredentialsRequested', function (credentials) {
        cred = credentials;
    });

    var processedBody = formData.processFormData(ctx.req.headers['content-type'], ctx.reqBody);

    if (processedBody)
        ctx.reqBody = processedBody;

    return {
        url:         ctx.dest.url,
        protocol:    ctx.dest.protocol,
        hostname:    ctx.dest.hostname,
        host:        ctx.dest.host,
        port:        ctx.dest.port,
        path:        ctx.dest.partAfterHost,
        method:      ctx.req.method,
        headers:     headerTransforms.forRequest(ctx, this),
        credentials: cred,
        body:        ctx.reqBody
    };
};

Server.prototype._sendOriginRequest = function (ctx) {
    var server = this;
    var req    = new DestinationRequest(this._getReqOpts(ctx));

    req.on('response', function (res) {
        ctx.destRes = res;
        server._onOriginResponse(ctx);
    });

    req.on('fatalError', function (err) {
        server._error(ctx, err);
    });

    req.on('error', function () {
        ctx.hasDestReqErr = true;
    });
};


//Origin response
//--------------------------------------------------------------------------------------------------------------
Server.prototype._onOriginResponse = function (ctx) {
    ctx.buildContentInfo();

    if (ctx.isXhr && !checkSameOriginPolicy(ctx)) {
        this._error(ctx, {
            code:      ERR.PROXY_XHR_REQUEST_SAME_ORIGIN_POLICY_VIOLATION,
            reqOrigin: ctx.dest.reqOrigin,
            xhrReqUrl: ctx.dest.url
        });

        ctx.closeWithError(0);
        return;
    }

    var server = this;

    var eventsInCtx = server.events.in(ctx);

    if (eventsInCtx.canHandle('originResponse')) {
        eventsInCtx.emit('originResponse', function () {
            server._processOriginResponse(ctx);
        });
    }
    else
        server._processOriginResponse(ctx);
};


Server.prototype._processOriginResponse = function (ctx) {
    var server      = this,
        contentInfo = ctx.contentInfo;

    if (contentInfo.requireProcessing) {
        fetchBody(ctx.destRes).then(function (body) {
            ctx.destResBody = body;
            server._prepareProcessedProxyResponse(ctx);
        });
    }

    else {
        server._sendProxyResponseHeaders(ctx, false);
        //NOTE: just pipe body to browser if we don't need to process content body
        ctx.destRes.pipe(ctx.res);
    }
};


//Proxy response headers
//--------------------------------------------------------------------------------------------------------------
Server.prototype._sendProxyResponseHeaders = function (ctx) {
    var headers = headerTransforms.forResponse(ctx, this);

    ctx.res.writeHead(ctx.destRes.statusCode, headers);
    // T239167
    // The request with un-encoded cyrillic symbols in the 'location' header may come from the original site.
    // Node.js sends incorrectly these headers to response, converting cyrillic into the strange symbols.
    // http://localhost:777/?text=что-то%20русское   ===>   http://localhost:777/?text=GB>-B>%20@CAA:>5
    // Adding res._send(''); forces headers to be flushed with correct encoding.
    // https://github.com/joyent/node/issues/25293
    // https://github.com/iojs/io.js/issues/1693
    ctx.res._send('');

    ctx.res.addTrailers(ctx.destRes.trailers);
};


//Content processing
//--------------------------------------------------------------------------------------------------------------
Server.prototype._hasOriginReqError = function (ctx) {
    if (!ctx.hasDestReqErr)
        return false;

    var contentLength = ctx.destRes.headers['content-length'];

    //NOTE: sometimes underlying socket emit error event. But if we have headers and full response body we still
    //can process such requests. (See: B234324)
    return (!ctx.destRes ||
            Object.keys(ctx.destRes.headers).length === 0 ||
            (typeof contentLength !== 'undefined' && contentLength !== ctx.destResBody.length));
};

Server.prototype._processResourceContent = function (ctx, callback) {
    var urlReplacer   = this.getResourceUrlReplacer(ctx),
        contentInfo   = ctx.contentInfo,
        processAsPage = contentInfo.isPage || contentInfo.isIFrameWithImageSrc;

    if (ctx.destRes.statusCode !== 200 && (!processAsPage || !ctx.destResBody.length)) {
        callback();

        return;
    }

    if (processAsPage) {
        var eventsInCtx = this.events.in(ctx);

        this.injectInPage(ctx, function (err, html) {
            if (!err)
                ctx.destResBody = html;

            else if (eventsInCtx.canHandle('injectionError')) {
                eventsInCtx.emit('injectionError', err);

                return;
            }

            callback();
        });
    }

    else if (contentInfo.isCSS) {
        injector.injectInStylesheet(ctx.destResBody, contentInfo.encoding, contentInfo.charset, urlReplacer,
            function (err, processedStylesheet) {
                if (!err)
                    ctx.destResBody = processedStylesheet;

                callback();
            });
    }

    else if (contentInfo.isScript && !ctx.isXhr) {
        injector.injectInScript(ctx.destResBody, contentInfo.encoding, contentInfo.charset,
            function (err, processedScript) {
                if (!err)
                    ctx.destResBody = processedScript;

                callback();
            });
    }

    else if (contentInfo.isManifest) {
        injector.injectInManifest(ctx.destResBody, contentInfo.encoding, contentInfo.charset, urlReplacer,
            function (err, processedManifest) {
                if (!err)
                    ctx.destResBody = processedManifest;

                callback();
            });
    }

    else if (contentInfo.isJSON) {
        injector.injectInJSON(ctx.destResBody, contentInfo.encoding, contentInfo.charset,
            function (err, processedJSON) {
                if (!err)
                    ctx.destResBody = processedJSON;

                callback();
            });
    }

    else
        callback();

};

Server.prototype._prepareProcessedProxyResponse = function (ctx) {
    if (this._hasOriginReqError(ctx)) {
        this._error(ctx, {
            code:    ERR.PROXY_ORIGIN_SERVER_CONNECTION_TERMINATED,
            destUrl: ctx.dest.url
        });
        return;
    }

    var server = this;

    server._processResourceContent(ctx, function () {
        server._sendProxyResponseHeaders(ctx, true);
        server._sendProcessedProxyResponseBody(ctx);
    });
};

Server.prototype._sendProcessedProxyResponseBody = function (ctx) {
    //NOTE: IE may close connection while it's processed by proxy, e.g. on navigation to worker idle then previous
    //page resource request is not accomplished. Socket emits 'close' event, but we can't add a listener for each
    //proxy ctx due to memory leaks issues. So we just use dull 'try catch' to handle write error.

    try {
        ctx.res.write(ctx.destResBody);
        ctx.res.end();
    } catch (err) {
    }
};


//For Health Monitor
//--------------------------------------------------------------------------------------------------------------
Server.prototype.getOriginUrl = function (proxyUrl) {
    return urlUtil.formatUrl(urlUtil.parseProxyUrl(proxyUrl).originResourceInfo);
};
