import renderTemplate from '../utils/render-template';

export default class WarningLog {
    constructor (parentLog = null) {
        this.parentLog = parentLog;
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

        if (this.parentLog)
            this.parentLog.addPlainMessage(msg);
    }
}
