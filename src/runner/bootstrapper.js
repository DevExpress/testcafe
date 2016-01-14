import Promise from 'pinkie';
import { getBrowserInfo } from 'testcafe-browser-natives';
import { Compiler } from 'testcafe-legacy-api';
import { wrapDomAccessors } from 'testcafe-hammerhead';
import BrowserConnection from '../browser-connection';
import LocalBrowserConnection from '../browser-connection/local';
import { MESSAGE, getText } from '../messages';
import BrowserSet from './browser-set';


export default class Bootstrapper {
    constructor (browserConnectionGateway) {
        this.browserConnectionGateway = browserConnectionGateway;

        this.sources  = [];
        this.browsers = [];
        this.filter   = null;
        this.reporter = null;
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

    async _getBrowserConnections () {
        if (!this.browsers.length)
            throw new Error(getText(MESSAGE.browserNotSet));

        var browsers           = await Promise.all(this.browsers.map(Bootstrapper._convertAliasOrPathToBrowserInfo));
        var browserConnections = browsers.map(browser => this._createConnectionFromBrowserInfo(browser));

        return await BrowserSet.from(browserConnections);
    }

    async _getTests () {
        if (!this.sources.length)
            throw new Error(getText(MESSAGE.testSourcesNotSet));

        var compiler = new Compiler(this.sources, wrapDomAccessors);
        var tests    = await compiler.getTests();

        if (this.filter)
            tests = tests.filter(test => this.filter(test.name, test.fixture.name, test.fixture.path));

        if (!tests.length)
            throw new Error(getText(MESSAGE.noTestsToRun));

        return tests;
    }

    _getReporterPlugin () {
        var pluginFactory = this.reporter;

        if (typeof pluginFactory !== 'function') {
            try {
                var alias = this.reporter || 'spec';

                pluginFactory = require('testcafe-reporter-' + alias);
            }
            catch (err) {
                throw new Error(getText(MESSAGE.cantFindReporterForAlias, this.reporter));
            }
        }

        return pluginFactory();
    }


    // API
    async createRunnableConfiguration () {
        var reporterPlugin = this._getReporterPlugin();

        var tests      = await this._getTests();
        var browserSet = await this._getBrowserConnections();

        return { reporterPlugin, browserSet, tests };
    }
}
