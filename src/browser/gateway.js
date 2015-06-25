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

    _dispatch (url, proxy, handler) {
        proxy.GET(url, (req, res, si, params) => {
            var connection = this.connections[params.id];

            if (connection)
                handler(req, res, connection);
            else
                respond404(res);
        });
    }

    _registerRoutes (proxy) {
        this._dispatch('/browser/connect/{id}', proxy, BrowserConnectionGateway.onConnection);
        this._dispatch('/browser/heartbeat/{id}', proxy, BrowserConnectionGateway.onHeartbeat);
        this._dispatch('/browser/idle/{id}', proxy, BrowserConnectionGateway.onIdle);
        this._dispatch('/browser/status/{id}', proxy, BrowserConnectionGateway.onStatusRequest);

        proxy.GET('./browser/assets/index.js', { content: IDLE_PAGE_SCRIPT, contentType: 'application/x-javascript' });
        proxy.GET('./browser/assets/style.css', { content: IDLE_PAGE_STYLE, contentType: 'text/css' });
    }

    static onConnection (req, res, connection) {
        var userAgent = req.headers['user-agent'];

        connection.establish(userAgent);
        redirect(res, connection.idleUrl);
    }

    static onHeartbeat (req, res, connection) {
        connection.heartbeat();
        res.end();
    }

    static onIdle (req, res, connection) {
        res.end(connection.renderIdlePage());
    }

    static onStatusRequest (req, res, connection) {
        res.end(connection.getStatus());
    }


    // API
    startServingConnection (connection) {
        this.connections[id] = connection;
    }

    stopServingConnection (connection) {
        delete this.connections[connection.id];
    }
}