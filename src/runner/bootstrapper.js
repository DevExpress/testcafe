import Promise from 'promise';
import { getInstallations as getBrowserInstallations } from 'testcafe-browser-natives';
import reporters from '../reporters';
import BrowserConnection from '../browser-connection';
import LocalBrowserConnection from '../browser-connection/local';
import Compiler from '../compiler';
import { MESSAGES, getText } from '../messages';


export default class Bootstrapper {
    static BROWSER_CONNECTION_READY_TIMEOUT = 30 * 1000;

    constructor (browserConnectionGateway) {
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

    static _waitBrowserConnectionsReady (browserConnections) {
        return new Promise((resolve, reject) => {
            var timeout = setTimeout(() => {
                reject(new Error(getText(MESSAGES.cantEstablishBrowserConnection)));
            }, Bootstrapper.BROWSER_CONNECTION_READY_TIMEOUT);

            var onError = msg => {
                clearTimeout(timeout);
                reject(new Error(msg));
            };

            browserConnections.forEach(bc => bc.once('error', onError));

            Bootstrapper
                ._createBrowserConnectionsReadyPromise(browserConnections)
                .then(()=> {
                    browserConnections.forEach(bc => bc.removeListener('error', onError));
                    clearTimeout(timeout);
                    resolve();
                });
        });
    }

    static async _convertBrowserAliasToBrowserInfo (alias) {
        if (typeof alias !== 'string')
            return alias;

        var installations = await getBrowserInstallations();
        var browserInfo   = installations[alias.toLowerCase()];

        if (!browserInfo)
            throw new Error(getText(MESSAGES.cantFindBrowserForAlias, alias));

        return browserInfo;
    }

    _createConnectionFromBrowserInfo (browserInfo) {
        if (browserInfo instanceof BrowserConnection)
            return browserInfo;

        return new LocalBrowserConnection(this.browserConnectionGateway, browserInfo);
    }

    async _getBrowserConnections () {
        if (!this.browsers.length)
            throw new Error(getText(MESSAGES.browserNotSet));

        var browsers           = await Promise.all(this.browsers.map(Bootstrapper._convertBrowserAliasToBrowserInfo));
        var browserConnections = browsers.map(browser => this._createConnectionFromBrowserInfo(browser));

        try {
            await Bootstrapper._waitBrowserConnectionsReady(browserConnections);
        }
        finally {
            // NOTE: we should close local connections and related browsers once we've done
            browserConnections.forEach(bc => {
                if (bc instanceof LocalBrowserConnection)
                    bc.close();
            });
        }

        return browserConnections;
    }

    async _getTests () {
        if (!this.sources.length)
            throw new Error(getText(MESSAGES.testSourcesNotSet));

        var compiler = new Compiler(this.sources);
        var tests    = await compiler.getTests();

        if (this.filter)
            tests = tests.filter(test => this.filter(test.name, test.fixture.name, test.fixture.path));

        return tests;
    }

    _getReporterCtor () {
        var Reporter = this.reporter;

        if (!Reporter)
            throw new Error(getText(MESSAGES.reporterNotSet));

        if (typeof Reporter === 'string') {
            Reporter = reporters[Reporter.toLowerCase()];

            if (!Reporter)
                throw new Error(getText(MESSAGES.cantFindReporterForAlias, this.reporter));
        }

        return Reporter;
    }


    // API
    async createRunnableConfiguration () {
        var Reporter = this._getReporterCtor();

        var [browserConnections, tests] = await Promise.all([
            this._getBrowserConnections(),
            this._getTests()
        ]);

        return { Reporter, browserConnections, tests };
    }
}
