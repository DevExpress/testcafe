import { Session } from 'testcafe-hammerhead';
import CLIENT_MESSAGES from './client-messages';


export default class SessionController extends Session {
    constructor (uploadsRoot) {
        super(uploadsRoot);

        this.currentTestRun = null;

        this.injectable.scripts.push('/testcafe-core.js');
        this.injectable.scripts.push('/testcafe-ui.js');
        this.injectable.scripts.push('/testcafe-automation.js');
        this.injectable.scripts.push('/testcafe-driver.js');
        this.injectable.styles.push('/testcafe-ui-styles.css');
    }

    // Hammerhead payload
    _getPayloadScript () {
        return this.currentTestRun._getPayloadScript();
    }

    _getIframePayloadScript () {
        return this.currentTestRun._getIframePayloadScript();
    }


    // Hammerhead handlers
    getAuthCredentials () {
        return this.currentTestRun.getAuthCredentials();
    }

    handleFileDownload () {
        return this.currentTestRun.handleFileDownload();
    }

    handlePageError (ctx, err) {
        return this.currentTestRun.handlePageError(ctx, err);
    }
}

// Service message handlers
var ServiceMessages = SessionController.prototype;

ServiceMessages[CLIENT_MESSAGES.ready] = function (msg) {
    return this.currentTestRun.ready(msg);
};

ServiceMessages[CLIENT_MESSAGES.readyForBrowserManipulation] = async function (msg) {
    return this.currentTestRun.readyForBrowserManipulation(msg);
};

ServiceMessages[CLIENT_MESSAGES.waitForFileDownload] = function (msg) {
    return this.currentTestRun.waitForFileDownload(msg);
};
