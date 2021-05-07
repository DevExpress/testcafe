const express               = require('express');
const http                  = require('http');
const path                  = require('path');
const bodyParser            = require('body-parser');
const readSync              = require('read-file-relative').readSync;
const multer                = require('multer');
const Mustache              = require('mustache');
const readFile              = require('../../../lib/utils/promisified-functions').readFile;
const quarantineModeTracker = require('../quarantine-mode-tracker');
const parseUserAgent        = require('../../../lib/utils/parse-user-agent');

const storage = multer.memoryStorage();
const upload  = multer({ storage: storage });

const CONTENT_TYPES = {
    '.js':   'application/javascript',
    '.css':  'text/css',
    '.html': 'text/html',
    '.png':  'image/png',
    '.zip':  'application/zip',
    '.pdf':  'application/pdf',
    '.xml':  'application/xml',
};

const NON_CACHEABLE_PAGES = [
    '/fixtures/api/es-next/roles/pages',
    '/fixtures/api/es-next/request-hooks/pages',
    '/fixtures/regression/gh-2015/pages',
    '/fixtures/regression/gh-2282/pages'
];

const UPLOAD_SUCCESS_PAGE_TEMPLATE = readSync('./views/upload-success.html.mustache');

const shouldCachePage = function (reqUrl) {
    return NON_CACHEABLE_PAGES.every(pagePrefix => !reqUrl.startsWith(pagePrefix));
};

const Server = module.exports = function (port, basePath) {
    const server = this;

    this.app       = express().use(bodyParser.urlencoded({ extended: false }));
    this.appServer = http.createServer(this.app).listen(port);
    this.sockets   = [];
    this.basePath  = basePath;

    this._setupRoutes();

    const handler = function (socket) {
        server.sockets.push(socket);
        socket.on('close', function () {
            server.sockets.splice(server.sockets.indexOf(socket), 1);
        });
    };

    this.appServer.on('connection', handler);
};

Server.prototype._setupRoutes = function () {
    const server = this;

    this.app.get('/download', function (req, res) {
        const filePath = path.join(server.basePath, '../../package.json');

        res.download(filePath);
    });

    this.app.get('/get-browser-name', function (req, res) {
        const parsedUA = parseUserAgent(req.headers['user-agent']);

        res.end(parsedUA.name);
    });

    this.app.get('/i4855', (req, res) => {
        res.send(`
            <html>
                <body>
                    <script>
                        var driver = window['%testCafeDriverInstance%'];

                        function closeWindowAfter1Sec () {
                            window.setTimeout(() =>{
                                window.close();
                            }, 1000);
                        }

                        driver._onExecuteSelectorCommand = function () {
                            closeWindowAfter1Sec();
                        };

                        driver._onExecuteClientFunctionCommand = function() {
                            closeWindowAfter1Sec();
                        };
                    </script>
                </body>
            </html>
        `);
    });

    this.app.get('*', function (req, res) {
        const reqPath      = req.params[0] || '';
        const resourcePath = path.join(server.basePath, reqPath);
        const delay        = req.query.delay ? parseInt(req.query.delay, 10) : 0;

        readFile(resourcePath)
            .then(function (content) {
                res.setHeader('content-type', CONTENT_TYPES[path.extname(resourcePath)]);

                if (shouldCachePage(reqPath))
                    res.setHeader('cache-control', 'max-age=3600');

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

    this.app.post('/set-token-and-close', (req, res) => {
        res.setHeader('set-cookie', 'token=' + req.body.token);
        res.send(`
            <html>
                <body>
                    <script>
                        window.close();
                    </script>
                </body>
            </html>
        `);
    });

    this.app.post('/file-upload', upload.any(), function (req, res) {
        const filesData = req.files.map(function (file) {
            return file.buffer.toString();
        });

        res.end(Mustache.render(UPLOAD_SUCCESS_PAGE_TEMPLATE, { uploadedDataArray: filesData }));
    });

    this.app.post('/xhr/:delay', function (req, res) {
        const delay = req.params.delay || 0;

        setTimeout(function () {
            res.send(delay.toString());
        }, delay);
    });

    this.app.post('/echo-custom-request-headers-in-response-headers', (req, res) => {
        Object.keys(req.headers).forEach(headerName => {
            if (headerName.startsWith('x-header-'))
                res.setHeader(headerName, req.headers[headerName]);
        });

        res.end();
    });
};

Server.prototype.close = function () {
    this.appServer.close();
    this.sockets.forEach(function (socket) {
        socket.destroy();
    });
};
