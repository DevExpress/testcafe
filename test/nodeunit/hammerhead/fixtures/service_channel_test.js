var url            = require('url'),
    request        = require('request'),
    express        = require('express'),
    async          = require('async'),
    urlUtil        = require('../../../../hammerhead/lib/url_util'),
    CookieShelf    = require('../../../../hammerhead/lib/cookie_shelf'),
    ServiceChannel = require('../../../../hammerhead/lib/service_channel'),
    testUtils      = require('../../test_utils');

var serviceChannel  = null,
    proxyServerMock = null,
    watchdog        = null;

exports['Service channel'] = {
    setUp: function (done) {
        var proxyServerMockApp = express();

        proxyServerMockApp.all('/*', function (req, res) {
            var chunks = [];

            var proxyCtxMock = {
                req:     req,
                res:     res,
                reqBody: []
            };

            req.on('data', function (chunk) {
                chunks.push(chunk);
            });

            req.on('end', function () {
                proxyCtxMock.reqBody = Buffer.concat(chunks);

                if (ServiceChannel.shouldProcess(proxyCtxMock.req.url))
                    serviceChannel.process(proxyCtxMock);
                else
                    res.end('Not processed');
            });
        });

        proxyServerMock = proxyServerMockApp.listen(testUtils.TEST_CAFE_PROXY_PORT);
        serviceChannel  = new ServiceChannel(testUtils.TEST_CAFE_PROXY_PORT, testUtils.TEST_CAFE_CROSS_DOMAIN_PROXY_PORT, '127.0.0.1', new CookieShelf(), {});
        watchdog        = new testUtils.Watchdog();
        done();
    },

    tearDown: function (done) {
        watchdog.shrink();
        proxyServerMock.close();

        process.nextTick(function () {
            done();
        });
    },

    'Register static resource': function (t) {
        var url1 = serviceChannel.registerStaticResource('/script', {
                contentType: 'text/javascript',
                content:     'testscript'
            }),
            url2 = serviceChannel.registerStaticResource('/images/sprite.png', {
                contentType: 'image/png',
                content:     'testimage'
            });

        t.expect(9);

        async.series([
            function (next) {
                request(url1, function (err, res, body) {
                    t.strictEqual(res.statusCode, 200);
                    t.strictEqual(res.headers['content-type'], 'text/javascript');
                    t.strictEqual(res.headers['cache-control'], 'max-age=3600, public');
                    t.strictEqual(body, 'testscript');
                    next();
                });
            },

            function (next) {
                request(url2, function (err, res, body) {
                    t.strictEqual(res.statusCode, 200);
                    t.strictEqual(res.headers['content-type'], 'image/png');
                    t.strictEqual(res.headers['cache-control'], 'max-age=3600, public');
                    t.strictEqual(body, 'testimage');
                    next();
                });
            },
            function (next) {
                var regularUrl = url.format({
                    protocol: 'http:',
                    hostname: '127.0.0.1',
                    port:     testUtils.TEST_CAFE_PROXY_PORT,
                    pathname: '/somePath'
                });

                request(regularUrl, function (err, res, body) {
                    t.strictEqual(body, 'Not processed');
                    next();
                });
            }
        ], t.done);
    },

    'TestCafe script': function (t) {
        var refererUrl = urlUtil.getProxyUrl('http://test.com/', '127.0.0.1', testUtils.TEST_CAFE_PROXY_PORT, 'testUid', 'testToken');

        t.expect(7);

        serviceChannel.events.for('testToken').listen('taskScriptRequested', function (refererInfo, cookie, callback) {
            t.strictEqual(refererInfo.jobInfo.uid, 'testUid');
            t.strictEqual(refererInfo.originResourceInfo.url, 'http://test.com/');
            t.strictEqual(refererInfo.resourceType, null);
            callback('TestContent');
        });

        var options = {
            url:     serviceChannel.taskScriptUrl,
            headers: {
                referer: refererUrl
            }
        };

        request(options, function (err, res, body) {
            t.ok(/TestContent([\s}\(\);])*$/.test(body));
            t.strictEqual(res.headers['content-type'], 'application/x-javascript');
            t.strictEqual(res.headers['cache-control'], 'no-cache, no-store, must-revalidate');
            t.strictEqual(res.headers['pragma'], 'no-cache');
            t.done();
        });
    },

    'TestCafe iFrame script': function (t) {    //T180798
        var refererUrl = urlUtil.getProxyUrl('http://test.com/', '127.0.0.1', testUtils.TEST_CAFE_PROXY_PORT, 'testUid', 'testToken', urlUtil.IFRAME);

        t.expect(7);

        serviceChannel.events.for('testToken').listen('taskScriptRequested', function (refererInfo, cookie, callback) {
            t.strictEqual(refererInfo.jobInfo.uid, 'testUid');
            t.strictEqual(refererInfo.originResourceInfo.url, 'http://test.com/');
            t.strictEqual(refererInfo.resourceType, urlUtil.IFRAME);
            callback('TestContent');
        });

        var options = {
            url:     serviceChannel.iframeTaskScriptUrl,
            headers: {
                referer: refererUrl
            }
        };

        request(options, function (err, res, body) {
            t.ok(/TestContent([\s}\(\);])*$/.test(body));
            t.strictEqual(res.headers['content-type'], 'application/x-javascript');
            t.strictEqual(res.headers['cache-control'], 'no-cache, no-store, must-revalidate');
            t.strictEqual(res.headers['pragma'], 'no-cache');
            t.done();
        });
    },

    'Service msgs': function (t) {
        t.expect(5);

        serviceChannel.events.for('TestToken').listen('serviceMsg', function (msg, sendServiceResponse) {
            t.strictEqual(msg.cmd, 'TestCmd');
            t.strictEqual(msg.jobUid, 'TestUid');
            t.strictEqual(msg.jobOwnerToken, 'TestToken');

            sendServiceResponse({
                result1: 'test',
                result2: 42
            });
        });


        var opt = {
            url:    serviceChannel.serviceMsgUrl,
            method: 'POST',
            body:   JSON.stringify({
                cmd:           'TestCmd',
                jobUid:        'TestUid',
                jobOwnerToken: 'TestToken'
            })
        };

        request(opt, function (err, res, body) {
            var respObj = JSON.parse(body);

            t.strictEqual(respObj.result1, 'test');
            t.strictEqual(respObj.result2, 42);

            t.done();
        });
    }
};