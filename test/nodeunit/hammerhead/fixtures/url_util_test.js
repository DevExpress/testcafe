var testUtils = require('../../test_utils'),
    urlUtil = require('../../../../hammerhead/lib/url_util'),
    CLIENT_ERR = require('../../../../hammerhead/shared/client_errs');

var ENCODED_DESCRIPTOR_VALUES_SEPARATOR = encodeURI(urlUtil.REQUEST_DESCRIPTOR_VALUES_SEPARATOR);

var createProxyParam = function (protocol, hostname, jobUid, jobOwnerToken) {
    return [urlUtil.REQUEST_DESCRIPTOR_QUERY_KEY + '=' + protocol + '%3A', hostname, jobUid, jobOwnerToken]
        .join(ENCODED_DESCRIPTOR_VALUES_SEPARATOR);
};

exports['urlUtil.isSupportedProtocol'] = {
    'Ignore case': function (t) {
        t.ok(!urlUtil.isSupportedProtocol('JavaScript:0;'));
        t.ok(!urlUtil.isSupportedProtocol('javascript:0;'));

        t.done();
    },

    'Skypec2c protocol': function(t){
        t.ok(!urlUtil.isSupportedProtocol('skypec2c://r/202'));
        t.done();
    },

    'Chrome extension protocol': function (t) {
        t.ok(!urlUtil.isSupportedProtocol('chrome-extension://google.com/image.png'));

        t.done();
    },

    'Spaces': function (t) {
        t.ok(!urlUtil.isSupportedProtocol(' data:asdasdasdasdasdasd'));

        t.done();
    }
};

exports['urlUtil.formatUrl'] = {
    'Params encoding': function (t) {
        t.strictEqual(urlUtil.formatUrl({hostname: 'localhost', query: {param: 'simpleValue'}}),
            '//localhost?param=simpleValue');

        t.strictEqual(urlUtil.formatUrl({hostname: 'localhost', query: {param: 'encodable;,Value'}}),
            '//localhost?param=encodable;,Value');

        var urlObjWithDesc = {
            hostname: 'localhost',
            query: {param: 'encodable;,Value'}
        };

        urlObjWithDesc.query[urlUtil.REQUEST_DESCRIPTOR_QUERY_KEY] = 'descEncodable;,Value';

        t.strictEqual(urlUtil.formatUrl(urlObjWithDesc),
            '//localhost?param=encodable;,Value&' + urlUtil.REQUEST_DESCRIPTOR_QUERY_KEY + '=descEncodable%3B%2CValue');

        t.done();
    },

    'Empty params': function (t) {
        var url = '//localhost?&param1&param2=&param3=value',
            parsedUrl = {
                hostname: 'localhost',
                query: {
                    '': null,
                    'param1': null,
                    'param2': '',
                    'param3': 'value'
                }
            };

        t.strictEqual(urlUtil.formatUrl(parsedUrl), url);

        t.done();
    }
};

exports['urlUtil.parseUrl'] = {
    'Params decoding': function (t) {
        var parsedUrl = urlUtil.parseUrl('//localhost?param=simpleValue');

        t.strictEqual(parsedUrl.query['param'], 'simpleValue');
        t.strictEqual(parsedUrl.protocol, null);
        t.strictEqual(parsedUrl.hostname, null);

        parsedUrl = urlUtil.parseUrl('http://localhost?param=simple+Value');

        t.strictEqual(parsedUrl.query['param'], 'simple+Value');
        t.strictEqual(parsedUrl.protocol, 'http:');
        t.strictEqual(parsedUrl.hostname, 'localhost');

        parsedUrl = urlUtil.parseUrl('//localhost?param=decodable%3B%2CValue', 'https:');

        t.strictEqual(parsedUrl.query['param'], 'decodable%3B%2CValue');
        t.strictEqual(parsedUrl.protocol, 'https:');
        t.strictEqual(parsedUrl.hostname, 'localhost');

        parsedUrl = urlUtil.parseUrl('//localhost?param=decodable%3B%2CValue&' + urlUtil.REQUEST_DESCRIPTOR_QUERY_KEY +
                                     '=descDecodable%3B%2CValue');

        t.strictEqual(parsedUrl.query['param'], 'decodable%3B%2CValue');
        t.strictEqual(parsedUrl.query[urlUtil.REQUEST_DESCRIPTOR_QUERY_KEY], 'descDecodable;,Value');
        t.notStrictEqual(parsedUrl.search.indexOf('descDecodable;,Value'), -1);
        t.notStrictEqual(parsedUrl.path.indexOf('descDecodable;,Value'), -1);
        t.notStrictEqual(parsedUrl.href.indexOf('descDecodable;,Value'), -1);

        t.done();
    },

    'Empty params': function (t) {
        var parsedUrl = urlUtil.parseUrl('http://localhost/?&param1&param2=&param3=value');

        t.strictEqual(parsedUrl.query[''], null);
        t.strictEqual(parsedUrl.query['param1'], null);
        t.strictEqual(parsedUrl.query['param2'], '');
        t.strictEqual(parsedUrl.query['param3'], 'value');

        t.done();
    },

    'Health monitor - question mark disappears': function (t) {
        var url = 'http://google.ru:345/path?',
            parsedUrl = urlUtil.parseUrl(url);

        t.strictEqual(Object.keys(parsedUrl.query).length, 1);
        t.strictEqual(parsedUrl.query[''], null);
        t.strictEqual(urlUtil.formatUrl(parsedUrl), url);

        url = 'http://yandex.ru:234/path';
        parsedUrl = urlUtil.parseUrl(url);

        t.strictEqual(Object.keys(parsedUrl.query).length, 0);
        t.strictEqual(urlUtil.formatUrl(parsedUrl), url);

        t.done();
    }
};

exports['urlUtil.getProxyUrl'] = {
    'Origin with query, path, hash and host': function (t) {
        var originUrl = 'http://test.example.com/pa/th/Page?someQueryParam=someValue#testHash',
            proxyUrl = urlUtil.getProxyUrl(originUrl, '127.0.0.1', testUtils.TEST_CAFE_PROXY_PORT, 'MyUID', 'ownerToken');

        t.strictEqual(proxyUrl, 'http://' + testUtils.TEST_CAFE_PROXY_HOST + '/ownerToken!MyUID/' + originUrl);
        t.done();
    },

    'IFrame url': function (t) {
        var originUrl = 'http://test.example.com#testHash',
            proxyUrl = urlUtil.getProxyUrl(originUrl, '127.0.0.1', testUtils.TEST_CAFE_PROXY_PORT, 'MyUID', 'ownerToken', urlUtil.IFRAME);

        t.strictEqual(proxyUrl, 'http://' + testUtils.TEST_CAFE_PROXY_HOST + '/ownerToken!MyUID!iframe/' +
                                originUrl);

        t.done();
    },

    'Origin with host only': function (t) {
        var originUrl = 'http://test.example.com/',
            proxyUrl = urlUtil.getProxyUrl(originUrl, '127.0.0.1', testUtils.TEST_CAFE_PROXY_PORT, 'MyUID', 'ownerToken');

        t.strictEqual(proxyUrl, 'http://' + testUtils.TEST_CAFE_PROXY_HOST + '/ownerToken!MyUID/' + originUrl);
        t.done();
    },

    'Origin with port': function (t) {
        var originUrl = 'http://test.example.com:53/',
            proxyUrl = urlUtil.getProxyUrl(originUrl, '127.0.0.1', testUtils.TEST_CAFE_PROXY_PORT, 'MyUID', 'ownerToken');

        t.strictEqual(proxyUrl, 'http://' + testUtils.TEST_CAFE_PROXY_HOST + '/ownerToken!MyUID/' + originUrl);
        t.done();
    },

    'Origin with https protocol': function (t) {
        var originUrl = 'https://test.example.com:53/',
            proxyUrl = urlUtil.getProxyUrl(originUrl, '127.0.0.1', testUtils.TEST_CAFE_PROXY_PORT, 'MyUID', 'ownerToken');

        t.strictEqual(proxyUrl, 'http://' + testUtils.TEST_CAFE_PROXY_HOST + '/ownerToken!MyUID/' + originUrl);
        t.done();
    },

    'Origin with non http or https protocol': function (t) {
        t.expect(2);

        var originUrl = 'someProtocol://test.example.com:53/';

        try {
            urlUtil.getProxyUrl(originUrl, '127.0.0.1', testUtils.TEST_CAFE_PROXY_PORT)
        } catch (err) {
            t.strictEqual(err.code, CLIENT_ERR.URL_UTIL_PROTOCOL_IS_NOT_SUPPORTED);
            t.strictEqual(err.originUrl, originUrl);
        }

        t.done();
    },

    'Url contains successive question marks in query': function (t) {
        t.expect(1);

        var originUrl = 'http://test.example.com/??dirs/???files/?query=test',
            proxyUrl = urlUtil.getProxyUrl(originUrl, '127.0.0.1', testUtils.TEST_CAFE_PROXY_PORT, 'MyUID', 'ownerToken');

        t.strictEqual(proxyUrl, 'http://' + testUtils.TEST_CAFE_PROXY_HOST + '/ownerToken!MyUID/' + originUrl);
        t.done();
    }
};

exports['urlUtil.parseProxyUrl'] = {
    'Parse http URL': function (t) {
        var proxyUrl = 'http://' + testUtils.TEST_CAFE_PROXY_HOST +
                       '/ownerToken!MyUID/http://test.example.com:53/PA/TH/#testHash',
            parsingResult = urlUtil.parseProxyUrl(proxyUrl);

        t.strictEqual(parsingResult.originResourceInfo.protocol, 'http:');
        t.strictEqual(parsingResult.originResourceInfo.host, 'test.example.com:53');
        t.strictEqual(parsingResult.originResourceInfo.hostname, 'test.example.com');
        t.strictEqual(parsingResult.originResourceInfo.port, '53');
        t.strictEqual(parsingResult.originResourceInfo.pathname, '/PA/TH/');
        t.strictEqual(parsingResult.originResourceInfo.hash, '#testHash');
        t.strictEqual(parsingResult.jobInfo.uid, 'MyUID');
        t.strictEqual(parsingResult.jobInfo.ownerToken, 'ownerToken');

        t.done();
    },

    'Parse https URL': function (t) {
        var proxyUrl = 'http://' + testUtils.TEST_CAFE_PROXY_HOST +
                       '/ownerToken!MyUID/https://test.example.com:53/PA/TH/#testHash',
            parsingResult = urlUtil.parseProxyUrl(proxyUrl);

        t.strictEqual(parsingResult.originResourceInfo.protocol, 'https:');
        t.strictEqual(parsingResult.originResourceInfo.host, 'test.example.com:53');
        t.strictEqual(parsingResult.originResourceInfo.hostname, 'test.example.com');
        t.strictEqual(parsingResult.originResourceInfo.port, '53');
        t.strictEqual(parsingResult.originResourceInfo.pathname, '/PA/TH/');
        t.strictEqual(parsingResult.jobInfo.uid, 'MyUID');
        t.strictEqual(parsingResult.jobInfo.ownerToken, 'ownerToken');

        t.done();
    },

    'Parse non-proxy URL': function (t) {
        var proxyUrl = 'http://' + testUtils.TEST_CAFE_PROXY_HOST + '/PA/TH/?someParam=value',
            originUrlInfo = urlUtil.parseProxyUrl(proxyUrl);

        t.ok(!originUrlInfo);
        t.done();
    },

    'Parse URL with successive question marks': function (t) {
        var proxyUrl = 'http://' + testUtils.TEST_CAFE_PROXY_HOST +
                       '/ownerToken!MyUID/http://test.example.com:53/??dirs/???files/#testHash',
            parsingResult = urlUtil.parseProxyUrl(proxyUrl);

        t.strictEqual(parsingResult.originResourceInfo.protocol, 'http:');
        t.strictEqual(parsingResult.originResourceInfo.host, 'test.example.com:53');
        t.strictEqual(parsingResult.originResourceInfo.hostname, 'test.example.com');
        t.strictEqual(parsingResult.originResourceInfo.port, '53');
        t.strictEqual(parsingResult.originResourceInfo.pathname, '/');
        t.strictEqual(parsingResult.originResourceInfo.hash, '#testHash');
        t.strictEqual(parsingResult.originResourceInfo.query['?dirs/???files/'], null);
        t.strictEqual(parsingResult.jobInfo.uid, 'MyUID');
        t.strictEqual(parsingResult.jobInfo.ownerToken, 'ownerToken');

        t.done();
    }
};

