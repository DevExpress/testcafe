var http   = require('http');
var urlLib = require('url');

var ProxyServer = module.exports = function (port) {
    var server = this;

    this.sockets = [];

    function handler (socket) {
        server.sockets.push(socket);

        socket.on('close', function () {
            server.sockets.splice(server.sockets.indexOf(socket), 1);
        });
    }

    this.appServer = http.createServer(ProxyServer._onRequest);
    this.appServer.on('connection', handler);
    this.appServer.listen(port);
};

ProxyServer._onRequest = function (req, res) {
    var options = urlLib.parse(req.url);

    options.method  = req.method;
    options.headers = req.headers;

    var proxyReq = http.request(options);

    proxyReq.on('response', function (proxyRes) {
        var response = '';

        proxyRes.on('data', function (chunk) {
            response += chunk.toString();
        });

        proxyRes.on('end', function () {
            var pageTitleRe    = /<title>([\w\s]+)<\/title>/;
            var pageTitleMatch = response.match(pageTitleRe);
            var pageTitle      = pageTitleMatch && pageTitleMatch[1];

            response = response.replace(pageTitleRe, '<title>(Proxy) ' + pageTitle + '</title>');

            proxyRes.headers['content-length'] = response.length;

            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            res.end(response);
        });
    });

    req.on('data', function (chunk) {
        proxyReq.write(chunk, 'binary');
    });

    req.on('end', function () {
        proxyReq.end();
    });
};

ProxyServer.prototype.close = function () {
    this.sockets.forEach(function (socket) {
        socket.destroy();
    });
};
