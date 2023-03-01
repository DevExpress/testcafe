const http            = require('http');
const express         = require('express');
const ntlm            = require('express-ntlm');
const BasicHttpServer = require('./basic-http-server');

class NtlmAuthServer extends BasicHttpServer {
    start (port) {
        const app = express();

        app.use(ntlm());

        app.all('*', function (req, res) {
            res.end('<html><body><div id="result">' + JSON.stringify(req.ntlm) + '</div></body></html>');
        });

        this.server = http.createServer(app).listen(port);

        super.start();
    }
}

module.exports = new NtlmAuthServer();
