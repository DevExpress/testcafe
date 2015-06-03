var testUtils = require('../../test_utils'),
    pageProc = require('../../../../hammerhead/shared/page_processor'),
    sharedConst = require('../../../../hammerhead/shared/const'),
    urlUtil = require('../../../../hammerhead/lib/url_util'),
    whacko = require('whacko');

exports['pageProc.processPage'] = {
    'Process element outside html': function (t) {
        var processedSrc = 'processed_script.js',
            $ = whacko.load('<html></html><script src="script.js"></script>');

        pageProc.processPage($, function () {
            return processedSrc;
        });

        t.strictEqual($('script')[0].attribs.src, processedSrc);
        t.done();
    },

    'Process attribute value': function (t) {
        var src = '<html><head><script id="data" data-bind="{location: 332}" class="cookie"></script></head><body></body></html>';
        $ = whacko.load(src);

        pageProc.processPage($, function () {
            return src;
        });

        t.ok(testUtils.compareCode($.html(), src));
        t.done();
    },

    'Process sandboxed iframe': function (t) {
        var src = '<html><head></head><body><iframe sandbox="allow-forms"></iframe></body></html>',
            $ = whacko.load(src),
            storedAttr = pageProc.getStoredAttrName('sandbox');

        pageProc.processPage($, function () {
            return;
        });

        t.ok($.html().indexOf('<iframe sandbox="allow-forms allow-scripts" ' + storedAttr + '="allow-forms">') !== -1);
        t.done();
    },

    'Process style attribute': function (t) {
        var $src = whacko.load('<div style="background: url(\'src-url\')"></div>'),
            expectedHtml = '<html><head></head><body><div style="background: url(\'replaced\')"></div></body></html>';

        pageProc.processPage($src, function () {
            return 'replaced';
        });

        t.strictEqual($src.html(), expectedHtml);
        t.done();
    },

    'Process url attribute with newline characters': function (t) {
        var $ = whacko.load('<a href="http://exa\n\nmple.com"></a>');

        pageProc.processPage($, function (resourceUrl, resourceType) {
            resourceUrl = urlUtil.prepareUrl(resourceUrl);
            return urlUtil.getProxyUrl(resourceUrl, 'localhost', '1335', 'uid', 'ownerToken', resourceType);
        });

        t.strictEqual(urlUtil.parseProxyUrl($('a')[0].attribs.href).originResourceInfo.hostname, 'example.com');
        t.done();
    },

    'Process url attribute with tabulation characters': function (t) {
        var $ = whacko.load('<a href="http://exa\t\tmple.com"></a>');

        pageProc.processPage($, function (resourceUrl, resourceType) {
            resourceUrl = urlUtil.prepareUrl(resourceUrl);
            return urlUtil.getProxyUrl(resourceUrl, 'localhost', '1335', 'uid', 'ownerToken', resourceType);
        });

        t.strictEqual(urlUtil.parseProxyUrl($('a')[0].attribs.href).originResourceInfo.hostname, 'example.com');
        t.done();
    },

    'Process script src': function (t) {
        var $ = whacko.load('<script src="http://google.com"></script>');

        pageProc.processPage($, function (resourceUrl, resourceType) {
            return urlUtil.getProxyUrl(resourceUrl, 'localhost', '1335', 'uid', 'ownerToken', resourceType);
        });

        t.strictEqual(urlUtil.parseProxyUrl($('script')[0].attribs.src).resourceType, urlUtil.SCRIPT);
        t.done();
    },

    'Process img src': function (t) {
        var $ = whacko.load('<img src="http://domain/image.png">');

        pageProc.processPage($, function (resourceUrl, resourceType) {
            return urlUtil.getProxyUrl(resourceUrl, 'localhost', '1335', 'uid', 'ownerToken', resourceType);
        });

        t.strictEqual($('img')[0].attribs['src'], 'http://domain/image.png');
        t.strictEqual($('img')[0].attribs[pageProc.getStoredAttrName('src')], 'http://domain/image.png');

        t.done();
    },

    'Process empty img src': function (t) {
        var $ = whacko.load('<img src="">');

        pageProc.processPage($, function (resourceUrl, resourceType) {
            return urlUtil.getProxyUrl(resourceUrl, 'localhost', '1335', 'uid', 'ownerToken', resourceType);
        });

        t.strictEqual($('img')[0].attribs['src'], '');
        t.ok(!$('img')[0].attribs[pageProc.getStoredAttrName('src')]);

        t.done();
    },

    'Process about:blank img src': function (t) {
        var $ = whacko.load('<img src="about:blank">');

        pageProc.processPage($, function (resourceUrl, resourceType) {
            return urlUtil.getProxyUrl(resourceUrl, 'localhost', '1335', 'uid', 'ownerToken', resourceType);
        });

        t.strictEqual($('img')[0].attribs['src'], 'about:blank');
        t.ok(!$('img')[0].attribs[pageProc.getStoredAttrName('src')]);

        t.done();
    },

    'Process "//:0/" img src': function (t) {
        var $ = whacko.load(
            '<img src="//:0/">' +
            '<img src="//:0">' +
            '<img src="http://:0/">' +
            '<img src="https://:0">'
        );

        pageProc.processPage($, function (resourceUrl, resourceType) {
            return urlUtil.getProxyUrl(resourceUrl, 'localhost', '1335', 'uid', 'ownerToken', resourceType);
        });

        var storedAttr = pageProc.getStoredAttrName('src');

        t.equal($('img')[0].attribs['src'], '//:0/');
        t.ok(!$('img')[0].attribs[storedAttr]);

        t.equal($('img')[1].attribs['src'], '//:0');
        t.ok(!$('img')[1].attribs[storedAttr]);

        t.equal($('img')[2].attribs['src'], 'http://:0/');
        t.ok(!$('img')[2].attribs[storedAttr]);

        t.equal($('img')[3].attribs['src'], 'https://:0');
        t.ok(!$('img')[3].attribs[storedAttr]);

        t.done();
    },

    'Cross-domain iframe': function (t) {
        var $iframe = whacko.load('<iframe src="http://cross.domain.com/"></iframe>'),
            expectedHtml = '<iframe src="http://proxy.cross.domain.com/" src' +
                           sharedConst.DOM_SANDBOX_STORED_ATTR_POSTFIX +
                           '="http://cross.domain.com/"></iframe>',

            storedGetCrossDomainIframeProxyUrl = urlUtil.getCrossDomainIframeProxyUrl,
            storedGetProxyUrl = urlUtil.getProxyUrl;

        urlUtil.getCrossDomainIframeProxyUrl = function () {
            return 'http://proxy.cross.domain.com/';
        };

        urlUtil.getProxyUrl = function () {
            return 'http://proxy.com/-!id-ow!-/http://host'
        };

        pageProc.processPage($iframe, urlUtil.getProxyUrl);

        urlUtil.getCrossDomainIframeProxyUrl = storedGetCrossDomainIframeProxyUrl;
        urlUtil.getProxyUrl = storedGetProxyUrl;

        t.ok($iframe.html().indexOf(expectedHtml) !== -1);
        t.done();
    },

    'Elements with flag "iframe"': function (t) {
        var url = 'http://a.ru/index.html',
            pageText = [
                '<a id="a" href="' + url + '"></a>',
                '<form id="form" action="' + url + '"></form>',
                '<a id="a_target_top" href="' + url + '" target="_top"></a>',
                '<a id="a_target_parent" href="' + url + '" target="_parent"></a>'
            ].join(''),
            $page = whacko.load(pageText),
            $iframePage = whacko.load(pageText),
            urlReplacer = function (resourceUrl, resourceType) {
                return urlUtil.getProxyUrl(resourceUrl, 'localhost', '1335', 'uid', 'ownerToken', resourceType);
            };

        pageProc.processPage($page, urlReplacer, 777, false);
        pageProc.processPage($iframePage, urlReplacer, 777, true);

        t.equal(urlUtil.parseProxyUrl($page('#a')[0].attribs.href).resourceType, null);
        t.equal(urlUtil.parseProxyUrl($page('#form')[0].attribs.action).resourceType, null);
        t.equal(urlUtil.parseProxyUrl($page('#a_target_top')[0].attribs.href).resourceType, null);
        t.equal($page('#a_target_parent')[0].attribs.href, url);
        t.equal($page('#a_target_parent')[0].attribs[pageProc.getStoredAttrName('href')], undefined);
        t.equal(urlUtil.parseProxyUrl($iframePage('#a')[0].attribs.href).resourceType, 'iframe');
        t.equal(urlUtil.parseProxyUrl($iframePage('#form')[0].attribs.action).resourceType, 'iframe');
        t.equal(urlUtil.parseProxyUrl($iframePage('#a_target_top')[0].attribs.href).resourceType, null);
        t.equal($iframePage('#a_target_parent')[0].attribs.href, url);
        t.equal($iframePage('#a_target_parent')[0].attribs[pageProc.getStoredAttrName('href')], undefined);

        t.done();
    }
};
//http://www.google.ru/#newwindow=1&output=search&sclient=psy-ab&q=exec+js&oq…v=on.2,or.r_qf.&bvm=bv.46865395,d.bGE&fp=afe8b18825c081e5&biw=1920&bih=477
