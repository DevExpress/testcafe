import { readSync as read } from 'read-file-relative';
import { respond404, respond500, respondWithJSON, redirect, preventCaching } from '../utils/http';


// Const
const IDLE_PAGE_SCRIPT = read('../client/browser/idle-page/index.js');
const IDLE_PAGE_STYLE  = read('../client/browser/idle-page/styles.css');
const IDLE_PAGE_LOGO   = read('../client/browser/idle-page/logo.svg', true);


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

            preventCaching(res);

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

        proxy.GET('/browser/assets/index.js', { content: IDLE_PAGE_SCRIPT, contentType: 'application/x-javascript' });
        proxy.GET('/browser/assets/styles.css', { content: IDLE_PAGE_STYLE, contentType: 'text/css' });
        proxy.GET('/browser/assets/logo.svg', { content: IDLE_PAGE_LOGO, contentType: 'image/svg+xml' });
    }

    // Helpers
    static ensureConnectionReady (res, connection) {
        if (!connection.ready) {
            respond500(res, 'The connection is not ready yet.');
            return false;
        }

        return true;
    }


    // Route handlers
    static onConnection (req, res, connection) {
        if (connection.ready)
            respond500(res, 'The connection is already established.');

        else {
            var userAgent = req.headers['user-agent'];

            connection.establish(userAgent);
            redirect(res, connection.idleUrl);
        }
    }

    static onHeartbeat (req, res, connection) {
        if (BrowserConnectionGateway.ensureConnectionReady(res, connection)) {
            connection.heartbeat();
            res.end();
        }
    }

    static onIdle (req, res, connection) {
        if (BrowserConnectionGateway.ensureConnectionReady(res, connection))
            res.end(connection.renderIdlePage());
    }

    static onStatusRequest (req, res, connection) {
        if (BrowserConnectionGateway.ensureConnectionReady(res, connection)) {
            var status = connection.getStatus();

            respondWithJSON(res, status);
        }
    }


    // API
    startServingConnection (connection) {
        this.connections[connection.id] = connection;
    }

    stopServingConnection (connection) {
        delete this.connections[connection.id];
    }
}
