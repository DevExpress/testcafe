import renderTemplate from '../utils/render-template';

export default class WarningLog {
    constructor (globalLog = null) {
        this.globalLog = globalLog;
        this.messages  = [];
    }

    addPlainMessage (msg) {
        // NOTE: avoid duplicates
        if (this.messages.indexOf(msg) < 0)
            this.messages.push(msg);
    }

    addWarning () {
        const msg = renderTemplate.apply(null, arguments);

        this.addPlainMessage(msg);

        if (this.globalLog)
            this.globalLog.addPlainMessage(msg);
    }
}
