const https                 = require('https');
const selfSignedCertificate = require('openssl-self-signed-certificate');
const BasicHttpServer       = require('./basic-http-server');
const express               = require('express');

// NOTE: browser interprets the self-signed certificate as invalid.
class InvalidCertificateHttpsServer extends BasicHttpServer {
    start (port) {
        const app = express();

        app.get('/data', (req, res) => {
            res.header('content-type', 'application/json; charset=utf-8');
            res.json({
                name:     'John Hearts',
                position: 'CTO',
            });
        });

        app.all('*', (req, res) => {
            res.status(200);
            res.send('<html><body>Page</body></html>>');
        });

        this.server = https.createServer(selfSignedCertificate, app).listen(port);

        super.start();
    }
}

module.exports = new InvalidCertificateHttpsServer();
