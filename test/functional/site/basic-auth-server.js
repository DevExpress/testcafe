const http            = require('http');
const express         = require('express');
const basicAuth       = require('basic-auth');
const BasicHttpServer = require('./basic-http-server');

class BasicAuthServer extends BasicHttpServer {
    start (port) {
        const app = express();

        app.all('*', function (req, res) {
            const credentials = basicAuth(req);

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

        this.server = http.createServer(app).listen(port);

        super.start();
    }
}

module.exports = new BasicAuthServer();
