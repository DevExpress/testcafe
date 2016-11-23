var express   = require('express');
var basicAuth = require('basic-auth');

module.exports = function create (port) {
    var app = express();

    app.all('*', function (req, res) {
        var credentials = basicAuth(req);

        if (!credentials || credentials.name !== 'username' || credentials.pass !== 'password') {
            res.statusCode = 401;
            res.setHeader('WWW-Authenticate', 'Basic realm="example"');
            res.end('<html><body><div id="result">not authorized</div></body></html>');
        }
        else {
            res.statusCode = 200;
            res.end('<html><body><div id="result">authorized</div></body></html>');
        }
    });

    return app.listen(port);
};
