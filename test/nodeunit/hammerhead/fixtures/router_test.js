var Router = require('../../../../hammerhead/lib/router');

exports['Basic routing'] = function (t) {
    var router          = new Router();
    var calledHandlerId = null;
    var routeParams     = null;

    router.GET('/yo/42/test/', function () {
        calledHandlerId = 'get';
    });

    router.POST('/yo/42/test/', function () {
        calledHandlerId = 'post';
    });

    router.GET('/yo/42/hammerhead', function () {
        calledHandlerId = 'no-trailing-slash';
    });

    router.GET('/yo/{param1}/{param2}/', function (req, res, params) {
        calledHandlerId = 'get-with-params';
        routeParams     = params;
    });

    router.POST('/yo/{param1}/{param2}/', function (req, res, params) {
        calledHandlerId = 'post-with-params';
        routeParams     = params;
    });

    router.GET('/{greetings}/42/hammerhead', function (req, res, params) {
        calledHandlerId = 'with-params-no-trailing-slash';
        routeParams     = params;
    });

    function testRoute (url, method, expectedHandlerId, expectedParams) {
        calledHandlerId = null;
        routeParams     = null;

        t.ok(router._route({ url: url, method: method }));
        t.strictEqual(calledHandlerId, expectedHandlerId);

        if (expectedParams)
            t.deepEqual(routeParams, expectedParams);
    }

    testRoute('/yo/42/test/', 'GET', 'get');
    testRoute('/yo/42/test/#check12', 'GET', 'get');
    testRoute('/yo/42/test#check12', 'GET', 'get');
    testRoute('/yo/42/test?yep', 'GET', 'get');
    testRoute('/yo/42/test/?yep', 'GET', 'get');
    testRoute('/yo/42/test/?yep#check12', 'GET', 'get');
    testRoute('/yo/42/test?yep#check12#check21', 'GET', 'get');

    testRoute('/yo/42/test/', 'POST', 'post');
    testRoute('/yo/42/hammerhead/', 'GET', 'no-trailing-slash');
    testRoute('/yo/42/hammerhead', 'GET', 'no-trailing-slash');

    testRoute('/yo/something/awesome', 'GET', 'get-with-params', {
        param1: 'something',
        param2: 'awesome'
    });

    testRoute('/yo/the/router', 'POST', 'post-with-params', {
        param1: 'the',
        param2: 'router'
    });

    testRoute('/hi-there/42/hammerhead', 'GET', 'with-params-no-trailing-slash', { greetings: 'hi-there' });
    testRoute('/hi-there/42/hammerhead/', 'GET', 'with-params-no-trailing-slash', { greetings: 'hi-there' });

    t.ok(!router._route({ url: '/some/unknown/url', method: 'GET' }));
    t.ok(!router._route({ url: '/yet/another/url', method: 'POST' }));

    t.done();
};

exports['Static resources'] = function (t) {
    var router = new Router();

    function testRoute (url, handler) {
        var resMock = {
            headers: {},
            content: null,

            setHeader: function (name, value) {
                this.headers[name] = value;
            },

            end: function (content) {
                this.content = content;
            }
        };

        router._route({ url: url, method: 'GET' }, resMock);
        t.strictEqual(resMock.content, handler.content);
        t.strictEqual(resMock.headers['content-type'], handler.contentType);
        t.strictEqual(resMock.headers['cache-control'], 'max-age=3600, public');
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
    testRoute('/some/static/js/', jsHandler);
    testRoute('/some/static/css/', cssHandler);

    t.done();
};