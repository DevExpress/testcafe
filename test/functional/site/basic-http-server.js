/* eslint-disable */
const semver = require('semver');


class BasicHttpServer {
    constructor () {
        this.server  = null;
        this.sockets = [];
    }

    start () {
        if (!this.server)
            return;

        if (semver.lt(process.version, '18.2.0'))
            this._setSocketsHook();
    }

    _setSocketsHook () {
        const self = this;

        this.server.on('connection', (socket) => {
            self.sockets.push(socket);

            socket.on('close', function () {
                self.sockets.splice(self.sockets.indexOf(socket), 1);
            });
        });
    }

    async shutdown () {
        if (!this.server)
            return;

        if (semver.gte(process.version, '18.2.0'))
            this.server.closeAllConnections();
        else {
            console.log(`file: basic-http-server.js:38 -> BasicHttpServer -> this.sockets.length:`, this.sockets.length);
            this.sockets.forEach(function (socket) {
                socket.destroy();
            });
        }
        
        await new Promise(resolve => {
            this.server.close((...args) => {
                console.log(`file: basic-http-server.js:32 -> BasicHttpServer -> this.server.close -> args:`, args);
                resolve();
            });
        });
    }
}

module.exports = BasicHttpServer;

