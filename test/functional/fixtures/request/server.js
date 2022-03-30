const express = require('express');
const http    = require('http');

export default class Server {
    constructor (port) {
        this.app       = express();
        this.appServer = http.createServer(this.app).listen(port);

        this._setupRoutes();
    }

    _setupRoutes () {
        this.app.get('/user', (req, res) => {
            res.send({
                name:     'John Hearts',
                position: 'CTO',
            });
        });
        this.app.post('/user', (req, res) => {
            res.send({
                message: 'Data was posted',
            });
        });
        this.app.delete('/user', (req, res) => {
            res.send({
                message: 'Data was deleted',
            });
        });
        this.app.put('/user', (req, res) => {
            res.send({
                message: 'Data was putted',
            });
        });
        this.app.patch('/user', (req, res) => {
            res.send({
                message: 'Data was patched',
            });
        });
        this.app.head('/user', (req, res) => {
            res.send();
        });
    }

    close () {
        this.appServer.close();
    }
}
