var express               = require('express');
var http                  = require('http');
var path                  = require('path');
var bodyParser            = require('body-parser');
var readSync              = require('read-file-relative').readSync;
var multer                = require('multer');
var Mustache              = require('mustache');
var readFile              = require('../../../lib/utils/promisified-functions').readFile;
var quarantineModeTracker = require('../quarantine-mode-tracker');
var useragent             = require('useragent');

var storage = multer.memoryStorage();
var upload  = multer({ storage: storage });

var CONTENT_TYPES = {
    '.js':   'application/javascript',
    '.css':  'text/css',
    '.html': 'text/html',
    '.png':  'image/png'
};

var UPLOAD_SUCCESS_PAGE_TEMPLATE = readSync('./views/upload-success.html.mustache');


var Server = module.exports = function (port, basePath) {
    var server = this;

    this.app       = express().use(bodyParser.urlencoded({ extended: false }));
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

    this.app.get('/download', function (req, res) {
        var filePath = path.join(server.basePath, '../../package.json');

        res.download(filePath);
    });

    this.app.get('/get-browser-name', function (req, res) {
        const agent = useragent.parse(req.headers['user-agent']);

        res.end(agent.family);
    });

    this.app.get('*', function (req, res) {
        var reqPath      = req.params[0] || '';
        var resourcePath = path.join(server.basePath, reqPath);
        var delay        = req.query.delay ? parseInt(req.query.delay, 10) : 0;

        readFile(resourcePath)
            .then(function (content) {
                res.setHeader('content-type', CONTENT_TYPES[path.extname(resourcePath)]);

                setTimeout(function () {
                    res.send(content);
                }, delay);
            })
            .catch(function () {
                res.status(404);
                res.send('Not found');
            });
    });

    this.app.post('/quarantine-mode/failing-sequence', function (req, res) {
        res.send(quarantineModeTracker.handleFailingSequence(req.headers['user-agent']));
    });

    this.app.post('/quarantine-mode/passing-sequence', function (req, res) {
        res.send(quarantineModeTracker.handlePassingSequence(req.headers['user-agent']));
    });

    this.app.post('/do-login/', function (req, res) {
        res.setHeader('set-cookie', 'name=' + req.body.name);
        res.end('Logged in!');
    });

    this.app.post('/set-token/', function (req, res) {
        res.setHeader('set-cookie', 'token=' + req.body.token);
        res.redirect(req.headers['referer']);
    });

    this.app.post('/file-upload', upload.any(), function (req, res) {
        var filesData = req.files.map(function (file) {
            return file.buffer.toString();
        });

        res.end(Mustache.render(UPLOAD_SUCCESS_PAGE_TEMPLATE, { uploadedDataArray: filesData }));
    });

    this.app.post('/xhr/:delay', function (req, res) {
        var delay = req.params.delay || 0;

        setTimeout(function () {
            res.send(delay.toString());
        }, delay);
    });
};

Server.prototype.close = function () {
    this.appServer.close();
    this.sockets.forEach(function (socket) {
        socket.destroy();
    });
};
