import loadAssets from '../../load-assets';
import {
    respond404,
    respond500,
    respondWithJSON,
    redirect,
    preventCaching,
} from '../../utils/http';

import RemotesQueue from './remotes-queue';
import { Proxy, acceptCrossOrigin } from 'testcafe-hammerhead';
import { Dictionary } from '../../configuration/interfaces';
import BrowserConnection from './index';
import { IncomingMessage, ServerResponse } from 'http';
import SERVICE_ROUTES from './service-routes';
import EMPTY_PAGE_MARKUP from '../../proxyless/empty-page-markup';
import PROXYLESS_ERROR_ROUTE from '../../proxyless/error-route';
import { initSelector } from '../../test-run/commands/validations/initializers';
import TestRun from '../../test-run';

export default class BrowserConnectionGateway {
    private _connections: Dictionary<BrowserConnection> = {};
    private _remotesQueue: RemotesQueue;
    public readonly connectUrl: string;
    public retryTestPages: boolean;
    private readonly proxyless: boolean;
    public readonly proxy: Proxy;

    public constructor (proxy: Proxy, options: { retryTestPages: boolean; proxyless: boolean }) {
        this._remotesQueue  = new RemotesQueue();
        this.connectUrl     = proxy.resolveRelativeServiceUrl(SERVICE_ROUTES.connect);
        this.retryTestPages = options.retryTestPages;
        this.proxyless      = options.proxyless;
        this.proxy          = proxy;

        this._registerRoutes(proxy);
    }

    private _dispatch (url: string, proxy: Proxy, handler: Function, method = 'GET', shouldAcceptCrossOrigin?: boolean): void {
        // @ts-ignore Need to improve typings of the 'testcafe-hammerhead' module
        proxy[method](url, (req: IncomingMessage, res: ServerResponse, serverInfo, params: Dictionary<string>) => {
            const connection = this._connections[params.id];

            preventCaching(res);

            if (shouldAcceptCrossOrigin)
                acceptCrossOrigin(res);

            if (connection)
                handler(req, res, connection);
            else
                respond404(res);
        });
    }

    private _registerRoutes (proxy: Proxy): void {
        const {
            idlePageScript,
            idlePageStyle,
            idlePageLogo,
            serviceWorkerScript,
        } = loadAssets();

        this._dispatch(`${SERVICE_ROUTES.connect}/{id}`, proxy, BrowserConnectionGateway._onConnection);
        this._dispatch(`${SERVICE_ROUTES.heartbeat}/{id}`, proxy, BrowserConnectionGateway._onHeartbeat, 'GET', this.proxyless);
        this._dispatch(`${SERVICE_ROUTES.idle}/{id}`, proxy, BrowserConnectionGateway._onIdle);
        this._dispatch(`${SERVICE_ROUTES.idleForced}/{id}`, proxy, BrowserConnectionGateway._onIdleForced);
        this._dispatch(`${SERVICE_ROUTES.status}/{id}`, proxy, BrowserConnectionGateway._onStatusRequest);
        this._dispatch(`${SERVICE_ROUTES.statusDone}/{id}`, proxy, BrowserConnectionGateway._onStatusRequestOnTestDone, 'GET', this.proxyless);
        this._dispatch(`${SERVICE_ROUTES.initScript}/{id}`, proxy, BrowserConnectionGateway._onInitScriptRequest);
        this._dispatch(`${SERVICE_ROUTES.initScript}/{id}`, proxy, BrowserConnectionGateway._onInitScriptResponse, 'POST');
        this._dispatch(`${SERVICE_ROUTES.activeWindowId}/{id}`, proxy, BrowserConnectionGateway._onGetActiveWindowIdRequest, 'GET', this.proxyless);
        this._dispatch(`${SERVICE_ROUTES.activeWindowId}/{id}`, proxy, BrowserConnectionGateway._onSetActiveWindowIdRequest, 'POST', this.proxyless);
        this._dispatch(`${SERVICE_ROUTES.closeWindow}/{id}`, proxy, BrowserConnectionGateway._onCloseWindowRequest, 'POST');
        this._dispatch(`${SERVICE_ROUTES.openFileProtocol}/{id}`, proxy, BrowserConnectionGateway._onOpenFileProtocolRequest, 'POST');
        this._dispatch(`${SERVICE_ROUTES.dispatchProxylessEvent}/{id}`, proxy, BrowserConnectionGateway._onDispatchProxylessEvent, 'POST', this.proxyless);
        this._dispatch(`${SERVICE_ROUTES.parseSelector}/{id}`, proxy, BrowserConnectionGateway._parseSelector, 'POST', this.proxyless);
        this._dispatch(`${SERVICE_ROUTES.dispatchProxylessEventSequence}/{id}`, proxy, BrowserConnectionGateway._onDispatchProxylessEventSequence, 'POST', this.proxyless);

        proxy.GET(SERVICE_ROUTES.connect, (req: IncomingMessage, res: ServerResponse) => this._connectNextRemoteBrowser(req, res));
        proxy.GET(SERVICE_ROUTES.connectWithTrailingSlash, (req: IncomingMessage, res: ServerResponse) => this._connectNextRemoteBrowser(req, res));

        proxy.GET(SERVICE_ROUTES.serviceWorker, { content: serviceWorkerScript, contentType: 'application/x-javascript' });
        proxy.GET(SERVICE_ROUTES.assets.index, { content: idlePageScript, contentType: 'application/x-javascript' });
        proxy.GET(SERVICE_ROUTES.assets.styles, { content: idlePageStyle, contentType: 'text/css' });
        proxy.GET(SERVICE_ROUTES.assets.logo, { content: idlePageLogo, contentType: 'image/svg+xml' });

        if (this.proxyless) {
            proxy.GET(PROXYLESS_ERROR_ROUTE, (req: IncomingMessage, res: ServerResponse) => {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(EMPTY_PAGE_MARKUP);
            });
        }
    }

    // Helpers
    private static _ensureConnectionReady (res: ServerResponse, connection: BrowserConnection): boolean {
        if (!connection.isReady()) {
            respond500(res, 'The connection is not ready yet.');
            return false;
        }

        return true;
    }

    private static _fetchRequestData (req: IncomingMessage, callback: (data: string) => void): void {
        let data = '';

        req.on('data', chunk => {
            data += chunk;
        });

        req.on('end', () => {
            callback(data.toString());
        });
    }

    // Route handlers
    private static async _onConnection (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection): Promise<void> {
        if (connection.isReady())
            respond500(res, 'The connection is already established.');

        else {
            const userAgent = req.headers['user-agent'] as string;

            await connection.establish(userAgent);
            redirect(res, connection.idleUrl);
        }
    }

    private static _onHeartbeat (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection): void {
        if (BrowserConnectionGateway._ensureConnectionReady(res, connection)) {
            const status = connection.heartbeat();

            respondWithJSON(res, status);
        }
    }

    private static _onIdle (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection): void {
        if (BrowserConnectionGateway._ensureConnectionReady(res, connection))
            res.end(connection.renderIdlePage());
    }

    private static async _onIdleForced (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection): Promise<void> {
        if (BrowserConnectionGateway._ensureConnectionReady(res, connection)) {
            const status = await connection.getStatus(true);

            redirect(res, status.url);
        }
    }

    private static async _onStatusRequest (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection): Promise<void> {
        return BrowserConnectionGateway._onStatusRequestCore(req, res, connection, false);
    }

    private static async _onStatusRequestOnTestDone (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection): Promise<void> {
        return BrowserConnectionGateway._onStatusRequestCore(req, res, connection, true);
    }

    private static async _onStatusRequestCore (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection, isTestDone: boolean): Promise<void> {
        if (BrowserConnectionGateway._ensureConnectionReady(res, connection)) {
            const status = await connection.getStatus(isTestDone);

            respondWithJSON(res, status);
        }
    }

    private static _onInitScriptRequest (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection): void {
        if (BrowserConnectionGateway._ensureConnectionReady(res, connection)) {
            const script = connection.getInitScript();

            respondWithJSON(res, script);
        }
    }

    private static _onInitScriptResponse (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection): void {
        if (BrowserConnectionGateway._ensureConnectionReady(res, connection)) {
            BrowserConnectionGateway._fetchRequestData(req, data => {
                connection.handleInitScriptResult(data);

                res.end();
            });
        }
    }

    private static _onGetActiveWindowIdRequest (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection): void {
        if (BrowserConnectionGateway._ensureConnectionReady(res, connection)) {
            respondWithJSON(res, {
                activeWindowId: connection.activeWindowId,
            });
        }
    }

    private static _onSetActiveWindowIdRequest (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection): void {
        if (BrowserConnectionGateway._ensureConnectionReady(res, connection)) {
            BrowserConnectionGateway._fetchRequestData(req, data => {
                const parsedData = JSON.parse(data);

                connection.activeWindowId = parsedData.windowId;

                respondWithJSON(res);
            });
        }
    }

    private static _onCloseWindowRequest (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection): void {
        if (BrowserConnectionGateway._ensureConnectionReady(res, connection)) {
            connection.provider.closeBrowserChildWindow(connection.id)
                .then(() => {
                    respondWithJSON(res);
                });
        }
    }

    private static _onOpenFileProtocolRequest (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection): void {
        if (BrowserConnectionGateway._ensureConnectionReady(res, connection)) {
            BrowserConnectionGateway._fetchRequestData(req, data => {
                const parsedData = JSON.parse(data);

                connection.openFileProtocol(parsedData.url)
                    .then(() => {
                        respondWithJSON(res);
                    });
            });
        }
    }

    private static _onDispatchProxylessEvent (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection): void {
        if (BrowserConnectionGateway._ensureConnectionReady(res, connection)) {
            BrowserConnectionGateway._fetchRequestData(req, data => {
                const { type, options } = JSON.parse(data);

                connection.dispatchProxylessEvent(type, options)
                    .then(() => {
                        respondWithJSON(res);
                    });
            });
        }
    }

    private static _onDispatchProxylessEventSequence (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection): void {
        if (BrowserConnectionGateway._ensureConnectionReady(res, connection)) {
            BrowserConnectionGateway._fetchRequestData(req, data => {
                const eventSequence = JSON.parse(data);

                connection.dispatchProxylessEventSequence(eventSequence)
                    .then(() => {
                        respondWithJSON(res);
                    });
            });
        }
    }

    private async _connectNextRemoteBrowser (req: IncomingMessage, res: ServerResponse): Promise<void> {
        preventCaching(res);

        const remoteConnection = await this._remotesQueue.shift();

        if (remoteConnection)
            redirect(res, remoteConnection.url);
        else
            respond500(res, 'There are no available _connections to establish.');
    }

    private static _getParsedSelector (testRun: TestRun, rawSelector: string): any {
        const options = {
            testRun,

            skipVisibilityCheck: true,
            collectionMode:      true,
        };

        const value    = rawSelector.trim().startsWith('Selector(') ? rawSelector : `'${rawSelector}'`;
        const selector = { type: 'js-expr', value };

        return initSelector('selector', selector, options);
    }

    private static _parseSelector (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection): void {
        if (BrowserConnectionGateway._ensureConnectionReady(res, connection)) {
            BrowserConnectionGateway._fetchRequestData(req, data => {
                try {
                    const testRun        = connection.getCurrentTestRun();
                    const rawSelector    = JSON.parse(data).selector;
                    const parsedSelector = BrowserConnectionGateway._getParsedSelector(testRun, rawSelector);

                    respondWithJSON(res, parsedSelector);
                }
                catch (error) {
                    respondWithJSON(res);
                }
            });
        }
    }

    // API
    public startServingConnection (connection: BrowserConnection): void {
        this._connections[connection.id] = connection;

        if (connection.browserInfo.providerName === 'remote')
            this._remotesQueue.add(connection);
    }

    public stopServingConnection (connection: BrowserConnection): void {
        delete this._connections[connection.id];

        if (connection.browserInfo.providerName === 'remote')
            this._remotesQueue.remove(connection);
    }

    public async close (): Promise<void> {
        for (const id in this._connections)
            await this._connections[id].close();
    }

    public getConnections (): Dictionary<BrowserConnection> {
        return this._connections;
    }
}

