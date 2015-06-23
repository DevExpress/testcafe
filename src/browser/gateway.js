import { respond404, redirect } from '../utils/http';

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

        if (connection) {
            connection.establish(userAgent);
            redirect(res, connection.idleUrl);
        }
        else
            respond404(res);
    }

    _onHeartbeat (res, id) {
        var connection = this.connections[id];

        if (connection)
            connection.heartbeat();
        else
            respond404(res);
    }

    _onIdle (res, id) {
        var connection = this.connections[id];

        if (connection)
            res.end(connection.renderIdlePage());
        else
            respond404(res);
    }

    // API
    startServingConnection (connection) {
        var id     = connection.id;
        var domain = this.proxy.server1Info.domain;
        var url    = `http://${domain}/browser/connect/${id}`;

        this.connections[id] = connection;

        return url;
    }

    stopServingConnection (connection) {
        delete this.connections[connection.id];
    }
}