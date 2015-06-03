import SHARED_CONST from '../shared/const';
import * as urlUtils from '../shared/url_util';
import * as contentUtils from './content-utils';
import ServiceChannel from './service_channel';

//TODO rewrite parseProxyUrl instead
function flattenParsedProxyUrl (parsed) {
    if (parsed) {
        return {
            dest:    {
                url:           parsed.originUrl,
                protocol:      parsed.originResourceInfo.protocol,
                host:          parsed.originResourceInfo.host,
                hostname:      parsed.originResourceInfo.hostname,
                port:          parsed.originResourceInfo.port,
                partAfterHost: parsed.originResourceInfo.partAfterHost,
                resourceType:  parsed.resourceType
            },
            jobInfo: parsed.jobInfo
        };
    }
}

function getContentTypeUrlToken (isScript, isIFrame) {
    if (isScript) return urlUtils.SCRIPT;
    if (isIFrame) return urlUtils.IFRAME;
    return null;
}


export default class PipelineContext {
    constructor (req, res, serverInfo) {
        this.serverInfo       = serverInfo;
        this.session          = null;
        this.pipelineStage    = 0;
        this.isServiceRequest = false;
        this.jobInfo          = null;

        this.req     = req;
        this.reqBody = null;
        this.res     = res;

        this.dest        = null;
        this.destRes     = null;
        this.destResBody = null;

        this.hasDestReqErr   = false;
        this.isXhr           = !!req.headers[SHARED_CONST.XHR_REQUEST_MARKER_HEADER];
        this.isPageCandidate = !this.isXhr && contentUtils.isPageMIME(req.headers['accept']);
        this.contentInfo     = null;

        this._dispatch();
    }

    _getDestFromReferer (parsedReferer) {
        // NOTE: browsers may send default port in referer.
        // But, since we compose destination URL from it we
        // need to skip port number if it's protocol default
        // port. Some servers has host conditions which do not
        // include port number.

        var rDest         = parsedReferer.dest;
        var isDefaultPort = (rDest.protocol === 'https:' && rDest.port === '443') ||
                            (rDest.protocol === 'http:' && rDest.port === '80');

        var dest = {
            protocol:      rDest.protocol,
            host:          isDefaultPort ? rDest.host.split(':')[0] : rDest.host,
            hostname:      rDest.hostname,
            port:          isDefaultPort ? '' : rDest.port,
            partAfterHost: this.req.url
        };

        dest.url = urlUtils.formatUrl(dest);

        return {
            dest:    dest,
            jobInfo: parsedReferer.jobInfo
        };
    }

    _dispatch () {
        if (ServiceChannel.shouldProcess(this.req.url)) {
            this.isServiceRequest = true;
            return;
        }

        var parsedReqUrl  = urlUtils.parseProxyUrlWrap(this.req.url);
        var referer       = this.req.headers['referer'];
        var parsedReferer = referer && urlUtils.parseProxyUrlWrap(referer);

        //TODO remove it after parseProxyURL rewrite
        parsedReqUrl  = flattenParsedProxyUrl(parsedReqUrl);
        parsedReferer = flattenParsedProxyUrl(parsedReferer);

        // NOTE: try to extract destination from the referer
        if (!parsedReqUrl && parsedReferer)
            parsedReqUrl = this._getDestFromReferer(parsedReferer);

        if (parsedReqUrl) {
            this.dest    = parsedReqUrl.dest;
            this.jobInfo = parsedReqUrl.jobInfo;

            this.dest.domain = urlUtils.getDomain(this.dest);

            if (parsedReferer) {
                this.dest.referer   = parsedReferer.dest.url;
                this.dest.reqOrigin = urlUtils.getDomain(parsedReferer.dest);
            }
        }
    }

    _isFileDownload () {
        var contentDisposition = this.destRes.headers['content-disposition'];

        return contentDisposition &&
               contentDisposition.indexOf('attachment') > -1 &&
               contentDisposition.indexOf('filename') > -1;
    }


    buildContentInfo () {
        var contentType = this.destRes.headers['content-type'] || '';
        var accept      = this.req.headers['accept'] || '';
        var isPage      = this.isPageCandidate;

        //NOTE: if Content-Type header is missing we treat this resource as page (see: Q557255)
        if (contentType)
            isPage = isPage && contentUtils.isPageMIME(contentType);

        var isIFrame   = this.dest.resourceType === urlUtils.IFRAME;
        var isCSS      = contentUtils.isCSSResource(contentType, accept);
        var isManifest = contentUtils.isManifest(contentType);
        var isJSON     = contentUtils.isJSON(contentType);
        var isScript   = this.dest.resourceType === urlUtils.SCRIPT ||
                         contentUtils.isScriptResource(contentType, accept);

        var requireProcessing    = !this.isXhr && (isPage || isIFrame || isCSS || isScript || isManifest || isJSON);
        var isIFrameWithImageSrc = isIFrame && !isPage && /^\s*image\//.test(contentType);

        this.contentInfo = {
            encoding:             this.destRes.headers['content-encoding'],
            charset:              contentUtils.parseCharset(contentType),
            requireProcessing:    requireProcessing,
            isPage:               isPage,
            isIFrame:             isIFrame,
            isIFrameWithImageSrc: isIFrameWithImageSrc,
            isCSS:                isCSS,
            isScript:             isScript,
            isManifest:           isManifest,
            isJSON:               isJSON,
            isFileDownload:       this._isFileDownload(),
            contentTypeUrlToken:  getContentTypeUrlToken(isScript, isIFrame)
        };
    }

    closeWithError (statusCode, resBody) {
        this.res.statusCode = statusCode;

        if (resBody) {
            this.res.setHeader('content-type', 'text/html');
            this.res.end(resBody);
        }
        else
            this.res.end();
    }
}