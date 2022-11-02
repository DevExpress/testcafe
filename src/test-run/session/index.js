import { Session } from 'testcafe-hammerhead';

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

    handleAttachment (data) {
        return this.currentTestRun.handleAttachment(data);
    }

    handlePageError (ctx, err) {
        return this.currentTestRun.handlePageError(ctx, err);
    }
}
