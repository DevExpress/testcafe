const express    = require('express');
const bodyParser = require('body-parser');
const http       = require('http');

const responses = {
    getResult: {
        name:     'John Hearts',
        position: 'CTO',
    },
    getLoadingResult: {},
    handlePostResult: (data) => {
        return {
            message: 'Data was posted',
            data,
        };
    },
    handleDeleteResult: (data) => ({
        message: 'Data was deleted',
        data,
    }),
    handlePutResult: (data) => ({
        message: 'Data was putted',
        data,
    }),
    handlePatchResult: (data) => ({
        message: 'Data was patched',
        data,
    }),
};

class Server {
    constructor (port) {
        this.app       = express();
        this.appServer = http.createServer(this.app).listen(port);

        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());
        this._setupRoutes();
    }

    _setupRoutes () {
        this.app.post('/auth/basic', (req, res) => {
            res.send({
                token: req.rawHeaders[req.rawHeaders.indexOf('Authorization') + 1],
            });
        });

        this.app.post('/auth/bearer', (req, res) => {
            res.send(req.rawHeaders[req.rawHeaders.indexOf('Authorization') + 1] ? 'authorized' : 'un-authorized');
        });

        this.app.post('/auth/key', (req, res) => {
            res.send(req.rawHeaders[req.rawHeaders.indexOf('API-KEY') + 1] ? 'authorized' : 'un-authorized');
        });

        this.app.get('/user', (req, res) => {
            res.send(responses.getResult);
        });
        this.app.get('/user/loading', (req, res) => {
            setTimeout(() => {
                responses.getLoadingResult = responses.getResult;
            }, 100);

            res.send(responses.getLoadingResult);
        });
        this.app.post('/user', (req, res) => {
            res.send(responses.handlePostResult(req.body));
        });
        this.app.delete('/user', (req, res) => {
            res.send(responses.handleDeleteResult(req.body));
        });
        this.app.put('/user', (req, res) => {
            res.send(responses.handlePutResult(req.body));
        });
        this.app.patch('/user', (req, res) => {
            res.send(responses.handlePatchResult(req.body));
        });
        this.app.head('/user', (req, res) => {
            res.send();
        });
    }

    close () {
        this.appServer.close();
    }
}

module.exports = Server;
