var http   = require('http');
var urlLib = require('url');

var server  = null;
var sockets = null;

var agentsCache = {};

function start (port) {
    sockets = [];

    server = http
        .createServer()
        .listen(port);

    server
        .on('request', (req, res) => {
            var reqOptions = urlLib.parse(req.url);

            reqOptions.method  = req.method;
            reqOptions.headers = req.headers;

            if (!agentsCache[reqOptions.headers['user-agent']])
                agentsCache[reqOptions.headers['user-agent']] = new http.Agent({ keepAlive: true });

            reqOptions.agent = agentsCache[reqOptions.headers['user-agent']];

            var serverReq = http.request(reqOptions, function (serverRes) {
                res.writeHead(serverRes.statusCode, serverRes.headers);

                if (serverRes.headers.connection && serverRes.headers.connection === 'close')
                    delete agentsCache[reqOptions.headers['user-agent']];

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
