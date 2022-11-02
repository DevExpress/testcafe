// API
import path from 'path';
import TestRun from '../index';
import SessionControllerFactory from './factory';

const ACTIVE_SESSIONS_MAP = {};
const UPLOADS_DIR_NAME = '_uploads_';

export function getSession (testRun) {
    let sessionInfo = ACTIVE_SESSIONS_MAP[testRun.browserConnection.id];

    if (!sessionInfo || !testRun.disablePageReloads) {
        if (sessionInfo && sessionInfo.url)
            closeSession(testRun);

        let session = null;

        if (testRun.test.isLegacy)
            session = testRun;
        else {
            const fixtureDir = path.dirname(testRun.test.fixture.path);

            const uploadRoots = [
                path.resolve(UPLOADS_DIR_NAME),
                path.resolve(fixtureDir, UPLOADS_DIR_NAME),
                fixtureDir,
            ];

            const options = {
                disablePageCaching:   testRun.disablePageCaching,
                allowMultipleWindows: TestRun.isMultipleWindowsAllowed(testRun),
                requestTimeout:       testRun.requestTimeout,
                proxyless:            testRun.opts.proxyless,
            };

            if (options.allowMultipleWindows)
                options.windowId = testRun.browserConnection.activeWindowId;

            session = SessionControllerFactory.create(uploadRoots, options);

            session.currentTestRun = testRun;
        }

        sessionInfo = {
            session: session,
            proxy:   null,
            url:     null,
        };

        ACTIVE_SESSIONS_MAP[testRun.browserConnection.id] = sessionInfo;
    }
    else if (!testRun.test.isLegacy)
        sessionInfo.session.currentTestRun = testRun;

    return sessionInfo.session;
}

export function getSessionUrl (testRun, proxy) {
    let sessionInfo = ACTIVE_SESSIONS_MAP[testRun.browserConnection.id];

    if (!sessionInfo || testRun.test.isLegacy) {
        getSession(testRun);

        sessionInfo = ACTIVE_SESSIONS_MAP[testRun.browserConnection.id];
    }

    if (!sessionInfo.url) {
        const pageUrl             = testRun.test.pageUrl;
        const externalProxyHost   = testRun.opts.proxy;
        let externalProxySettings = null;

        if (externalProxyHost) {
            externalProxySettings = {
                url:         externalProxyHost,
                bypassRules: testRun.opts.proxyBypass,
            };
        }

        sessionInfo.proxy = proxy;
        sessionInfo.url   = proxy.openSession(pageUrl, sessionInfo.session, externalProxySettings);
    }

    return sessionInfo.url;
}

export function closeSession (testRun) {
    const sessionInfo = ACTIVE_SESSIONS_MAP[testRun.browserConnection.id];

    if (!sessionInfo || !sessionInfo.url || !sessionInfo.proxy)
        return;

    sessionInfo.proxy.closeSession(sessionInfo.session);

    delete ACTIVE_SESSIONS_MAP[testRun.browserConnection.id];
}
