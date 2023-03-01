const http            = require('http');
const urlLib          = require('url');
const BasicHttpServer = require('./basic-http-server');

class TrustedProxyServer extends BasicHttpServer {
    start (port) {
        this.server = http.createServer().listen(port);

        this.server.on('request', (req, res) => {
            const reqOptions = urlLib.parse(req.url);

            reqOptions.method = req.method;
            reqOptions.auth   = 'username:password';

            const serverReq = http.request(reqOptions, function (serverRes) {
                res.writeHead(serverRes.statusCode, serverRes.headers);
                serverRes.pipe(res);
            });

            req.pipe(serverReq);
        });

        super.start();
    }
}

module.exports = new TrustedProxyServer();
