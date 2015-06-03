/* global isIFrameWithoutSrc:true */
HammerheadClient.define('UrlUtil', function (require) {
    var NativeMethods = require('DOMSandbox.NativeMethods'),
        Settings = require('Settings'),
        SharedConst = require('Shared.Const'),
        SharedUrlUtil = require('Shared.UrlUtil');        

    var UrlUtil = {};

    //URL processing funcs
    UrlUtil.DOCUMENT_URL_RESOLVER = 'doc_url_resolver_8ff20d5e';
    UrlUtil.REQUEST_DESCRIPTOR_QUERY_KEY = SharedUrlUtil.REQUEST_DESCRIPTOR_QUERY_KEY;
    UrlUtil.REQUEST_DESCRIPTOR_VALUES_SEPARATOR = SharedUrlUtil.REQUEST_DESCRIPTOR_VALUES_SEPARATOR;

    UrlUtil.IFRAME = SharedUrlUtil.IFRAME;
    UrlUtil.SCRIPT = SharedUrlUtil.SCRIPT;

    document[UrlUtil.DOCUMENT_URL_RESOLVER] = document.createElement('a');

    function getResolver(doc) {
        // IE clean up document after document.open call
        if (!doc[UrlUtil.DOCUMENT_URL_RESOLVER])
            doc[UrlUtil.DOCUMENT_URL_RESOLVER] = doc.createElement('a');

        return doc[UrlUtil.DOCUMENT_URL_RESOLVER];
    }

    UrlUtil.getProxyUrl = function (url, proxyHostname, proxyPort, jobUid, jobOwnerToken, resourceType) {
        if (!UrlUtil.isSupportedProtocol(url))
            return url;

        // NOTE: resolve relative URLs
        url = UrlUtil.resolveUrl(url);

        // NOTE: if we have a relative URL without slash (e.g. 'img123') resolver will keep
        // original proxy information, so we can return such URL as is. TODO: implement is proxy URL func
        var isValidProxyUrl = !!UrlUtil.parseProxyUrl(url);

        if (isValidProxyUrl)
            return url;

        proxyHostname = proxyHostname || location.hostname;
        proxyPort = proxyPort || location.port.toString();
        jobUid = jobUid || Settings.JOB_UID;
        jobOwnerToken = jobOwnerToken || Settings.JOB_OWNER_TOKEN;

        var parsedUrl = UrlUtil.parseUrl(url);

        // NOTE: seems like we've had a relative URL with leading slash or dots,
        // so our proxy info path part was removed by resolver and we have an origin URL,
        // but with incorrect host and protocol.
        if (parsedUrl.protocol === 'http:' && parsedUrl.hostname === proxyHostname && parsedUrl.port === proxyPort) {
            var parsedOriginLocation = UrlUtil.OriginLocation.getParsed();

            parsedUrl.protocol = parsedOriginLocation.protocol;
            parsedUrl.host = parsedOriginLocation.host;
            parsedUrl.hostname = parsedOriginLocation.hostname;
            parsedUrl.port = parsedOriginLocation.port || '';

            url = UrlUtil.formatUrl(parsedUrl);
        }


        return SharedUrlUtil.getProxyUrl(url, proxyHostname, proxyPort, jobUid, jobOwnerToken, resourceType, UrlUtil.parseUrl, UrlUtil.formatUrl);
    };

    UrlUtil.getCrossDomainIframeProxyUrl = function (url) {
        return UrlUtil.getProxyUrl(url, null, Settings.CROSS_DOMAIN_PROXY_PORT, null, null, UrlUtil.IFRAME);
    };

    UrlUtil.getCrossDomainProxyUrl = function () {
        return location.protocol + '//' + location.hostname + ':' + Settings.CROSS_DOMAIN_PROXY_PORT + '/';
    };

    UrlUtil.resolveUrl = function (url, doc) {
        url = SharedUrlUtil.prepareUrl(url);
        
        if (url && url.indexOf('//') === 0)
            url = UrlUtil.OriginLocation.getParsed().protocol + url;

        var urlResolver = getResolver(doc || document);

        if (url === null)
            urlResolver.removeAttribute('href');
        else {
            urlResolver.href = url;

            //NOTE: it looks like a chrome bug: in nested iframe without src (when iframe is placed in another iframe) you
            //cannot set relative link href for some time while the iframe loading is not completed. So, we'll do it with
            //parent's urlResolver
            if (url && !urlResolver.href && isIFrameWithoutSrc && window.parent && window.parent.document)
                return UrlUtil.resolveUrl(url, window.parent.document);
        }
        
        return urlResolver.href;
    };

    UrlUtil.resolveUrlAsOrigin = function (url) {
        return SharedUrlUtil.resolveUrlAsOrigin(url, UrlUtil.formatUrl, UrlUtil.getProxyUrl, UrlUtil.parseProxyUrl);
    };

    UrlUtil.parseUrl = function (url) {
        return SharedUrlUtil.parseUrl(url);
    };

    UrlUtil.convertToProxyUrl = function (url, resourceType) {
        return UrlUtil.getProxyUrl(url, null, null, null, null, resourceType);
    };

    UrlUtil.changeOriginUrlPart = function (proxyUrl, prop, value, resourceType) {
        var parsed = UrlUtil.parseProxyUrl(proxyUrl);

        if (parsed) {
            var resolver = getResolver(document);
            var job = parsed.jobInfo;
            var proxy = parsed.proxy;

            resolver.href = parsed.originUrl;
            resolver[prop] = value;

            return UrlUtil.getProxyUrl(resolver.href, proxy.hostname, proxy.port, job.uid, job.ownerToken, resourceType);
        }

        return proxyUrl;
    };

    UrlUtil.formatUrl = function (parsedUrl) {
        // NOTE: URL is relative
        if (!parsedUrl.host && (!parsedUrl.hostname || !parsedUrl.port))
            return parsedUrl.partAfterHost;

        var url = parsedUrl.protocol || '';

        url += '//';

        if (parsedUrl.username || parsedUrl.password)
            url += parsedUrl.username + ':' + parsedUrl.password + '@';

        if (parsedUrl.host)
            url += parsedUrl.host;

        else {
            url += parsedUrl.hostname;

            if (parsedUrl.port)
                url += ':' + parsedUrl.port;
        }

        if (parsedUrl.partAfterHost)
            url += parsedUrl.partAfterHost;

        return url;
    };

    UrlUtil.isSubDomain = function (domain, subDomain) {
        return SharedUrlUtil.isSubDomain(domain, subDomain);
    };

    UrlUtil.sameOriginCheck = function (location, checkedUrl) {
        return SharedUrlUtil.sameOriginCheck(location, checkedUrl, UrlUtil.parseUrl, UrlUtil.resolveUrl);
    };

    UrlUtil.parseProxyUrl = function (proxyUrl) {
        return SharedUrlUtil.parseProxyUrl(proxyUrl, UrlUtil.parseUrl);
    };

    UrlUtil.isSupportedProtocol = function (url) {
        return SharedUrlUtil.isSupportedProtocol(url);
    };
    
    UrlUtil.isIframeWithoutSrc = function (iframe) {
        var iFrameLocation = UrlUtil.getIframeLocation(iframe),
            iFrameSrcLocation = iFrameLocation.srcLocation,
            iFrameDocumentLocation = iFrameLocation.documentLocation;

        if (iFrameDocumentLocation === null) // is a cross-domain iframe
            return false;

        var window = iframe[SharedConst.DOM_SANDBOX_PROCESSED_CONTEXT] || iframe.contentWindow.parent,
            windowLocation = window.location.toString(),
            parsedWindowLocation = UrlUtil.parseProxyUrl(windowLocation);

        if (iFrameDocumentLocation === (parsedWindowLocation ? parsedWindowLocation.originUrl : windowLocation) ||
            iFrameSrcLocation === (parsedWindowLocation ? parsedWindowLocation.originUrl : windowLocation))
            return true;

        var iFrameDocumentLocationHaveSupportedProtocol = UrlUtil.isSupportedProtocol(iFrameDocumentLocation);

        //NOTE: when an iFrame have empty src attribute (<iframe src></iframe>) the iframe.src property doesn't empty but it has different values
        //in different browsers. Its document location is 'about:blank'. Therefore we should check the src attribute.
        if (!iFrameDocumentLocationHaveSupportedProtocol && !(iframe.attributes['src'] && iframe.attributes['src'].value))
            return true;

        //NOTE: is Chrome an iFrame with src has documentLocation 'about:blank' when it is just created. So, we should check
        // srcLocation in this case.
        if (iFrameSrcLocation && UrlUtil.isSupportedProtocol(iFrameSrcLocation))
            return false;

        return !iFrameDocumentLocationHaveSupportedProtocol;
    };
    
    UrlUtil.getIframeLocation = function (iframe) {
        var documentLocation = null;

        try {
            documentLocation = iframe.contentDocument.location.href;
        } catch (e) {
        }

        var srcLocation = NativeMethods.getAttribute.call(iframe, 'src' + SharedConst.DOM_SANDBOX_STORED_ATTR_POSTFIX) ||
                NativeMethods.getAttribute.call(iframe, 'src') || iframe.src,

            parsedProxyDocumentLocation = documentLocation && UrlUtil.isSupportedProtocol(documentLocation) && UrlUtil.parseProxyUrl(documentLocation),
            parsedProxySrcLocation = srcLocation && UrlUtil.isSupportedProtocol(srcLocation) && UrlUtil.parseProxyUrl(srcLocation);

        return {
            documentLocation: parsedProxyDocumentLocation ? parsedProxyDocumentLocation.originUrl : documentLocation,
            srcLocation: parsedProxySrcLocation ? parsedProxySrcLocation.originUrl : srcLocation
        };
    };

    UrlUtil.OriginLocation = {
        get: function () {
            var url = window.location.toString();
            
            try {
                // NOTE: fallback to the owner page's URL if we are in the iFrame without src
                if (window.frameElement && UrlUtil.isIframeWithoutSrc(window.frameElement))
                    url = Settings.REFERER;
            } catch(e) {
                // NOTE: Cross-domain iframe
            }

            return UrlUtil.parseProxyUrl(url).originUrl;
        },

        withHash: function (hash) {
            var location = this.get();

            // NOTE: remove previous hash if we have one
            location = location.replace(/(#.*)$/, '');

            return location + hash;
        },

        getParsed: function () {
            var resolver = getResolver(document),
                origin = this.get(),
                parsedOrigin = UrlUtil.parseUrl(origin);
        
            // NOTE: IE "browser" adds default port for the https protocol while resolving
            resolver.href = this.get();
            
            // NOTE: IE ignores first '/' symbol in the pathname
            var pathname = resolver.pathname.indexOf('/') === 0 ? resolver.pathname : '/' + resolver.pathname; 

            //TODO describe default ports logic
            return {
                protocol: resolver.protocol,
                // NOTE: remove default port
                port: parsedOrigin.port ? resolver.port : null,
                hostname: resolver.hostname,
                // NOTE: remove default port form the host 
                host: parsedOrigin.port ? resolver.host : resolver.host.replace(/:\d+$/, ''),
                pathname: pathname,
                hash: resolver.hash,
                search: resolver.search
            };
        }
    };

    this.exports = UrlUtil;
});
