const express = require('express');
const http    = require('http');

const data = {
    getResult: {
        name:     'John Hearts',
        position: 'CTO',
    },
    getLoadingResult: {
    },
    postResult: {
        message: 'Data was posted',
    },
    deleteResult: {
        message: 'Data was deleted',
    },
    putResult: {
        message: 'Data was putted',
    },
    patchResult: {
        message: 'Data was patched',
    },
};

class Server {
    constructor (port) {
        this.app       = express();
        this.appServer = http.createServer(this.app).listen(port);

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
            res.send(data.getResult);
        });
        this.app.get('/user/loading', (req, res) => {
            setTimeout(() => {
                data.getLoadingResult = data.getResult;
            }, 100);

            res.send(data.getLoadingResult);
        });
        this.app.post('/user', (req, res) => {
            res.send(data.postResult);
        });
        this.app.delete('/user', (req, res) => {
            res.send(data.deleteResult);
        });
        this.app.put('/user', (req, res) => {
            res.send(data.putResult);
        });
        this.app.patch('/user', (req, res) => {
            res.send(data.patchResult);
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
