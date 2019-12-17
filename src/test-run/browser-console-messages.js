// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

export default class BrowserConsoleMessages {
    constructor (data) {
        this.concat(data);
    }

    _ensurePageIdMessageContainer (pageId) {
        if (this[pageId])
            return;

        this[pageId] = {
            log:   [],
            info:  [],
            warn:  [],
            error: []
        };
    }

    concat (consoleMessages) {
        if (!consoleMessages)
            return this;

        Object.keys(consoleMessages).forEach(pageId => {
            this._ensurePageIdMessageContainer(pageId);

            this[pageId].log   = this[pageId].log.concat(consoleMessages[pageId].log);
            this[pageId].info  = this[pageId].info.concat(consoleMessages[pageId].info);
            this[pageId].warn  = this[pageId].warn.concat(consoleMessages[pageId].warn);
            this[pageId].error = this[pageId].error.concat(consoleMessages[pageId].error);
        });

        return this;
    }

    addMessage (type, msg, pageId) {
        this._ensurePageIdMessageContainer(pageId);

        this[pageId][type].push(msg);
    }

    getCopy () {
        const copy = {};

        Object.keys(this).forEach(pageId => {
            copy[pageId] = {
                log:   this[pageId].log.slice(),
                info:  this[pageId].info.slice(),
                warn:  this[pageId].warn.slice(),
                error: this[pageId].error.slice()
            };
        });

        return copy;
    }
}
