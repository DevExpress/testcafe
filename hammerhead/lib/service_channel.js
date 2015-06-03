var fs       = require('fs'),
    path     = require('path'),
    cmd      = require('./../shared/service_msg_cmd'),
    Events   = require('./events'),
    formData = require('./form_data'),
    urlUtil  = require('./url_util');

var renderTaskScript = require('./task-script').render;
var respondWithJSON  = require('./http-utils').respondWithJSON;

var CLIENT_SCRIPT_FILE_PATH               = path.join(__dirname, '../../_compiled_/hammerhead_client/hammerhead.js'),
    CLIENT_SCRIPT_PATHNAME                = '/hammerhead.js',
    SERVICE_MSGS_PATHNAME                 = '/messaging',
    IE9_FILE_READER_SHIM                  = '/ie9-file-reader-shim',
    TASK_SCRIPT_PATHNAME                  = '/task.js',
    IFRAME_TASK_SCRIPT_PATHNAME           = '/iframe_task.js',
    URL_PATH_PREFIX                       = '/!hammerhead!',
    CROSS_VERSION_CACHING_PREVENTION_HASH = '#' + Date.now(),
    CLIENT_SCRIPT                         = fs.readFileSync(CLIENT_SCRIPT_FILE_PATH).toString();

var ServiceChannel = module.exports = function (proxyPort, crossDomainProxyPort, proxyHostname, cookieShelf, staticResources) {
    this.events                    = new Events();
    this.crossDomainProxyPort      = crossDomainProxyPort;
    this.cookieShelf               = cookieShelf;
    this.port                      = proxyPort;
    this.hostname                  = proxyHostname;
    this.staticResourceDescriptors = {};
    this.serviceMsgUrl             = this._getServiceUrl(SERVICE_MSGS_PATHNAME);
    this.taskScriptUrl             = this._getServiceUrl(TASK_SCRIPT_PATHNAME);
    this.iframeTaskScriptUrl       = this._getServiceUrl(IFRAME_TASK_SCRIPT_PATHNAME);
    this.ie9FileReaderShimUrl      = this._getServiceUrl(IE9_FILE_READER_SHIM);

    this.staticCssUrl        = null;
    this.staticScripts       = [];
    this.hammerheadScriptUrl = null;


    this._registerStaticResources(staticResources);
};

//Proto
ServiceChannel.prototype._registerStaticResources = function (staticResources) {
    var i = 0;

    if (staticResources.scripts) {
        for (; i < staticResources.scripts.length; i++) {
            var script = staticResources.scripts[i];

            this.staticScripts.push({
                url:                   this.registerStaticResource(script.path, {
                    contentType: script.contentType || 'application/x-javascript',
                    content:     script.content
                }),
                requiredJobOwnerToken: script.requiredJobOwnerToken
            });
        }
    }

    if (staticResources.css) {
        this.staticCssUrl = this.registerStaticResource(staticResources.css.path, {
            contentType: staticResources.css.contentType || '/uistyle.css',
            content:     staticResources.css.content
        });
    }

    if (staticResources.others) {
        for (i = 0; i < staticResources.others.length; i++) {
            this.registerStaticResource(staticResources.others[i].path, {
                contentType: staticResources.others[i].contentType,
                content:     staticResources.others[i].content
            });
        }
    }

    this.hammerheadScriptUrl = this.registerStaticResource(CLIENT_SCRIPT_PATHNAME, {
        contentType: 'application/x-javascript',
        content:     CLIENT_SCRIPT
    });
};

//Url
ServiceChannel.prototype._getServiceUrl = function (resourcePathname) {
    return urlUtil.formatUrl({
        protocol: 'http:',
        hostname: this.hostname,
        port:     this.port,
        pathname: URL_PATH_PREFIX + resourcePathname
    });
};

ServiceChannel.prototype._processServiceMsg = function (ctx) {
    var msg = null;

    try {
        msg = JSON.parse(ctx.reqBody.toString());
    } catch (err) {
        //NOTE: we can't handle correctly such errors, so we just skip it
        ctx.res.statusCode = 500;
        ctx.res.end();

        return;
    }

    var sendServiceResponse = function (data) {
        if (!ctx.res.getHeader('content-type'))
            ctx.res.setHeader('Content-type', 'text/plain');

        if (data !== null && typeof data !== 'undefined')
            ctx.res.end(JSON.stringify(data));
        else
            ctx.res.end();
    };

    //NOTE: process cookie-related messages on proxy side
    switch (msg.cmd) {
        case cmd.SET_COOKIE:
            var serviceChannel = this,
                reqInfo        = urlUtil.parseProxyUrl(msg.url),
                originUrl      = reqInfo ? urlUtil.formatUrl(reqInfo.originResourceInfo) : msg.url,
                jobInfo        = {
                    uid:        msg.jobUid,
                    ownerToken: msg.jobOwnerToken
                };
            this.cookieShelf.setCookieByClient(jobInfo, originUrl, msg.cookie);
            //NOTE: respond with updated client cookie string
            var updatedCookies = serviceChannel.cookieShelf.getClientCookieString(jobInfo, originUrl);
            sendServiceResponse(updatedCookies);
            break;
        case cmd.GET_UPLOADED_FILES:
            this.events.for(msg.jobOwnerToken).emit('getUploadedFiles', msg.jobUid, msg.filePaths, sendServiceResponse);
            break;
        case cmd.UPLOAD_FILES:
            this.events.for(msg.jobOwnerToken).emit('uploadFiles', msg.jobUid, msg.data, msg.fileNames, sendServiceResponse);
            break;
        case cmd.GET_IFRAME_TASK_SCRIPT:
            this._getTaskScript(ctx, function (script) {
                ctx.res.setHeader('content-type', 'text/javascript');
                sendServiceResponse(script);
            }, true, true, msg.referer || '');
            break;
        default:
            this.events.for(msg.jobOwnerToken).emit('serviceMsg', msg, sendServiceResponse);
    }
};

//Static
ServiceChannel.shouldProcess = function (url) {
    var parsedReqUrl = urlUtil.parseUrl(url);

    return parsedReqUrl.pathname.indexOf(URL_PATH_PREFIX) === 0;
};

//Processing
ServiceChannel.prototype._getTaskScript = function (ctx, callback, isIFrame, skipExternalScripts, referer) {
    referer = ctx.req.headers['referer'] || referer || '';

    var refererInfo = referer && urlUtil.parseProxyUrl(referer);


    //NOTE: In the debug mode IE9 requests scripts without referer
    if (refererInfo) {
        var serviceChannel = this;

        if (isIFrame)
            refererInfo.resourceType = 'iframe';

        refererInfo.originResourceInfo.url = urlUtil.formatUrl(refererInfo.originResourceInfo);

        var cookie = this.cookieShelf.getClientCookieString(refererInfo.jobInfo, refererInfo.originResourceInfo.url);

        serviceChannel.events.for(refererInfo.jobInfo.ownerToken).emit('taskScriptRequested', refererInfo, cookie, function (taskScript) {
            var options = {
                cookie:               cookie.replace(/'/g, "\\'"),
                jobUid:               refererInfo.jobInfo.uid,
                jobOwnerToken:        refererInfo.jobInfo.ownerToken,
                serviceMsgUrl:        serviceChannel.serviceMsgUrl,
                ie9FileReaderShimUrl: serviceChannel.ie9FileReaderShimUrl,
                crossDomainProxyPort: serviceChannel.crossDomainProxyPort,
                taskScript:           skipExternalScripts ? '' : taskScript,
                referer:              referer
            };

            var script = renderTaskScript(options);
            callback(script);
        });
    }
    else
        callback(null);
};

ServiceChannel.prototype.process = function (ctx) {
    var parsedReqUrl     = urlUtil.parseUrl(ctx.req.url),
        resourcePathname = parsedReqUrl.pathname.replace(URL_PATH_PREFIX, '');

    if (resourcePathname === SERVICE_MSGS_PATHNAME)
        this._processServiceMsg(ctx);

    // IE9 file reader shim
    else if (resourcePathname === IE9_FILE_READER_SHIM) {
        var contentTypeHeader = ctx.req.headers['content-type'];
        var body              = ctx.reqBody;
        var info              = formData.getFileInfo(contentTypeHeader, body, parsedReqUrl.query['input-name'], parsedReqUrl.query.filename);

        // NOTE: we should skip content type, because IE9 can't
        // handle content with content-type "application/json"
        // and trying to download it as a file
        respondWithJSON(ctx.res, info, true);
    }
    else {
        if (resourcePathname === TASK_SCRIPT_PATHNAME || resourcePathname === IFRAME_TASK_SCRIPT_PATHNAME) {
            this._getTaskScript(ctx, function (script) {
                if (script) {
                    ctx.res.setHeader('content-type', 'application/x-javascript');
                    ctx.res.setHeader('cache-control', 'no-cache, no-store, must-revalidate');
                    ctx.res.setHeader('pragma', 'no-cache');
                    ctx.res.end(script);
                }
                else {
                    ctx.res.statusCode = 404;
                    ctx.res.end();
                }
            });
        }
        else {
            var resourceDescr = this.staticResourceDescriptors[resourcePathname];

            if (resourceDescr) {
                ctx.res.setHeader('content-type', resourceDescr.contentType);
                //NOTE: store content for 1 hour (60*60 = 3600 seconds)
                ctx.res.setHeader('cache-control', 'max-age=3600, public');
                ctx.res.end(resourceDescr.content);
            }
            else {
                ctx.res.statusCode = 404;
                ctx.res.end();
            }
        }
    }
};

//Resources
ServiceChannel.prototype.registerStaticResource = function (resourcePathname, resourceDescr) {
    this.staticResourceDescriptors[resourcePathname] = resourceDescr;

    return this._getServiceUrl(resourcePathname) + CROSS_VERSION_CACHING_PREVENTION_HASH;
};

