const http            = require('http');
const urlLib          = require('url');
const BasicHttpServer = require('./basic-http-server');

class TransparentProxyServer extends BasicHttpServer {
    constructor () {
        super();

        this.agentsCache = {};
    }

    _getUserAgent (reqOptions) {
        return reqOptions.headers['user-agent'];
    }

    start (port) {
        this.server = http.createServer().listen(port);

        this.server
            .on('request', (req, res) => {
                const reqOptions = urlLib.parse(req.url);
                const self       = this;

                reqOptions.method  = req.method;
                reqOptions.headers = req.headers;

                const userAgent = this._getUserAgent(reqOptions);

                if (!this.agentsCache[userAgent])
                    this.agentsCache[userAgent] = new http.Agent({ keepAlive: true });

                reqOptions.agent = this.agentsCache[userAgent];

                const serverReq = http.request(reqOptions, function (serverRes) {
                    res.writeHead(serverRes.statusCode, serverRes.headers);

                    if (serverRes.headers.connection && serverRes.headers.connection === 'close')
                        delete self.agentsCache[self._getUserAgent(reqOptions)];

                    serverRes.pipe(res);
                });

                req.pipe(serverReq);
            });

        super.start();
    }
}

module.exports = new TransparentProxyServer();
