/* eslint-disable */
class BasicHttpServer {
    constructor () {
        this.server  = null;
        this.sockets = [];
    }

    start () {
        if (!this.server)
            return;

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

        // this.server.closeAllConnections();
        
        await new Promise(resolve => {
            this.server.close((...args) => {
                console.log(`file: basic-http-server.js:32 -> BasicHttpServer -> this.server.close -> args:`, args);
                resolve();
            });
        });

        this.sockets.forEach(socket => {
            socket.destroy();
        });
    }
}

module.exports = BasicHttpServer;

