import path from 'path';
import { Session } from 'testcafe-hammerhead';
import { UNSTABLE_NETWORK_MODE_HEADER } from '../browser/connection/unstable-network-mode';


const ACTIVE_SESSIONS_MAP = {};
const UPLOADS_DIR_NAME = '_uploads_';

export default class SessionController extends Session {
    constructor (uploadRoots) {
        super(uploadRoots);

        this.currentTestRun = null;
    }

    // Hammerhead payload
    _getPayloadScript () {
        return this.currentTestRun._getPayloadScript();
    }

    _getIframePayloadScript () {
        return this.currentTestRun._getIframePayloadScript();
    }


    // Hammerhead handlers
    handleServiceMessage (msg, serverInfo) {
        if (this.currentTestRun[msg.cmd])
            return super.handleServiceMessage.call(this.currentTestRun, msg, serverInfo);

        return super.handleServiceMessage(msg, serverInfo);
    }

    getAuthCredentials () {
        return this.currentTestRun.getAuthCredentials();
    }

    handleFileDownload () {
        return this.currentTestRun.handleFileDownload();
    }

    handlePageError (ctx, err) {
        return this.currentTestRun.handlePageError(ctx, err);
    }

    onPageRequest (ctx) {
        const pendingStateSnapshot = this.pendingStateSnapshot;

        super.onPageRequest(ctx);

        if (pendingStateSnapshot && ctx.req.headers[UNSTABLE_NETWORK_MODE_HEADER])
            this.pendingStateSnapshot = pendingStateSnapshot;
    }
    // API
    static getSession (testRun) {
        let sessionInfo = ACTIVE_SESSIONS_MAP[testRun.browserConnection.id];

        if (!sessionInfo || !testRun.disablePageReloads) {
            if (sessionInfo && sessionInfo.url)
                SessionController.closeSession(testRun);

            let session = null;

            if (testRun.test.isLegacy)
                session = testRun;
            else {
                const fixtureDir = path.dirname(testRun.test.fixture.path);

                session = new SessionController([
                    path.resolve(UPLOADS_DIR_NAME),
                    path.resolve(fixtureDir, UPLOADS_DIR_NAME),
                    fixtureDir
                ]);

                session.currentTestRun = testRun;
            }

            session.disablePageCaching   = testRun.disablePageCaching;
            session.allowMultipleWindows = testRun.allowMultipleWindows;

            if (session.allowMultipleWindows)
                session.windowId = testRun.browserConnection.activeWindowId;

            sessionInfo = {
                session: session,
                proxy:   null,
                url:     null
            };

            ACTIVE_SESSIONS_MAP[testRun.browserConnection.id] = sessionInfo;
        }
        else if (!testRun.test.isLegacy)
            sessionInfo.session.currentTestRun = testRun;

        return sessionInfo.session;
    }

    static getSessionUrl (testRun, proxy) {
        let sessionInfo = ACTIVE_SESSIONS_MAP[testRun.browserConnection.id];

        if (!sessionInfo || testRun.test.isLegacy) {
            SessionController.getSession(testRun);

            sessionInfo = ACTIVE_SESSIONS_MAP[testRun.browserConnection.id];
        }

        if (!sessionInfo.url) {
            const pageUrl             = testRun.test.pageUrl;
            const externalProxyHost   = testRun.opts.proxy;
            let externalProxySettings = null;

            if (externalProxyHost) {
                externalProxySettings = {
                    url:         externalProxyHost,
                    bypassRules: testRun.opts.proxyBypass
                };
            }

            sessionInfo.proxy = proxy;
            sessionInfo.url   = proxy.openSession(pageUrl, sessionInfo.session, externalProxySettings);
        }

        return sessionInfo.url;
    }

    static closeSession (testRun) {
        const sessionInfo = ACTIVE_SESSIONS_MAP[testRun.browserConnection.id];

        if (!sessionInfo || !sessionInfo.url || !sessionInfo.proxy)
            return;

        sessionInfo.proxy.closeSession(sessionInfo.session);

        delete ACTIVE_SESSIONS_MAP[testRun.browserConnection.id];
    }
}

