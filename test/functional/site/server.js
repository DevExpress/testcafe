const express               = require('express');
const http                  = require('http');
const path                  = require('path');
const cors                  = require('cors');
const bodyParser            = require('body-parser');
const { readSync }          = require('read-file-relative');
const multer                = require('multer');
const Mustache              = require('mustache');
const { readFile }          = require('../../../lib/utils/promisified-functions');
const quarantineModeTracker = require('../quarantine-mode-tracker');
const { parseUserAgent }    = require('../../../lib/utils/parse-user-agent');

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
    '/fixtures/regression/gh-2282/pages',
];

const UPLOAD_SUCCESS_PAGE_TEMPLATE = readSync('./views/upload-success.html.mustache');

const shouldCachePage = function (reqUrl) {
    return NON_CACHEABLE_PAGES.every(pagePrefix => !reqUrl.startsWith(pagePrefix));
};

const Server = module.exports = function (port, basePath, apiRouter) {
    const server = this;

    this.app       = express().use(bodyParser.urlencoded({ extended: false }));
    this.appServer = http.createServer(this.app).listen(port);
    this.sockets   = [];
    this.basePath  = basePath;

    this.app.use(cors());

    this.app.use(bodyParser.json());

    this._setupRoutes(apiRouter);

    const handler = function (socket) {
        server.sockets.push(socket);
        socket.on('close', function () {
            server.sockets.splice(server.sockets.indexOf(socket), 1);
        });
    };

    this.appServer.on('connection', handler);
};

Server.prototype._setupRoutes = function (apiRouter) {
    const server = this;

    this.app.use('/api', apiRouter);

    this.app.get('/download', function (req, res) {
        const filePath = path.join(server.basePath, '../../package.json');

        res.download(filePath);
    });

    this.app.get('/get-browser-name', function (req, res) {
        const parsedUA = parseUserAgent(req.headers['user-agent']);

        res.end(parsedUA.name);
    });

    this.app.get('/trim-bom', (req, res) => {
        res.send(`${String.fromCharCode(65279)}<html><head><meta charset="utf-8"></head><body><button>click me</button></body></html>`);
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

    this.app.get('/redirect', (req, res) => {
        res.redirect(req.query.page);
    });

    this.app.get('/fixtures/request-pipeline/content-security-policy/pages/csp.html', (req, res, next) => {
        res.setHeader('Content-Security-Policy', 'script-src \'self\'');

        next();
    });

    this.app.get('/204', function (req, res) {
        res.status(204);
        res.end();
    });

    this.app.get('/fixtures/regression/gh-7874/', (req, res) => {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>GH-7874</title>
            </head>
            <body>
            <button onclick="btnClick()">Set Cookie</button>
            <script>
                function btnClick () {
                    document.cookie = 'inPage=val;' + document.cookie;
            
                    fetch('http://localhost:3000/get-browser-name', {
                        credentials: 'include'
                    })
                        .then(() => {
                            console.log('finished');
                        })
                }
            </script>
            </body>
            </html>
        `);
    });

    this.app.get('/fixtures/regression/gh-7529/', function (req, res) {
        const html = `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="ISO-8859-15">
                <title>GH-7529</title>
            </head>
            <body>
            <h1>codage réussi</h1>
            </body>
            </html>
        `;

        const content = Buffer.from(html, 'latin1');

        res.setHeader('content-type', 'text/html; charset=iso-8859-15');
        res.send(content);
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

    this.app.post('/file-upload-size', upload.any(), function (req, res) {
        const filesData = req.files.map(function (file) {
            return file.size;
        });

        res.end(`${filesData[0]}`);
    });

    this.app.post('/xhr/test-header', function (req, res) {
        res.send(req.headers.test);
    });

    this.app.post('/xhr/auth-header', function (req, res) {
        res.setHeader('authorization', 'authorization-string');
        res.send();
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

    this.app.options('/options', function (req, res) {
        res.send();
    });
};

Server.prototype.close = function () {
    this.appServer.close();
    this.sockets.forEach(function (socket) {
        socket.destroy();
    });
};
