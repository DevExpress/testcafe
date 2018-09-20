const http      = require('http');
const express   = require('express');
const basicAuth = require('basic-auth');


let server  = null;
let sockets = null;

function start (port) {
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

    server  = http.createServer(app).listen(port);
    sockets = [];

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
