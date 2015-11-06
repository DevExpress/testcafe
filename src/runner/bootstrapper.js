import { Promise } from 'es6-promise';
import { getBrowserInfo } from 'testcafe-browser-natives';
import reporters from '../reporters';
import BrowserConnection from '../browser-connection';
import LocalBrowserConnection from '../browser-connection/local';
import Compiler from '../compiler';
import { MESSAGE, getText } from '../messages';


export default class Bootstrapper {
    constructor (browserConnectionGateway) {
        this.BROWSER_CONNECTION_READY_TIMEOUT = 30 * 1000;

        this.browserConnectionGateway = browserConnectionGateway;

        this.sources  = [];
        this.browsers = [];
        this.filter   = null;
        this.reporter = null;
    }

    static _createBrowserConnectionsReadyPromise (browserConnections) {
        var ready = browserConnections
            .filter(bc => !bc.ready)
            .map(bc => new Promise(resolve => bc.once('ready', resolve)));

        return Promise.all(ready);
    }

    static async _convertAliasOrPathToBrowserInfo (browser) {
        if (typeof browser === 'string') {
            var browserInfo = await getBrowserInfo(browser);

            if (!browserInfo)
                throw new Error(getText(MESSAGE.cantFindBrowser, browser));

            return browserInfo;
        }

        return browser;
    }

    _createConnectionFromBrowserInfo (browserInfo) {
        if (browserInfo instanceof BrowserConnection)
            return browserInfo;

        return new LocalBrowserConnection(this.browserConnectionGateway, browserInfo);
    }

    _waitBrowserConnectionsReady (browserConnections) {
        return new Promise((resolve, reject) => {
            var timeout = setTimeout(() => {
                reject(new Error(getText(MESSAGE.cantEstablishBrowserConnection)));
            }, this.BROWSER_CONNECTION_READY_TIMEOUT);

            var onError = msg => {
                clearTimeout(timeout);
                reject(new Error(msg));
            };

            browserConnections.forEach(bc => bc.once('error', onError));

            Bootstrapper
                ._createBrowserConnectionsReadyPromise(browserConnections)
                .then(() => {
                    browserConnections.forEach(bc => bc.removeListener('error', onError));
                    clearTimeout(timeout);
                    resolve();
                });
        });
    }

    _checkForDisconnectedBrowsers () {
        var disconnectedUserAgents = this.browsers
            .filter(browser => browser instanceof BrowserConnection &&
                               browser.disconnected)
            .map(bc => bc.userAgent);

        if (disconnectedUserAgents.length)
            throw new Error(getText(MESSAGE.cantRunAgainstDisconnectedBrowsers, disconnectedUserAgents.join(', ')));
    }

    async _getBrowserConnections () {
        if (!this.browsers.length)
            throw new Error(getText(MESSAGE.browserNotSet));

        this._checkForDisconnectedBrowsers();

        var browsers           = await Promise.all(this.browsers.map(Bootstrapper._convertAliasOrPathToBrowserInfo));
        var browserConnections = browsers.map(browser => this._createConnectionFromBrowserInfo(browser));

        try {
            await this._waitBrowserConnectionsReady(browserConnections);
        }
        catch (err) {
            await Promise.all(browserConnections.map(bc => new Promise(resolve => {
                if (bc instanceof LocalBrowserConnection && !bc.disconnected) {
                    bc.close();
                    bc.once('closed', resolve);
                }
                else
                    resolve();

            })));

            throw err;
        }

        return browserConnections;
    }

    async _getTests () {
        if (!this.sources.length)
            throw new Error(getText(MESSAGE.testSourcesNotSet));

        var compiler = new Compiler(this.sources);
        var tests    = await compiler.getTests();

        if (this.filter)
            tests = tests.filter(test => this.filter(test.name, test.fixture.name, test.fixture.path));

        if (!tests.length)
            throw new Error(getText(MESSAGE.noTestsToRun));

        return tests;
    }

    _getReporterCtor () {
        var Reporter = this.reporter || 'spec';

        if (typeof Reporter === 'string') {
            Reporter = reporters[Reporter.toLowerCase()];

            if (!Reporter)
                throw new Error(getText(MESSAGE.cantFindReporterForAlias, this.reporter));
        }

        return Reporter;
    }


    // API
    async createRunnableConfiguration () {
        var Reporter = this._getReporterCtor();

        var tests              = await this._getTests();
        var browserConnections = await this._getBrowserConnections();

        return { Reporter, browserConnections, tests };
    }
}
