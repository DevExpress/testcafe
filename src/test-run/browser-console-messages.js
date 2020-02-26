// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

export default class BrowserConsoleMessages {
    constructor (data) {
        this.concat(data);
    }

    ensureMessageContainer (windowId) {
        if (this[windowId])
            return;

        this[windowId] = {
            log:   [],
            info:  [],
            warn:  [],
            error: []
        };
    }

    concat (consoleMessages) {
        if (!consoleMessages)
            return this;

        Object.keys(consoleMessages).forEach(windowId => {
            this.ensureMessageContainer(windowId);

            this[windowId].log   = this[windowId].log.concat(consoleMessages[windowId].log);
            this[windowId].info  = this[windowId].info.concat(consoleMessages[windowId].info);
            this[windowId].warn  = this[windowId].warn.concat(consoleMessages[windowId].warn);
            this[windowId].error = this[windowId].error.concat(consoleMessages[windowId].error);
        });

        return this;
    }

    addMessage (type, msg, windowId) {
        this.ensureMessageContainer(windowId);

        this[windowId][type].push(msg);
    }

    getCopy () {
        const copy = {};

        Object.keys(this).forEach(windowId => {
            copy[windowId] = {
                log:   this[windowId].log.slice(),
                info:  this[windowId].info.slice(),
                warn:  this[windowId].warn.slice(),
                error: this[windowId].error.slice()
            };
        });

        return copy;
    }
}
