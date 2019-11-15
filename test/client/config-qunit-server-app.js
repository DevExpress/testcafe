const url  = require('url');
const fs   = require('fs');
const path = require('path');

const createShadowStylesheet = require('testcafe-hammerhead/lib/shadow-ui/create-shadow-stylesheet');


//The following code is copied from testcafe-hammerhead
//NOTE: Url rewrite proxied requests (e.g. for iframes), so they will hit our server
function urlRewriteProxyRequest (req, res, next) {
    const proxiedUrlPartRegExp = /^\/\S+?\/(https?:)/;

    if (proxiedUrlPartRegExp.test(req.url)) {
        // NOTE: store original URL so we can sent it back for testing purposes (see GET xhr-test route).
        req.originalUrl = req.url;

        const reqUrl = req.url.replace(proxiedUrlPartRegExp, '$1');

        //NOTE: create host-relative URL
        const parsedUrl = url.parse(reqUrl);

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
        const isJSON       = req.params.isJSON === 'json';
        const responseText = isJSON ?
            '{tag: "a", location: "location", attribute: {src: "example.com"}}' :
            '<a href="example.com"><img src="img.png"></a>';

        res.send(responseText);
    });

    app.get('/transport-worker.js', function (req, res) {
        res
            .set('content-type', 'application/javascript')
            .send(fs.readFileSync(path.join(__dirname, '../../node_modules/testcafe-hammerhead/lib/client/transport-worker.js')));
    });

    app.all('/xhr-test/:delay', function (req, res) {
        const delay = req.params.delay || 0;

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
