var express               = require('express');
var http                  = require('http');
var fs                    = require('fs');
var path                  = require('path');
var promisify             = require('../../../lib/utils/promisify');
var quarantineModeTracker = require('../quarantine-mode-tracker');


var CONTENT_TYPES = {
    '.js':   'application/javascript',
    '.css':  'text/css',
    '.html': 'text/html',
    '.png':  'image/png'
};

var readFile = promisify(fs.readFile);

var Server = module.exports = function (port, basePath) {
    var server = this;

    this.app       = express();
    this.appServer = http.createServer(this.app).listen(port);
    this.sockets   = [];
    this.basePath  = basePath;

    this._setupRoutes();

    var handler = function (socket) {
        server.sockets.push(socket);
        socket.on('close', function () {
            server.sockets.splice(server.sockets.indexOf(socket), 1);
        });
    };

    this.appServer.on('connection', handler);
};

Server.prototype._setupRoutes = function () {
    var server = this;

    this.app.get('*', function (req, res) {
        var reqPath      = req.params[0] || '';
        var resourcePath = path.join(server.basePath, reqPath);

        readFile(resourcePath)
            .then(function (content) {
                res.setHeader('content-type', CONTENT_TYPES[path.extname(resourcePath)]);
                res.send(content);
            })
            .catch(function () {
                res.sendStatus(404);
            });
    });

    this.app.post('/quarantine-mode/failing-sequence', function (req, res) {
        res.send(quarantineModeTracker.handleFailingSequence(req.headers['user-agent']));
    });

    this.app.post('/quarantine-mode/passing-sequence', function (req, res) {
        res.send(quarantineModeTracker.handlePassingSequence(req.headers['user-agent']));
    });
};

Server.prototype.close = function () {
    this.appServer.close();
    this.sockets.forEach(function (socket) {
        socket.destroy();
    });
};
