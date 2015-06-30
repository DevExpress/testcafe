export default class Bootstrapper {
    constructor () {
        this.src             = [];
        this.browsers        = [];
        this.filter          = null;
        this.reporter        = null;
        this.reportOutStream = null;
        this.screenshotPath  = null;
    }

    async _getBrowserConnections () {

    }

    async _getTests () {

    }

    _createReporter () {

    }

    async createRunnableConfiguration () {
        var reporter           = this._createReporter();
        var browserConnections = this._getBrowserConnections();
        var tests              = this._getTests();

        await * [browserConnections, tests];

        return { reporter, browserConnections, tests };
    }
}
