var request            = require('request'),
    util               = require('util'),
    os                 = require('os'),
    fs                 = require('fs'),
    url                = require('url'),
    express            = require('express'),
    testUtils          = require('../../test_utils'),
    Hammerhead         = require('../../../../hammerhead').Hammerhead,
    sharedConst        = require('../../../../hammerhead/shared/const'),
    cmd                = require('../../../../hammerhead/shared/service_msg_cmd'),
    ERR                = require('../../../../hammerhead/lib/server_errs'),
    requestAgent       = require('../../../../hammerhead/lib/request-agent'),
    DestinationRequest = require('../../../../hammerhead/lib/destination-request'),
    windowsDomain      = require('../../../../hammerhead/lib/windows-domain'),
    path               = require('path');

var server = null;

var originApp       = null,
    originAppServer = null,
    watchdog        = null;

exports['Proxy'] = {
    setUp: function (done) {
        originApp = express();

        originApp.post('/', function (req, res) {
            var data = '';

            req.on('data', function (chunk) {
                data += chunk.toString();
            });

            req.on('end', function () {
                res.send(data);
            });
        });

        originApp.get('/', function (req, res) {
            res.set('set-cookie', 'Test=value; Path=/');
            res.end();
        });

        originApp.get('/getStylesheet', function (req, res) {
            res.end(fs.readFileSync(path.join(__dirname, '../data/proxy/stylesheet_processing/src.css')).toString());
        });

        originApp.get('/getManifest', function (req, res) {
            res.set('content-type', 'text/cache-manifest');
            res.end(fs.readFileSync(path.join(__dirname, '../data/proxy/manifest_processing/src.manifest')).toString());
        });

        originApp.get('/getScript', function (req, res) {
            res.set('content-type', 'text/html; charset=utf-8');
            res.end(fs.readFileSync(path.join(__dirname, '../data/proxy/script_processing/src.js')).toString());
        });

        originApp.get('/getJSONP', function (req, res) {
            res.set('content-type', 'application/json');
            res.end(fs.readFileSync(path.join(__dirname, '../data/proxy/JSONP_processing/src')).toString());
        });

        originApp.get('/allowAnyXhrOrigin', function (req, res) {
            res.set('access-control-allow-origin', '*');
            res.end('42');
        });

        originApp.get('/allowXhrOrigin', function (req, res) {
            res.set('access-control-allow-origin', req.headers['origin']);
            res.end('42');
        });

        originApp.get('/echoCookie', function (req, res) {
            res.set('x-echo-cookie', req.headers['cookie']);
            res.end();
        });

        originApp.get('/getPage', function (req, res) {
            res.set('content-encoding', 'gzip');
            res.set('content-type', 'text/html; charset=utf-8');
            res.send('42');
        });

        originApp.get('/requireAuth', function (req, res) {
            var authHeader = req.headers['authorization'];

            if (authHeader) {
                var expectedAuthCredentials = 'testUsername:testPassword',
                    expectedAuthHeader      = 'Basic ' + new Buffer(expectedAuthCredentials).toString('base64');

                if (authHeader === expectedAuthHeader) {
                    res.send('42');
                    return;
                }
            }

            res.status(401);
            res.set('www-authenticate', 'Basic');
            res.end();
        });

        originApp.all('/*', function (req, res, next) {
            res.send('42');
        });

        originAppServer = originApp.listen(testUtils.ORIGIN_SERVER_PORT);

        var hammerhead = new Hammerhead(testUtils.TEST_CAFE_PROXY_PORT, testUtils.TEST_CAFE_CROSS_DOMAIN_PROXY_PORT, '127.0.0.1');
        server         = hammerhead.proxy.server;
        server.start();
        watchdog       = new testUtils.Watchdog();
        done();
    },

    tearDown: function (done) {
        watchdog.shrink();
        requestAgent.resetKeepAliveConnections();
        server.close();
        originAppServer.close();
        process.nextTick(function () {
            done();
        });
    },

    'Proxy error transfers to client': function (t) {
        var reqUrl = server.getProxyUrl(url.format({
            protocol: 'http',
            host:     testUtils.ORIGIN_SERVER_HOST
        }), 'MyUID', 'ownerToken');

        t.expect(1);

        server._sendOriginRequest = function (ctx) {
            server._error(ctx);
        };

        request(reqUrl, function (err, res, body) {
            t.equal(500, res.statusCode);
            t.done();
        });
    },

    'Proxy request, ensure events are called and appropriate response returned': function (t) {
        var reqBody = 'Tesssssssssssssst',
            reqUrl  = server.getProxyUrl(url.format({
                protocol: 'http',
                host:     testUtils.ORIGIN_SERVER_HOST
            }), 'MyUID', 'ownerToken');

        t.expect(3);

        server.events.for('ownerToken').listen('originResponse', function (ctx, callback) {
            t.ok(ctx);
            t.ok(!ctx.contentInfo.isPage);
            callback();
        });

        var options = {
            method: 'POST',
            body:   reqBody,
            url:    reqUrl
        };

        request(options, function (err, res, body) {
            t.strictEqual(body, reqBody);
            t.done();
        });
    },

    'Handle unresolvable URL (missing DNS record for host)': function (t) {
        var ownerToken = 'ownerToken',
            reqUrl     = server.getProxyUrl('http://www.some-unresolvable.url', 'MyUID', ownerToken);

        t.expect(1);

        server.events.for(ownerToken).listen('error', function (ctx, err) {
            t.strictEqual(err.code, ERR.PROXY_CANT_RESOLVE_ORIGIN_URL);
            ctx.res.end();
        });

        request(reqUrl, t.done);
    },

    'Service message': function (t) {
        var ownerToken = 'ownerToken',
            options    = {
                method:  'POST',
                url:     server.serviceChannel.serviceMsgUrl,
                body:    JSON.stringify({
                    cmd:           'testCmd',
                    data:          'testData',
                    jobOwnerToken: ownerToken,
                    jodUid:        'jobUid'
                }),
                headers: {}
            };

        t.expect(3);

        server.serviceChannel.events.for(ownerToken).listen('serviceMsg', function (msg, sendSerivceResponse) {
            t.strictEqual(msg.cmd, 'testCmd');
            t.strictEqual(msg.data, 'testData');
            sendSerivceResponse('test');
        });

        request(options, function (err, res, body) {
            t.strictEqual(JSON.parse(body), 'test');
            t.done();
        });
    },

    'Client cookies': function (t) {
        var ownerToken = 'ownerToken',
            jobUid     = 'testUid',
            reqUrl     = server.getProxyUrl(url.format({
                protocol: 'http',
                host:     testUtils.ORIGIN_SERVER_HOST
            }), 'MyUID'),
            options    = {
                method:  'POST',
                url:     server.serviceChannel.serviceMsgUrl,
                headers: {},
                body:    JSON.stringify({
                    cmd:           cmd.SET_COOKIE,
                    url:           reqUrl,
                    cookie:        'Test=Data',
                    jobOwnerToken: ownerToken,
                    jobUid:        jobUid
                })
            };

        request(options, function (err, res, body) {
            t.strictEqual(body, JSON.stringify('Test=Data'));
            t.done();
        });
    },

    'Port is already in use': function (t) {
        var secondServer = (new Hammerhead(testUtils.TEST_CAFE_PROXY_PORT)).proxy.server;

        secondServer.events.broadcast.listen('fatalError', function (err) {
            t.strictEqual(err.code, ERR.PROXY_PORT_IS_ALREADY_IN_USE);
            t.strictEqual(err.port, testUtils.TEST_CAFE_PROXY_PORT);
            t.done();
        });

        secondServer.start();
    },

    'Determine page request': function (t) {
        var reqUrl = server.getProxyUrl(url.format({
            protocol: 'http',
            host:     testUtils.ORIGIN_SERVER_HOST,
            pathname: '/getPage'
        }), 'MyUID', 'ownerToken');

        var options = {
            url:     reqUrl,
            headers: {
                accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        };

        t.expect(3);

        server.events.for('ownerToken').listen('originResponse', function (ctx) {
            t.ok(ctx.contentInfo.isPage);
            t.strictEqual(ctx.contentInfo.encoding, 'gzip');
            t.strictEqual(ctx.contentInfo.charset, 'utf-8');
            ctx.res.end();
        });

        request(options, t.done);
    },

    'XHR Same Origin Policy - request from another domain': function (t) {
        t.expect(3);

        var reqUrl = server.getProxyUrl(url.format({
            protocol: 'http',
            host:     testUtils.ORIGIN_SERVER_HOST,
            pathname: '/getPage'
        }), 'MyUID', 'ownerToken');

        var options = {
            url:     reqUrl,
            headers: {
                referer: server.getProxyUrl(url.format({
                    protocol: 'http',
                    host:     'www.some.domain'
                }), 'MyUID', 'ownerToken')
            }
        };

        options.headers[sharedConst.XHR_REQUEST_MARKER_HEADER] = 0x00.toString();

        server.events.for('ownerToken').listen('error', function (ctx, err) {
            t.strictEqual(err.code, ERR.PROXY_XHR_REQUEST_SAME_ORIGIN_POLICY_VIOLATION);
        });

        request(options, function (err, res, body) {
            t.strictEqual(res.statusCode, 0);
            t.ok(!body);
            t.done();
        });
    },

    'Skip XHR page requests': function (t) {
        var pageUrl            = url.format({
                protocol: 'http',
                host:     testUtils.ORIGIN_SERVER_HOST,
                pathname: '/getPage'
            }),
            pageProxyUrl       = server.getProxyUrl(pageUrl, 'MyUID', 'ownerToken'),
            parsedPageProxyUrl = url.parse(pageProxyUrl);


        var options = {
            port:    testUtils.TEST_CAFE_PROXY_PORT,
            url:     url.format({
                protocol: parsedPageProxyUrl.protocol,
                host:     parsedPageProxyUrl.host,
                pathname: parsedPageProxyUrl.pathname
            }),
            headers: {
                accept:  'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                referer: pageProxyUrl
            }
        };

        t.expect(3);

        options.headers[sharedConst.XHR_REQUEST_MARKER_HEADER] = 1;

        server.events.for('ownerToken').listen('originResponse', function (ctx) {
            t.ok(!ctx.contentInfo.isPage);
            t.strictEqual(ctx.contentInfo.encoding, 'gzip');
            t.strictEqual(ctx.contentInfo.charset, 'utf-8');
            ctx.res.end();
        });

        request(options, t.done);
    },

    'NTLM Auth: domain/workstation detection': function (t) {
        t.expect(4);
        var credentials = { username: 'username', password: 'password' };

        windowsDomain.assign(credentials).then(function () {
            t.strictEqual(credentials.username, 'username');
            t.strictEqual(credentials.password, 'password');
            t.ok(!!credentials.domain);
            t.ok(!!credentials.workstation);
            t.done();
        });
    },

    'XHR Same Origin Policy - "preflight" request': function (t) {
        t.expect(3);

        var reqUrl = server.getProxyUrl(url.format({
            protocol: 'http',
            host:     testUtils.ORIGIN_SERVER_HOST,
            pathname: '/getPage'
        }), 'MyUID', 'ownerToken');

        var options = {
            method:  'OPTIONS',
            url:     reqUrl,
            headers: {
                referer: server.getProxyUrl(url.format({
                    protocol: 'http',
                    host:     'www.some.domain'
                }), 'MyUID', 'ownerToken')
            }
        };

        options.headers[sharedConst.XHR_REQUEST_MARKER_HEADER] = 0x00.toString();

        server.events.for('ownerToken').listen('error', function (ctx, err) {
            t.strictEqual(err.code, ERR.PROXY_XHR_REQUEST_SAME_ORIGIN_POLICY_VIOLATION);
        });

        request(options, function (err, res, body) {
            t.strictEqual(res.statusCode, 0);
            t.ok(!body);
            t.done();
        });
    },

    'XHR Same Origin Policy - CORS supported - "preflight" request': function (t) {
        var reqUrl = server.getProxyUrl(url.format({
            protocol: 'http',
            host:     testUtils.ORIGIN_SERVER_HOST,
            pathname: '/getPage'
        }), 'MyUID', 'ownerToken');

        var options = {
            method:  'OPTIONS',
            url:     reqUrl,
            headers: {
                referer: server.getProxyUrl(url.format({
                    protocol: 'http',
                    host:     'www.some.domain'
                }), 'MyUID', 'ownerToken')
            }
        };

        options.headers[sharedConst.XHR_REQUEST_MARKER_HEADER] = sharedConst.XHR_CORS_SUPPORTED_FLAG;

        request(options, function (err, res, body) {
            t.strictEqual(body, '42');
            t.done();
        });
    },

    'XHR Same Origin Policy - CORS supported - any origin allowed': function (t) {
        var reqUrl = server.getProxyUrl(url.format({
            protocol: 'http',
            host:     testUtils.ORIGIN_SERVER_HOST,
            pathname: '/allowAnyXhrOrigin'
        }), 'MyUID', 'ownerToken');

        var options = {
            url:     reqUrl,
            headers: {
                referer: server.getProxyUrl(url.format({
                    protocol: 'http',
                    host:     'www.some.domain'
                }), 'MyUID', 'ownerToken')
            }
        };

        options.headers[sharedConst.XHR_REQUEST_MARKER_HEADER] = sharedConst.XHR_CORS_SUPPORTED_FLAG;

        request(options, function (err, res, body) {
            t.strictEqual(body, '42');
            t.done();
        });
    },

    'XHR Same Origin Policy - CORS supported - origin allowed': function (t) {
        var reqUrl = server.getProxyUrl(url.format({
            protocol: 'http',
            host:     testUtils.ORIGIN_SERVER_HOST,
            pathname: '/allowXhrOrigin'
        }), 'MyUID', 'ownerToken');

        var options = {
            url:     reqUrl,
            headers: {
                referer: server.getProxyUrl(url.format({
                    protocol: 'http',
                    host:     'www.some.domain'
                }), 'MyUID', 'ownerToken'),
                origin:  'www.some.domain'
            }
        };

        options.headers[sharedConst.XHR_REQUEST_MARKER_HEADER] = sharedConst.XHR_CORS_SUPPORTED_FLAG;

        request(options, function (err, res, body) {
            t.strictEqual(body, '42');
            t.done();
        });
    },

    'Cookies management': function (t) {
        var req1Url = server.getProxyUrl(url.format({
                protocol: 'http',
                host:     testUtils.ORIGIN_SERVER_HOST
            }), 'MyUID', 'ownerToken'),
            req2Url = server.getProxyUrl(url.format({
                protocol: 'http',
                host:     testUtils.ORIGIN_SERVER_HOST,
                pathname: '/echoCookie'
            }), 'MyUID', 'ownerToken');


        request(req1Url, function () {
            request(req2Url, function (err, res, body) {
                t.strictEqual(res.headers['x-echo-cookie'], 'Test=value');
                t.done();
            });
        });
    },

    'Get resource URL replacer': function (t) {
        var ctx = {
            dest:    {
                url: 'http://www.test.domain'
            },
            jobInfo: {
                uid:        'testUid',
                ownerToken: 'testOwnerToken'
            }
        };

        var replacer    = server.getResourceUrlReplacer(ctx),
            replacedUrl = replacer('/somePath?someKey=someValue');

        t.strictEqual(replacedUrl, server.getProxyUrl('http://www.test.domain/somePath?someKey=someValue', 'testUid', 'testOwnerToken'));
        t.strictEqual(replacer('javascript:void(0);'), 'javascript:void(0);');

        t.done();
    },

    'Stylesheet processing': function (t) {
        var reqUrl = server.getProxyUrl(url.format({
            protocol: 'http',
            host:     testUtils.ORIGIN_SERVER_HOST,
            pathname: '/getStylesheet'
        }), 'MyUID', 'ownerToken');

        t.expect(1);

        var options = {
            method:  'GET',
            url:     reqUrl,
            headers: {
                accept: 'text/css'
            }
        };

        server.getResourceUrlReplacer = function () {
            return function () {
                return 'http://i.am.replaced';
            };
        };

        request(options, function (err, res, body) {
            var expectedCss = fs.readFileSync(path.join(__dirname, '../data/proxy/stylesheet_processing/expected.css')).toString();
            t.ok(testUtils.compareCode(body, expectedCss));
            t.done();
        });
    },

    'Manifest processing': function (t) {
        var reqUrl = server.getProxyUrl(url.format({
            protocol: 'http',
            host:     testUtils.ORIGIN_SERVER_HOST,
            pathname: '/getManifest'
        }), 'MyUID', 'ownerToken');

        t.expect(1);

        server.getResourceUrlReplacer = function () {
            return function () {
                return 'http://i.am.replaced';
            };
        };

        request(reqUrl, function (err, res, body) {
            var expectedManifest = fs.readFileSync(path.join(__dirname, '../data/proxy/manifest_processing/expected.manifest')).toString();

            t.ok(testUtils.compareCode(body, expectedManifest));
            t.done();
        });
    },

    'Basic authentication': function (t) {
        var jobUid     = 'MyUID',
            ownerToken = 'ownerToken',
            reqUrl     = server.getProxyUrl(url.format({
                protocol: 'http',
                host:     testUtils.ORIGIN_SERVER_HOST,
                pathname: '/requireAuth'
            }), jobUid, ownerToken);

        t.expect(3);

        server.events.for(ownerToken).listen('authCredentialsRequested', function (ctx, callback) {
            t.strictEqual(ctx.jobInfo.uid, jobUid);

            callback({
                username: 'testUsername',
                password: 'testPassword'
            });
        });

        request(reqUrl, function (err, res, body) {
            t.strictEqual(res.statusCode, 200);
            t.strictEqual(body, '42');
            t.done();
        });
    },

    'Basic authentication - wrong credentials': function (t) {
        var jobUid     = 'MyUID',
            ownerToken = 'ownerToken',
            reqUrl     = server.getProxyUrl(url.format({
                protocol: 'http',
                host:     testUtils.ORIGIN_SERVER_HOST,
                pathname: '/requireAuth'
            }), jobUid, ownerToken);

        t.expect(3);

        server.events.for(ownerToken).listen('authCredentialsRequested', function (ctx, callback) {
            t.strictEqual(ctx.jobInfo.uid, jobUid);

            callback({
                username: 'wrongUsername',
                password: 'wrongPassword'
            });
        });

        request(reqUrl, function (err, res, body) {
            t.strictEqual(res.statusCode, 401);
            t.ok(!body);
            t.done();
        });
    }
};

exports['Regression'] = {
    setUp: function (done) {
        originApp = express();

        originApp.get('/B234325', function (req, res) {
            res.set('access-control-allow-origin', 'http://some.test.site');
            res.end(req.headers['origin']);
        });

        originApp.post('/B234356', function (req, res) {
            res.end('Hi there! =)');
        });

        originApp.get('/Q557255', function (req, res) {
            res.set('content-encoding', 'gzip');
            res.send('42');
        });
        originApp.get('/echoCookie', function (req, res) {
            var cookie = req.headers['cookie'];

            if (cookie)
                res.set('x-echo-cookie', req.headers['cookie']);

            res.end();
        });
        originApp.get('/T224541', function (req, res) {
            //NOTE: hang forever
        });

        originApp.get('/T239167', function (req, res) {
            res.set('location', url.format({
                protocol: 'http',
                host:     testUtils.ORIGIN_SERVER_HOST,
                pathname: '/',
                search:   '?text=кирилица'
            }));
            // TODO FIX IT!
            res._send();
            res.end('');
        });

        originAppServer = originApp.listen(testUtils.ORIGIN_SERVER_PORT);

        server   = (new Hammerhead(testUtils.TEST_CAFE_PROXY_PORT, testUtils.TEST_CAFE_CROSS_DOMAIN_PROXY_PORT, '127.0.0.1')).proxy.server;
        server.start();
        watchdog = new testUtils.Watchdog();
        done();
    },

    tearDown: function (done) {
        watchdog.shrink();
        requestAgent.resetKeepAliveConnections();
        server.close();
        originAppServer.close();
        process.nextTick(function () {
            done();
        });
    },

    //ABOUT FIX: problem was caused by the fact that all browsers except Chrome doesn't send 'Origin'-header if
    //request URL is same as origin page. But then such request comes to proxy request become cross origin
    //and origin server may require 'Origin'-server. So we force 'Origin'-header in such cases on proxy side.
    'B234325 - TD2 - Cross origin requests XHR filter does not work appropriately during login on reddit.com in IE': function (t) {
        var originUrl = 'http://some.test.site',
            reqUrl    = server.getProxyUrl(url.format({
                protocol: 'http',
                host:     testUtils.ORIGIN_SERVER_HOST,
                pathname: '/B234325'
            }), 'MyUID', 'ownerToken');

        var options = {
            url:     reqUrl,
            headers: {
                referer: server.getProxyUrl(originUrl, 'MyUID', 'ownerToken')
            }
        };

        options.headers[sharedConst.XHR_REQUEST_MARKER_HEADER] = sharedConst.XHR_CORS_SUPPORTED_FLAG;

        request(options, function (err, res, body) {
            t.strictEqual(body, originUrl);
            t.done();
        });
    },

    'B234356 - TD2 - market.yandex.ru -  TestCafe crushes after typing in search input and pressing Enter': function (t) {
        var ownerToken = 'ownerToken',
            jobUid     = 'testUid',
            reqUrl     = 'http://test.dc5f4ce48f6.com',
            options    = {
                url:     server.serviceChannel.serviceMsgUrl,
                headers: {
                    referer: server.getProxyUrl(url.format({
                        protocol: 'http',
                        host:     testUtils.ORIGIN_SERVER_HOST,
                        pathname: '/B234356'
                    }), 'MyUID', 'testOwnerToken')
                },
                body:    JSON.stringify({
                    cmd:           cmd.SET_COOKIE,
                    url:           reqUrl,
                    cookie:        'Test=Data',
                    jobOwnerToken: ownerToken,
                    jobUid:        jobUid
                })
            };

        request(options, function (err, res, body) {
            t.strictEqual(body, JSON.stringify('Test=Data'));
            t.done();
        });
    },

    'Q557255 - TestCafe recorder doesn\'t work with page which Content-Type header is empty': function (t) {
        var reqUrl = server.getProxyUrl(url.format({
            protocol: 'http',
            host:     testUtils.ORIGIN_SERVER_HOST,
            pathname: '/Q557255'
        }), 'MyUID', 'ownerToken');

        var options = {
            url:     reqUrl,
            headers: {
                accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        };

        t.expect(3);

        server.events.for('ownerToken').listen('originResponse', function (ctx) {
            t.ok(ctx.contentInfo.isPage);
            t.strictEqual(ctx.contentInfo.encoding, 'gzip');
            t.strictEqual(ctx.contentInfo.charset, 'utf-8');
            ctx.res.end();
        });

        request(options, t.done);
    },

    // NOTE: if we don't have cookies we should not send Cookie header.
    // But previously we send empty string in this case.
    'TD15.1 - Failed to load resource: the server responded with a status of 500 (Internal Server Error) (https://seatgeek.com)': function (t) {
        var proxyUrl = server.getProxyUrl(url.format({
            protocol: 'http',
            host:     testUtils.ORIGIN_SERVER_HOST,
            pathname: '/echoCookie'
        }), 'MyUID', 'ownerToken');

        request(proxyUrl, function (err, res) {
            t.strictEqual(res.headers['x-echo-cookie'], void 0);
            t.done();
        });
    },

    'T224541: Origin resource request timeout is not processed correctly': function (t) {
        var originUrl = url.format({
                protocol: 'http',
                host:     testUtils.ORIGIN_SERVER_HOST,
                pathname: '/T224541'
            }),
            reqUrl    = server.getProxyUrl(originUrl, 'MyUID', 'ownerToken');

        var savedReqTimeout        = DestinationRequest.TIMEOUT;
        DestinationRequest.TIMEOUT = 300;

        var options = {
            url:     reqUrl,
            headers: {
                accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        };

        server.events.for('ownerToken').listen('error', function (ctx, err) {
            ctx.res.end();

            t.strictEqual(err.code, ERR.PROXY_ORIGIN_SERVER_REQUEST_TIMEOUT);
            t.strictEqual(err.destUrl, originUrl);

            DestinationRequest.TIMEOUT = savedReqTimeout;

            t.done();
        });

        request(options);
    },

    'T239167: TD15.1 - crashes search in market.yandex.ru': function (t) {
        var reqUrl = server.getProxyUrl(url.format({
            protocol: 'http',
            host:     testUtils.ORIGIN_SERVER_HOST,
            pathname: '/T239167'
        }), 'MyUID', 'ownerToken');

        request(reqUrl, function (err, res) {
            t.ok(res.headers['location'].indexOf('кирилица') !== -1);
            t.done();
        });
    }
};
