import Promise from 'pinkie';
import { getBrowserInfo, getInstallations as getBrowserInstallations } from 'testcafe-browser-natives';
import Compiler from '../compiler';
import BrowserConnection from '../browser-connection';
import LocalBrowserConnection from '../browser-connection/local';
import { GeneralError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';
import BrowserSet from './browser-set';


const BROWSER_PATH_DESCRIPTOR_RE = /^path:(.*)$/;


export default class Bootstrapper {
    constructor (browserConnectionGateway) {
        this.browserConnectionGateway = browserConnectionGateway;

        this.sources  = [];
        this.browsers = [];
        this.filter   = null;
        this.reporter = null;
    }

    static async _convertAliasOrPathToBrowserInfo (browser, installations) {
        if (typeof browser === 'string') {
            if (browser in installations)
                return installations[browser];

            var pathDescriptorMatch = BROWSER_PATH_DESCRIPTOR_RE.exec(browser);

            if (!pathDescriptorMatch)
                throw new GeneralError(MESSAGE.cantFindBrowser, browser);

            var path        = pathDescriptorMatch[1];
            var browserInfo = await getBrowserInfo(path);

            if (!browserInfo)
                throw new GeneralError(MESSAGE.cantFindBrowser, browser);

            return browserInfo;
        }

        return browser;
    }

    _createConnectionFromBrowserInfo (browserInfo) {
        if (browserInfo instanceof BrowserConnection)
            return browserInfo;

        return new LocalBrowserConnection(this.browserConnectionGateway, browserInfo);
    }

    async _getBrowserInfo () {
        if (!this.browsers.length)
            throw new GeneralError(MESSAGE.browserNotSet);

        var installations = await getBrowserInstallations();

        return await Promise.all(
            this.browsers.map(browser => Bootstrapper._convertAliasOrPathToBrowserInfo(browser, installations))
        );
    }

    async _getBrowserConnections (browserInfo) {
        var browserConnections = browserInfo.map(browser => this._createConnectionFromBrowserInfo(browser));

        return await BrowserSet.from(browserConnections);
    }

    async _getTests () {
        if (!this.sources.length)
            throw new GeneralError(MESSAGE.testSourcesNotSet);

        var compiler = new Compiler(this.sources);
        var tests    = await compiler.getTests();

        if (this.filter)
            tests = tests.filter(test => this.filter(test.name, test.fixture.name, test.fixture.path));

        if (!tests.length)
            throw new GeneralError(MESSAGE.noTestsToRun);

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
                throw new GeneralError(MESSAGE.cantFindReporterForAlias, this.reporter);
            }
        }

        return pluginFactory();
    }


    // API
    async createRunnableConfiguration () {
        var reporterPlugin = this._getReporterPlugin();

        // NOTE: If a user forgot to specify a browser, but has specified a path to tests, the specified path will be
        // considered as the browser argument, and the tests path argument will have the predefined default value.
        // It's very ambiguous for the user, who might be confused by compilation errors from an unexpected test.
        // So, we need to retrieve the browser aliases and paths before tests compilation.
        var browserInfo = await this._getBrowserInfo();
        var tests       = await this._getTests();
        var browserSet  = await this._getBrowserConnections(browserInfo);

        return { reporterPlugin, browserSet, tests };
    }
}
