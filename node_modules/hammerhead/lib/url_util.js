var url = require('url'),
    SharedUrlUtil = require('../shared/url_util');

exports.REQUEST_DESCRIPTOR_QUERY_KEY = SharedUrlUtil.REQUEST_DESCRIPTOR_QUERY_KEY;
exports.REQUEST_DESCRIPTOR_VALUES_SEPARATOR = SharedUrlUtil.REQUEST_DESCRIPTOR_VALUES_SEPARATOR;

exports.IFRAME = SharedUrlUtil.IFRAME;
exports.SCRIPT = SharedUrlUtil.SCRIPT;

exports.prepareUrl = SharedUrlUtil.prepareUrl;

// Encodes and decodes request descriptor only
// NOTE: locationProtocol optional parameter
// for url without a protocol ('//google.com/path' for example)
exports.parseUrl = function (urlStr, locationProtocol) {
    var decodeFunc = decodeURIComponent,
        replaceFunc = String.prototype.replace,
        urlWithoutProtocol = urlStr.indexOf('//') === 0;

    //NOTE: disable jshint W020 warning
    /*jshint -W020 */
    decodeURIComponent = function (comp) {
        return comp;
    };
    /*jshint +W020 */

    // TODO: Refactoring
    // NOTE: The 'QueryString.parse' function in 'querystring' module
    // replaces all '+' symbols in the query string with '%20'
    String.prototype.replace = function (regexp, string) {
        var unallowed = regexp.toString() === '/\\+/g' && string === '%20';

        return unallowed ? this : replaceFunc.apply(this, arguments);
    };

    if (urlWithoutProtocol && locationProtocol)
        urlStr = locationProtocol + urlStr;

    var result = url.parse(urlStr, true),
        desc = result.query[exports.REQUEST_DESCRIPTOR_QUERY_KEY];

    String.prototype.replace = replaceFunc;

    //NOTE: disable jshint W020 warning
    /*jshint -W020 */
    decodeURIComponent = decodeFunc;
    /*jshint +W020 */

    result.query = SharedUrlUtil.parseQueryString(result.search);

    if (desc) {
        var decodedDesc = result.query[exports.REQUEST_DESCRIPTOR_QUERY_KEY];

        result.path = result.path.replace(desc, decodedDesc);
        result.search = result.search.replace(desc, decodedDesc);
        result.href = result.href.replace(desc, decodedDesc);
    }

    return result;
};

exports.formatUrl = function (urlObj) {
    var formatUrlObj = null;

    if (urlObj.query) {
        formatUrlObj = {};

        for (var prop in urlObj) {
            if (urlObj.hasOwnProperty(prop) && prop !== 'query')
                formatUrlObj[prop] = urlObj[prop];
        }

        formatUrlObj.search = SharedUrlUtil.formatQuery(urlObj.query);
    } else
        formatUrlObj = urlObj;

    return url.format(formatUrlObj);
};

exports.resolveUrlAsOrigin = function (url, urlReplacer) {
    return SharedUrlUtil.resolveUrlAsOrigin(url, exports.formatUrl, urlReplacer, exports.parseProxyUrl);
};

exports.getCrossDomainIframeProxyUrl = function (url, hostname, crossDomainProxyPort, jobUid, jobOwnerToken) {
    return exports.getProxyUrl(url, hostname, crossDomainProxyPort, jobUid, jobOwnerToken, SharedUrlUtil.IFRAME);
};

exports.sameOriginCheck = function (location, checkedUrl) {
    return SharedUrlUtil.sameOriginCheck(location, checkedUrl, exports.parseUrl);
};

exports.parseProxyUrl = function (proxyUrl) {
    return SharedUrlUtil.parseProxyUrl(proxyUrl, exports.parseUrl);
};

exports.isSupportedProtocol = function (url) {
    return SharedUrlUtil.isSupportedProtocol(url);
};

exports.getProxyUrl = function (url, proxyHostname, proxyPort, jobUid, jobOwnerToken, resourceType) {
    return SharedUrlUtil.getProxyUrl(url, proxyHostname, proxyPort, jobUid, jobOwnerToken, resourceType, exports.parseUrl, exports.formatUrl);
};
