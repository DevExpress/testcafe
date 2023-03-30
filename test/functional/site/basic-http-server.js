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

    shutdown () {
        if (!this.server)
            return;

        this.server.closeAllConnections();

        this.server.close();

        this.sockets.forEach(socket => {
            socket.destroy();
        });
    }
}

module.exports = BasicHttpServer;

