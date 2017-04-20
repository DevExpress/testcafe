var http   = require('http');
var urlLib = require('url');

var server  = null;
var sockets = null;

function start (port) {
    var keepAliveAgent = new http.Agent({ keepAlive: true });

    sockets = [];

    server = http
        .createServer()
        .listen(port);

    server
        .on('request', (req, res) => {
            var reqOptions = urlLib.parse(req.url);

            reqOptions.method  = req.method;
            reqOptions.headers = req.headers;
            reqOptions.agent   = keepAliveAgent;

            var serverReq = http.request(reqOptions, function (serverRes) {
                res.writeHead(serverRes.statusCode, serverRes.headers);
                serverRes.pipe(res);
            });

            req.pipe(serverReq);
        });

    var connectionHandler = function (socket) {
        sockets.push(socket);

        socket.on('close', function () {
            sockets.splice(sockets.indexOf(socket), 1);
        });
    };

    server.on('connection', connectionHandler);
}

function shutdown () {
    server.close();

    sockets.forEach(socket => {
        socket.destroy();
    });
}

module.exports = { start: start, shutdown: shutdown };
