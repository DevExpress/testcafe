const https                 = require('https');
const selfSignedCertificate = require('openssl-self-signed-certificate');
const BasicHttpServer       = require('./basic-http-server');

// NOTE: browser interprets the self-signed certificate as invalid.
class InvalidCertificateHttpsServer extends BasicHttpServer {
    start (port) {
        this.server = https.createServer(selfSignedCertificate, (req, res) => {
            res.writeHead(200);
            res.end('<html><body>Page</body></html>>');
        }).listen(port);

        super.start();
    }
}

module.exports = new InvalidCertificateHttpsServer();
