const http    = require('http');
const express = require('express');
const ntlm    = require('express-ntlm');

let server  = null;
let sockets = null;

function start (port) {
    const app = express();

    app.use(ntlm());

    app.all('*', function (req, res) {
        res.end('<html><body><div id="result">' + JSON.stringify(req.ntlm) + '</div></body></html>');
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
