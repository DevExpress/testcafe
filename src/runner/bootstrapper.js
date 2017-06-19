import { flatten, zipWith, chunk, groupBy } from 'lodash';
import Promise from 'pinkie';
import Compiler from '../compiler';
import BrowserConnection from '../browser/connection';
import { GeneralError } from '../errors/runtime';
import browserProviderPool from '../browser/provider/pool';
import MESSAGE from '../errors/runtime/message';
import BrowserSet from './browser-set';
import TestedApp from './tested-app';

const DEFAULT_APP_INIT_DELAY = 1000;

export default class Bootstrapper {
    constructor (browserConnectionGateway) {
        this.browserConnectionGateway = browserConnectionGateway;

        this.concurrency  = 1;
        this.sources      = [];
        this.browsers     = [];
        this.filter       = null;
        this.reporter     = null;
        this.appCommand   = null;
        this.appInitDelay = DEFAULT_APP_INIT_DELAY;
    }

    static _splitBrowserInfo (browserInfo) {
        return groupBy(browserInfo, browser => browser instanceof BrowserConnection ? 'remotes' : 'automated');
    }

    async _getBrowserInfo () {
        if (!this.browsers.length)
            throw new GeneralError(MESSAGE.browserNotSet);

        var browserInfo = await Promise.all(this.browsers.map(browser => browserProviderPool.getBrowserInfo(browser)));

        return flatten(browserInfo);
    }

    _createAutomatedConnections (browserInfo) {
        if (!browserInfo)
            return [];

        var browserConnections = [];

        for (var i = 0; i < this.concurrency; i++) {
            var nextConnections = browserInfo.map(browser => new BrowserConnection(this.browserConnectionGateway, browser));

            browserConnections = zipWith(browserConnections, nextConnections, (prev, next) => {
                if (!Array.isArray(prev))
                    return [next];

                return prev.concat(next);
            });
        }

        return browserConnections;
    }

    async _getBrowserConnections (browserInfo) {
        var { automated, remotes } = Bootstrapper._splitBrowserInfo(browserInfo);

        if (remotes && remotes.length % this.concurrency)
            throw new GeneralError(MESSAGE.invalidRemotesCount);

        var browserConnections = this._createAutomatedConnections(automated);

        browserConnections = browserConnections.concat(chunk(remotes, this.concurrency));

        return await BrowserSet.from(browserConnections);
    }

    async _getTests () {
        if (!this.sources.length)
            throw new GeneralError(MESSAGE.testSourcesNotSet);

        var compiler = new Compiler(this.sources);
        var tests    = await compiler.getTests();

        var testsWithOnlyFlag = tests.filter(test => test.only);

        if (testsWithOnlyFlag.length)
            tests = testsWithOnlyFlag;

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

    async _startTestedApp () {
        if (this.appCommand) {
            var testedApp = new TestedApp();

            await testedApp.start(this.appCommand, this.appInitDelay);

            return testedApp;
        }

        return null;
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
        var testedApp   = await this._startTestedApp();
        var browserSet  = await this._getBrowserConnections(browserInfo);

        return { reporterPlugin, browserSet, tests, testedApp };
    }
}
