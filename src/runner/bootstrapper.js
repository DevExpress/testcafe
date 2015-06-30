import Promise from 'promise';
import browserInstallations from '../browser/installations';
import BrowserConnection from '../browser/connection';
import LocalBrowserConnection from '../browser/local-connection';


export default class Bootstrapper {
    static BROWSER_CONNECTION_READY_TIMEOUT = 30 * 1000;

    constructor (browserConnectionGateway) {
        this.browserConnectionGateway = browserConnectionGateway;

        this.src             = [];
        this.browsers        = [];
        this.filter          = null;
        this.reporter        = null;
        this.reportOutStream = null;
        this.screenshotPath  = null;
    }

    static _convertBrowserAliasToBrowserInfo (browser) {
        if (typeof browser === 'string') {
            browser = browserInstallations.getInfo(browser);

            if (!browser) {
                //TODO throw error here
            }
        }

        return browser;
    }

    _createConnectionFromBrowserInfo (browser) {
        if (!(browser instanceof BrowserConnection))
            browser = new LocalBrowserConnection(this.browserConnectionGateway, browser);

        return browser;
    }

    async _getBrowserConnections () {
        var browserConnections = this.browsers
            .map(Bootstrapper._convertBrowserAliasToBrowserInfo)
            .map(browser => this._createConnectionFromBrowserInfo(browser));

        var readyTimeout = setTimeout(()=> { /* TODO throw error here */ });

        await * browserConnections
            .filter(connection => !connection.ready)
            .map(connection => new Promise(resolve => connection.once('ready', resolve)));

        clearTimeout(readyTimeout);

        return browserConnections;
    }

    async _getTests () {
        //TODO
    }

    _createReporter () {
        //TODO
    }

    async createRunnableConfiguration () {
        var reporter           = this._createReporter();
        var browserConnections = this._getBrowserConnections();
        var tests              = this._getTests();

        await * [browserConnections, tests];

        return { reporter, browserConnections, tests };
    }
}
