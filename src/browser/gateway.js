import { respond404, redirect } from '../utils/http';
import read from '../utils/read-file-relative';


// Const
const IDLE_PAGE_SCRIPT = read('./idle-page/index.js');
const IDLE_PAGE_STYLE  = read('./idle-page/styles.css');


// Gateway
export default class BrowserConnectionGateway {
    constructor (proxy) {
        this.connections = {};
        this.domain      = proxy.server1Info.domain;

        this._registerRoutes(proxy);
    }


    _registerRoutes (proxy) {
        proxy.GET('./browser/assets/index.js', { content: IDLE_PAGE_SCRIPT, contentType: 'application/x-javascript' });
        proxy.GET('./browser/assets/style.css', { content: IDLE_PAGE_STYLE, contentType: 'text/css' });

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
        this.connections[id] = connection;
    }

    stopServingConnection (connection) {
        delete this.connections[connection.id];
    }
}