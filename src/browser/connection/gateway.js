import { readSync as read } from 'read-file-relative';
import { respond404, respond500, respondWithJSON, redirect, preventCaching } from '../../utils/http';
import RemotesQueue from './remotes-queue';

const IDLE_PAGE_SCRIPT = read('../../client/browser/idle-page/index.js');
const IDLE_PAGE_STYLE  = read('../../client/browser/idle-page/styles.css');
const IDLE_PAGE_LOGO   = read('../../client/browser/idle-page/logo.svg', true);

export default class BrowserConnectionGateway {
    constructor (proxy, options = {}) {
        this.connections  = {};
        this.remotesQueue = new RemotesQueue();
        this.domain       = proxy.server1Info.domain;

        this.connectUrl = `${this.domain}/browser/connect`;

        this.retryTestPages = options.retryTestPages;

        this._registerRoutes(proxy);
    }

    _dispatch (url, proxy, handler, method = 'GET') {
        proxy[method](url, (req, res, si, params) => {
            const connection = this.connections[params.id];

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
        this._dispatch('/browser/idle-forced/{id}', proxy, BrowserConnectionGateway.onIdleForced);
        this._dispatch('/browser/status/{id}', proxy, BrowserConnectionGateway.onStatusRequest);
        this._dispatch('/browser/status-done/{id}', proxy, BrowserConnectionGateway.onStatusRequestOnTestDone);
        this._dispatch('/browser/init-script/{id}', proxy, BrowserConnectionGateway.onInitScriptRequest);
        this._dispatch('/browser/init-script/{id}', proxy, BrowserConnectionGateway.onInitScriptResponse, 'POST');
        this._dispatch('/browser/active-page-id/{id}', proxy, BrowserConnectionGateway._onGetActivePageIdRequest);
        this._dispatch('/browser/active-page-id/{id}', proxy, BrowserConnectionGateway._onSetActivePageIdRequest, 'POST');

        proxy.GET('/browser/connect', (req, res) => this._connectNextRemoteBrowser(req, res));
        proxy.GET('/browser/connect/', (req, res) => this._connectNextRemoteBrowser(req, res));

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

    static _fetchRequestData (req, callback) {
        let data = '';

        req.on('data', chunk => {
            data += chunk;
        });

        req.on('end', () => {
            callback(data.toString());
        });
    }


    // Route handlers
    static onConnection (req, res, connection) {
        if (connection.ready)
            respond500(res, 'The connection is already established.');

        else {
            const userAgent = req.headers['user-agent'];

            connection.establish(userAgent);
            redirect(res, connection.idleUrl);
        }
    }

    static onHeartbeat (req, res, connection) {
        if (BrowserConnectionGateway.ensureConnectionReady(res, connection)) {
            const status = connection.heartbeat();

            respondWithJSON(res, status);
        }
    }

    static onIdle (req, res, connection) {
        if (BrowserConnectionGateway.ensureConnectionReady(res, connection))
            res.end(connection.renderIdlePage());
    }

    static async onIdleForced (req, res, connection) {
        if (BrowserConnectionGateway.ensureConnectionReady(res, connection)) {
            const status = await connection.getStatus(true);

            redirect(res, status.url);
        }
    }

    static async onStatusRequest (req, res, connection) {
        return BrowserConnectionGateway._onStatusRequestCore(req, res, connection, false);
    }

    static async onStatusRequestOnTestDone (req, res, connection) {
        return BrowserConnectionGateway._onStatusRequestCore(req, res, connection, true);
    }

    static async _onStatusRequestCore (req, res, connection, isTestDone) {
        if (BrowserConnectionGateway.ensureConnectionReady(res, connection)) {
            const status = await connection.getStatus(isTestDone);

            respondWithJSON(res, status);
        }
    }

    static onInitScriptRequest (req, res, connection) {
        if (BrowserConnectionGateway.ensureConnectionReady(res, connection)) {
            const script = connection.getInitScript();

            respondWithJSON(res, script);
        }
    }

    static onInitScriptResponse (req, res, connection) {
        if (BrowserConnectionGateway.ensureConnectionReady(res, connection)) {
            BrowserConnectionGateway._fetchRequestData(req, data => {
                connection.handleInitScriptResult(data);

                res.end();
            });
        }
    }

    static _onGetActivePageIdRequest (req, res, connection) {
        if (BrowserConnectionGateway.ensureConnectionReady(res, connection)) {
            respondWithJSON(res, {
                activePageId: connection.activePageId
            });
        }
    }

    static _onSetActivePageIdRequest (req, res, connection) {
        if (BrowserConnectionGateway.ensureConnectionReady(res, connection)) {
            BrowserConnectionGateway._fetchRequestData(req, data => {
                const parsedData = JSON.parse(data);

                connection.activePageId = parsedData.pageId;

                respondWithJSON(res);
            });
        }
    }

    async _connectNextRemoteBrowser (req, res) {
        preventCaching(res);

        const remoteConnection = await this.remotesQueue.shift();

        if (remoteConnection)
            redirect(res, remoteConnection.url);
        else
            respond500(res, 'There are no available connections to establish.');
    }

    // API
    startServingConnection (connection) {
        this.connections[connection.id] = connection;

        if (connection.browserInfo.providerName === 'remote')
            this.remotesQueue.add(connection);
    }

    stopServingConnection (connection) {
        delete this.connections[connection.id];

        if (connection.browserInfo.providerName === 'remote')
            this.remotesQueue.remove(connection);
    }

    close () {
        Object.keys(this.connections).forEach(id => this.connections[id].close());
    }
}

