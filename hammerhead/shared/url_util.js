(function () {
    var isNode = typeof module !== 'undefined' && module.exports;

    var UrlUtil      = {},
        SharedErrors = null;

    //Const
    var PROTOCOL_RE        = /(^(\w+?\:))/;
    var LEADING_SLASHES_RE = /^(\/\/)/;
    var HOST_RE            = /^(.*?)(\/|%|\?|;|#|$)/;
    var PORT_RE            = /:([0-9]*)$/;
    var QUERY_AND_HASH_RE  = /(\?.+|#[^#]*)$/;

    UrlUtil.REQUEST_DESCRIPTOR_QUERY_KEY        = '7929ba6d39aa4465';
    UrlUtil.REQUEST_DESCRIPTOR_VALUES_SEPARATOR = '!';

    UrlUtil.IFRAME = 'iframe';
    UrlUtil.SCRIPT = 'script';

    if (isNode) {
        SharedErrors   = require('./client_errs');
        module.exports = UrlUtil;
    }
    else {
        HammerheadClient.define('Shared.UrlUtil', function (require) {
            SharedErrors = require('Shared.Errors');
            this.exports = UrlUtil;
        });
    }

    function validateOriginUrl (url) {
        if (!/^https?:/.test(url)) {
            throw {
                code:      SharedErrors.URL_UTIL_PROTOCOL_IS_NOT_SUPPORTED,
                originUrl: url
            };
        }
    }

    UrlUtil.isSubDomain = function (domain, subDomain) {
        domain    = domain.replace(/^www./i, '');
        subDomain = subDomain.replace(/^www./i, '');

        if (domain === subDomain)
            return true;

        var index = subDomain.lastIndexOf(domain);

        return subDomain[index - 1] === '.' && subDomain.length === index + domain.length;
    };

    UrlUtil.sameOriginCheck = function (location, checkedUrl, parseUrl, resolveUrl) {
        if (!checkedUrl)
            return true;

        if (resolveUrl)
            checkedUrl = resolveUrl(checkedUrl);

        var parsedLocation      = parseUrl(location),
            parsedCheckedUrl    = parseUrl(checkedUrl, parsedLocation.protocol),
            parsedProxyLocation = UrlUtil.parseProxyUrl(location, parseUrl),
            parsedOriginUrl     = parsedProxyLocation ? parsedProxyLocation.originResourceInfo : parsedLocation,
            isRelative          = !parsedCheckedUrl.host;

        if (isRelative ||
            (parsedCheckedUrl.host === parsedLocation.host && parsedCheckedUrl.protocol === parsedLocation.protocol))
            return true;

        if (parsedOriginUrl) {
            var portsEq = (!parsedOriginUrl.port && !parsedCheckedUrl.port) ||
                          (parsedOriginUrl.port && (parsedOriginUrl.port.toString() === parsedCheckedUrl.port));

            if (parsedOriginUrl.protocol === parsedCheckedUrl.protocol && portsEq) {
                if (parsedOriginUrl.hostname === parsedCheckedUrl.hostname)
                    return true;

                return UrlUtil.isSubDomain(parsedOriginUrl.hostname, parsedCheckedUrl.hostname) ||
                       UrlUtil.isSubDomain(parsedCheckedUrl.hostname, parsedOriginUrl.hostname);
            }
        }

        return false;
    };

    UrlUtil.getProxyUrl = function (url, proxyHostname, proxyPort, jobUid, jobOwnerToken, resourceType) {
        validateOriginUrl(url);

        var params = [jobOwnerToken, jobUid];

        if (resourceType)
            params.push(resourceType);

        params = params.join(UrlUtil.REQUEST_DESCRIPTOR_VALUES_SEPARATOR);

        return 'http://' + proxyHostname + ':' + proxyPort + '/' + params + '/' + url;
    };

    UrlUtil.getDomain = function (parsed) {
        return UrlUtil.formatUrl({
            protocol: parsed.protocol,
            host:     parsed.host,
            hostname: parsed.hostname,
            port:     parsed.port
        });
    };

    //TODO
    UrlUtil.parseProxyUrlWrap = function (proxyUrl) {
        return UrlUtil.parseProxyUrl(proxyUrl, UrlUtil.parseUrl);
    };

    UrlUtil.parseProxyUrl = function (proxyUrl, parseUrl) {
        //TODO remove it
        //parseUrl = parsedUrl || UrlUtil.parseUrl;

        var parsedUrl = UrlUtil.parseUrl(proxyUrl);

        if (!parsedUrl.partAfterHost)
            return;

        var match = parsedUrl.partAfterHost.match(/^\/(\S+?)\/(https?:\/\/\S+)/);

        if (!match)
            return;

        var params = match[1].split(UrlUtil.REQUEST_DESCRIPTOR_VALUES_SEPARATOR);

        // NOTE: we should have at least job uid and owner token
        if (params.length < 2)
            return;

        return {
            originUrl:          match[2],
            originResourceInfo: parseUrl(match[2]),
            proxy:              {
                hostname: parsedUrl.hostname,
                port:     parsedUrl.port
            },
            jobInfo:            {
                ownerToken: params[0],
                uid:        params[1]
            },
            resourceType:       params[2] || null
        };
    };

    UrlUtil.getPathname = function (path) {
        return path.replace(QUERY_AND_HASH_RE, '');
    };

    UrlUtil.parseUrl = function (url) {
        var parsed = {};

        url = UrlUtil.prepareUrl(url);

        if (!url)
            return parsed;

        // Trim
        url = url.replace(/^\s+|\s+$/g, '');

        // Protocol
        var hasImplicitProtocol = false;
        var remainder           = url
            .replace(PROTOCOL_RE, function (str, protocol) {
                parsed.protocol = protocol;
                return '';
            })
            .replace(LEADING_SLASHES_RE, function () {
                hasImplicitProtocol = true;
                return '';
            });

        // NOTE: URL is relative
        if (!parsed.protocol && !hasImplicitProtocol) {
            parsed.partAfterHost = url;
            return parsed;
        }

        // Host
        parsed.partAfterHost = remainder
            .replace(HOST_RE, function (str, host, restPartSeparator) {
                parsed.host = host;
                return restPartSeparator;
            });

        if (parsed.host) {
            parsed.hostname = parsed.host.replace(PORT_RE, function (str, port) {
                parsed.port = port;
                return '';
            });
        }

        return parsed;
    };

    UrlUtil.isSupportedProtocol = function (url) {
        return !/^\s*(chrome-extension:|blob:|javascript:|about:|mailto:|tel:|data:|skype:|skypec2c:|file:|#)/i.test(url);
    };

    UrlUtil.resolveUrlAsOrigin = function (url, formatUrl, getProxyUrl, parseProxyUrl) {
        if (UrlUtil.isSupportedProtocol(url)) {
            var proxyUrl       = getProxyUrl(url),
                parsedProxyUrl = parseProxyUrl(proxyUrl);

            return formatUrl(parsedProxyUrl.originResourceInfo);
        }

        return url;
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

    UrlUtil.prepareUrl = function (url) {
        if (url === null && /iPad|iPhone/i.test(window.navigator.userAgent))
            return '';
        else
            return (url + '').replace(/\n|\t/g, '');
    };

    UrlUtil.parseQueryString = function (search) {
        var queryStr    = search.substr(1),
            queryParsed = {};

        if (queryStr || search === '?') {
            queryStr.split('&').forEach(function (paramStr) {
                var paramParsed = paramStr.split('='),
                    key         = paramParsed.shift(),
                    value       = paramParsed.length ? paramParsed.join('=') : null;

                if (key === UrlUtil.REQUEST_DESCRIPTOR_QUERY_KEY)
                    value = decodeURIComponent(value);

                if (!queryParsed.hasOwnProperty(key))
                    queryParsed[key] = value;
                else if (queryParsed[key] instanceof Array)
                    queryParsed[key].push(value);
                else
                    queryParsed[key] = [queryParsed[key], value];
            });
        }

        return queryParsed;
    };

    UrlUtil.formatQuery = function (query) {
        var params = [];

        Object.keys(query).forEach(function (key) {
            var value = query[key];

            if (key === UrlUtil.REQUEST_DESCRIPTOR_QUERY_KEY)
                value = encodeURIComponent(value);

            if (!(value instanceof Array))
                value = [value];

            for (var i = 0; i < value.length; i++)
                params.push(key + (value[i] === null ? '' : ('=' + value[i])));
        });

        return params.length ? '?' + params.join('&') : '';
    };
})();