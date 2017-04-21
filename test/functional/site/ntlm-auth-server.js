var http    = require('http');
var express = require('express');
var ntlm    = require('express-ntlm');

var server  = null;
var sockets = null;

function start (port) {
    var app = express();

    app.use(ntlm());

    app.all('*', function (req, res) {
        res.end('<html><body><div id="result">' + JSON.stringify(req.ntlm) + '</div></body></html>');
    });

    server  = http.createServer(app).listen(port);
    sockets = [];

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
