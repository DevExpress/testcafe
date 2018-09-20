import renderTemplate from '../utils/render-template';

export default class WarningLog {
    constructor () {
        this.messages = [];
    }

    addWarning () {
        const msg = renderTemplate.apply(null, arguments);

        // NOTE: avoid duplicates
        if (this.messages.indexOf(msg) < 0)
            this.messages.push(msg);
    }
}
