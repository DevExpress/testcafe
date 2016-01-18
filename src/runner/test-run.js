import path from 'path';
import { Session } from 'testcafe-hammerhead';

export default class TestRun extends Session {
    constructor (test, browserConnection, screenshotCapturer, opts) {
        var uploadsRoot = path.dirname(test.fixture.path);

        super(uploadsRoot);

        this.opts               = opts;
        this.test               = test;
        this.browserConnection  = browserConnection;
        this.screenshotCapturer = screenshotCapturer;

        this.errs = [];
    }

    _getPayloadScript () {
        // TODO
    }

    _getIframePayloadScript () {
        // TODO
    }

    getAuthCredentials () {
        // TODO
    }

    handleFileDownload () {
        // TODO
    }

    handlePageError () {
        // TODO
    }
}
