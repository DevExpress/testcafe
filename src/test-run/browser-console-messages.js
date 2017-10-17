// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------
import Assignable from '../utils/assignable';


export default class BrowserConsoleMessages extends Assignable {
    constructor (obj) {
        super();

        this.log   = [];
        this.info  = [];
        this.warn  = [];
        this.error = [];

        this._assignFrom(obj);
    }

    _getAssignableProperties () {
        return [
            { name: 'log' },
            { name: 'info' },
            { name: 'warn' },
            { name: 'error' }
        ];
    }

    concat (consoleMessages) {
        this.log   = this.log.concat(consoleMessages.log);
        this.info  = this.info.concat(consoleMessages.info);
        this.warn  = this.warn.concat(consoleMessages.warn);
        this.error = this.error.concat(consoleMessages.error);
    }

    addMessage (type, msg) {
        this[type].push(msg);
    }

    getCopy () {
        var copy = {};
        var properties = this._getAssignableProperties();

        for (const property of properties)
            copy[property.name] = this[property.name].slice();

        return copy;
    }
}
