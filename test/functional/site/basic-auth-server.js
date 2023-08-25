const http            = require('http');
const express         = require('express');
const basicAuth       = require('basic-auth');
const BasicHttpServer = require('./basic-http-server');
const debug           = require('debug')('testcafe:basic-auth-server');

class BasicAuthServer extends BasicHttpServer {
    start (port) {
        const app = express();

        app.all('/redirect', function (req, res) {
            debug('/redirect');
            const credentials = basicAuth(req);

            if (!credentials || credentials.name !== 'username' || credentials.pass !== 'password') {
                res.statusCode = 401;
                res.setHeader('WWW-Authenticate', 'Basic realm="example"');

                setTimeout(() => {
                    debug('end with not authorized');
                    res.end('<html><body><div id="result">not authorized</div></body></html>');
                }, 2000);
            }
            else {
                setTimeout(() => {
                    debug('redirect to /');
                    res.redirect('/');
                }, 3000);
            }

        });

        app.all('*', function (req, res) {
            debug('*');
            const credentials = basicAuth(req);

            if (!credentials || credentials.name !== 'username' || credentials.pass !== 'password') {
                res.statusCode = 401;
                res.setHeader('WWW-Authenticate', 'Basic realm="example"');
                setTimeout(() => {
                    debug('end with not authorized');
                    res.end('<html><body><div id="result">not authorized</div></body></html>');
                }, 2000);
            }
            else {
                res.statusCode = 200;
                setTimeout(() => {
                    debug('end with authorized');
                    res.end('<html><body><div id="result">authorized</div></body></html>');
                }, 3000);
            }
        });

        this.server = http.createServer(app).listen(port);

        super.start();
    }
}

module.exports = new BasicAuthServer();
