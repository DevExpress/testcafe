import path from 'path';
import { Session } from 'testcafe-hammerhead';
import TestRun from './';


const ACTIVE_SESSIONS_MAP = {};
const UPLOADS_DIR_NAME = '_uploads_';

export default class SessionController extends Session {
    constructor (uploadRoots, options) {
        super(uploadRoots, options);

        this.currentTestRun = null;
    }

    // Hammerhead payload
    async getPayloadScript () {
        return this.currentTestRun.getPayloadScript();
    }

    async getIframePayloadScript () {
        return this.currentTestRun.getIframePayloadScript();
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

                const uploadRoots = [
                    path.resolve(UPLOADS_DIR_NAME),
                    path.resolve(fixtureDir, UPLOADS_DIR_NAME),
                    fixtureDir
                ];

                const options = {
                    disablePageCaching:   testRun.disablePageCaching,
                    allowMultipleWindows: TestRun.isMultipleWindowsAllowed(testRun),
                    requestTimeout:       testRun.requestTimeout
                };

                if (options.allowMultipleWindows)
                    options.windowId = testRun.browserConnection.activeWindowId;

                session = new SessionController(uploadRoots, options);

                session.currentTestRun = testRun;
            }

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

