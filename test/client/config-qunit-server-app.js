var url  = require('url');
var fs   = require('fs');
var path = require('path');

var createShadowStylesheet = require('testcafe-hammerhead/lib/shadow-ui/create-shadow-stylesheet');


//The following code is copied from testcafe-hammerhead
//NOTE: Url rewrite proxied requests (e.g. for iframes), so they will hit our server
function urlRewriteProxyRequest (req, res, next) {
    var proxiedUrlPartRegExp = /^\/\S+?\/(https?:)/;

    if (proxiedUrlPartRegExp.test(req.url)) {
        // NOTE: store original URL so we can sent it back for testing purposes (see GET xhr-test route).
        req.originalUrl = req.url;

        var reqUrl = req.url.replace(proxiedUrlPartRegExp, '$1');

        //NOTE: create host-relative URL
        var parsedUrl = url.parse(reqUrl);

        parsedUrl.host     = null;
        parsedUrl.hostname = null;
        parsedUrl.port     = null;
        parsedUrl.protocol = null;
        parsedUrl.slashes  = false;
        req.url            = url.format(parsedUrl);
    }
    next();
}

function preventCaching (res) {
    res.setHeader('cache-control', 'no-cache, no-store, must-revalidate');
    res.setHeader('pragma', 'no-cache');
}


module.exports = function (app) {
    app.use(urlRewriteProxyRequest);

    app.get('/wrap-responseText-test/:isJSON', function (req, res) {
        var isJSON       = req.params.isJSON === 'json';
        var responseText = isJSON ?
            '{tag: "a", location: "location", attribute: {src: "example.com"}}' :
            '<a href="example.com"><img src="img.png"></a>';

        res.send(responseText);
    });

    app.all('/xhr-test/:delay', function (req, res) {
        var delay = req.params.delay || 0;

        preventCaching(res);

        setTimeout(function () {
            res.send(req.query.expectedResponse || req.originalUrl || req.url);
        }, delay);
    });

    app.get('/testcafe-ui-sprite.png', function (req, res) {
        fs.readFile(path.join(__dirname, '../../lib/client/ui/sprite.png'), function (err, image) {
            res.set('Content-Type', 'image/png');
            res.send(image);
        });
    });

    app.get('/close-request', function (req) {
        req.destroy();
    });

    app.all('/styles.css', function (req, res) {
        fs.readFile(path.join(__dirname, '../../lib/client/ui/styles.css'), function (err, css) {
            res.set('Content-Type', 'text/css');
            res.send(createShadowStylesheet(css.toString()));
        });
    });
};
