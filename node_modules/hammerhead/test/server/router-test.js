var expect = require('chai').expect;
var Router = require('../../lib/router');
var hash   = require('../../lib/utils/hash');

describe('Router', function () {
    it('Should route requests', function () {
        var router          = new Router();
        var calledHandlerId = null;
        var routeParams     = null;

        router.GET('/yo/42/test/', function () {
            calledHandlerId = 'get';
        });

        router.POST('/yo/42/test/', function () {
            calledHandlerId = 'post';
        });

        router.GET('/42/hammerhead', function () {
            calledHandlerId = 'no-trailing-slash';
        });

        router.GET('/yo/{param1}/{param2}', function (req, res, serverInfo, params) {
            calledHandlerId = 'get-with-params';
            routeParams     = params;
        });

        router.POST('/yo/{param1}/{param2}', function (req, res, serverInfo, params) {
            calledHandlerId = 'post-with-params';
            routeParams     = params;
        });

        function shouldRoute (url, method, expectedHandlerId, expectedParams) {
            calledHandlerId = null;
            routeParams     = null;

            expect(router._route({ url: url, method: method })).to.be.true;
            expect(calledHandlerId).eql(expectedHandlerId);

            if (expectedParams)
                expect(routeParams).eql(expectedParams);
        }

        function shouldNotRoute (url, method) {
            expect(router._route({ url: url, method: method })).to.be.false;
        }

        shouldRoute('/yo/42/test/', 'GET', 'get');
        shouldRoute('/yo/42/test/#check12', 'GET', 'get');
        shouldRoute('/yo/42/test/?yep', 'GET', 'get');
        shouldRoute('/yo/42/test/?yep#check12', 'GET', 'get');
        shouldRoute('/yo/42/test/?yep#check12#check21', 'GET', 'get');

        shouldRoute('/yo/42/test/', 'POST', 'post');

        shouldRoute('/42/hammerhead', 'GET', 'no-trailing-slash');
        shouldNotRoute('/42/hammerhead/', 'GET', 'no-trailing-slash');

        shouldRoute('/yo/something/awesome', 'GET', 'get-with-params', {
            param1: 'something',
            param2: 'awesome'
        });

        shouldRoute('/yo/the/router', 'POST', 'post-with-params', {
            param1: 'the',
            param2: 'router'
        });

        shouldNotRoute('/some/unknown/url', 'GET', 'no-trailing-slash');
    });

    it('Should provide headers and content for static resources if ETag not match', function () {
        var router = new Router();

        function testRoute (url, handler) {
            var reqMock = {
                url:     url,
                method:  'GET',
                headers: {
                    'if-none-match': 'some-random-value'
                }
            };

            var resMock = {
                headers:    {},
                content:    null,
                statusCode: null,

                setHeader: function (name, value) {
                    this.headers[name] = value;
                },

                end: function (content) {
                    this.content = content;
                }
            };


            router._route(reqMock, resMock);
            expect(resMock.content).eql(handler.content);
            expect(resMock.headers['content-type']).eql(handler.contentType);
            expect(resMock.headers['cache-control']).eql('max-age=30, must-revalidate');
        }

        var jsHandler = {
            contentType: 'application/x-javascript',
            content:     'js'
        };

        var cssHandler = {
            contentType: 'text/css',
            content:     'css'
        };

        router.GET('/some/static/js', jsHandler);
        router.GET('/some/static/css', cssHandler);

        testRoute('/some/static/js', jsHandler);
        testRoute('/some/static/css', cssHandler);
    });

    it('Should respond 304 for static resources if ETag match', function () {
        var router = new Router();

        var reqMock = {
            url:     '/some/static/js',
            method:  'GET',
            headers: {
                'if-none-match': hash('some content')
            }
        };

        var resMock = {
            headers:    {},
            content:    null,
            statusCode: null,

            setHeader: function (name, value) {
                this.headers[name] = value;
            },

            end: function (content) {
                this.content = content;
            }
        };

        router.GET('/some/static/js', {
            contentType: 'text/css',
            content:     'some content'
        });

        router._route(reqMock, resMock);

        expect(resMock.statusCode).eql(304);
        expect(resMock.content).to.be.empty;
    });


});