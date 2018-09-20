const http   = require('http');
const urlLib = require('url');

let server  = null;
let sockets = null;

function start (port) {
    server = http
        .createServer()
        .listen(port);

    sockets = [];

    server.on('request', (req, res) => {
        const reqOptions = urlLib.parse(req.url);

        reqOptions.method = req.method;
        reqOptions.auth   = 'username:password';

        const serverReq = http.request(reqOptions, function (serverRes) {
            res.writeHead(serverRes.statusCode, serverRes.headers);
            serverRes.pipe(res);
        });

        req.pipe(serverReq);
    });

    const connectionHandler = function (socket) {
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
