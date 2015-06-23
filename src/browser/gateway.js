export default class BrowserConnectionGateway {
    constructor (proxy) {
        this.connections = {};
        this._registerRoutes(proxy);
    }


    _registerRoutes (proxy) {
        proxy.GET('/browser/connect/{id}', (req, res, si, params) => this._onConnection(req, res, params.id));
        proxy.GET('/browser/heartbeat/{id}', (req, res, si, params) => this._onHeartbeat(res, params.id));
        proxy.GET('/browser/idle/{id}', (req, res, si, params) => this._onIdle(res, params.id));
    }

    _onConnection (req, res, id) {
        var connection = this.connections[id];
        var userAgent  = req.headers['user-agent'];

        if (connection)
            connection.establish(userAgent);
        else
            res.statusCode = 404;

        res.end();
    }

    _onHeartbeat (res, id) {
        var connection = this.connections[id];

        if (connection)
            connection.heartbeat();
        else
            res.statusCode = 404;

        res.end();
    }

    _onIdle (res, id) {
        var connection = this.connections[id];

        if (connection)
            res.end(connection.renderIdlePage());
        else {
            res.statusCode = 404;
            res.end();
        }
    }

    // API
    startServingConnection (connection) {
        var id     = connection.id;
        var domain = this.proxy.server1Info.domain;

        connection.url       = `http://${domain}/browser/connect/${id}`;
        this.connections[id] = connection;
    }

    stopServingConnection (connection) {
        delete this.connections[connection.id];
    }
}