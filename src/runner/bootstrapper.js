import { isUndefined, filter, flatten, chunk, times } from 'lodash';
import Promise from 'pinkie';
import Compiler from '../compiler';
import BrowserConnection from '../browser/connection';
import { GeneralError } from '../errors/runtime';
import browserProviderPool from '../browser/provider/pool';
import MESSAGE from '../errors/runtime/message';
import BrowserSet from './browser-set';
import TestedApp from './tested-app';
import parseFileList from '../utils/parse-file-list';

const DEFAULT_APP_INIT_DELAY = 1000;

export default class Bootstrapper {
    constructor (browserConnectionGateway) {
        this.browserConnectionGateway = browserConnectionGateway;

        this.concurrency                 = 1;
        this.sources                     = [];
        this.browsers                    = [];
        this.reporters                   = [];
        this.filter                      = null;
        this.appCommand                  = null;
        this.appInitDelay                = DEFAULT_APP_INIT_DELAY;
        this.disableTestSyntaxValidation = false;
    }

    static _splitBrowserInfo (browserInfo) {
        const remotes   = [];
        const automated = [];

        browserInfo.forEach(browser => {
            if (browser instanceof BrowserConnection)
                remotes.push(browser);
            else
                automated.push(browser);
        });

        return { remotes, automated };
    }

    async _getBrowserInfo () {
        if (!this.browsers.length)
            throw new GeneralError(MESSAGE.browserNotSet);

        const browserInfo = await Promise.all(this.browsers.map(browser => browserProviderPool.getBrowserInfo(browser)));

        return flatten(browserInfo);
    }

    _createAutomatedConnections (browserInfo) {
        if (!browserInfo)
            return [];

        return browserInfo
            .map(browser => times(this.concurrency, () => new BrowserConnection(this.browserConnectionGateway, browser)));
    }

    async _getBrowserConnections (browserInfo) {
        const { automated, remotes } = Bootstrapper._splitBrowserInfo(browserInfo);

        if (remotes && remotes.length % this.concurrency)
            throw new GeneralError(MESSAGE.cannotDivideRemotesCountByConcurrency);

        let browserConnections = this._createAutomatedConnections(automated);

        browserConnections = browserConnections.concat(chunk(remotes, this.concurrency));

        return await BrowserSet.from(browserConnections);
    }

    async _getTests () {
        if (!this.sources.length)
            throw new GeneralError(MESSAGE.testSourcesNotSet);

        const parsedFileList = await parseFileList(this.sources, process.cwd());
        const compiler       = new Compiler(parsedFileList, this.disableTestSyntaxValidation);
        let tests            = await compiler.getTests();

        const testsWithOnlyFlag = tests.filter(test => test.only);

        if (testsWithOnlyFlag.length)
            tests = testsWithOnlyFlag;

        if (this.filter)
            tests = tests.filter(test => this.filter(test.name, test.fixture.name, test.fixture.path, test.meta, test.fixture.meta));

        if (!tests.length)
            throw new GeneralError(MESSAGE.noTestsToRun);

        return tests;
    }

    _getReporterPlugins () {
        const stdoutReporters = filter(this.reporters, r => isUndefined(r.outStream) || r.outStream === process.stdout);

        if (stdoutReporters.length > 1)
            throw new GeneralError(MESSAGE.multipleStdoutReporters, stdoutReporters.map(r => r.name).join(', '));

        if (!this.reporters.length) {
            this.reporters.push({
                name:      'spec',
                outStream: process.stdout
            });
        }

        return this.reporters.map(({ name, outStream }) => {
            let pluginFactory = name;

            if (typeof pluginFactory !== 'function') {
                try {
                    pluginFactory = require('testcafe-reporter-' + name);
                }
                catch (err) {
                    throw new GeneralError(MESSAGE.cantFindReporterForAlias, name);
                }
            }

            return {
                plugin: pluginFactory(),
                outStream
            };
        });
    }

    async _startTestedApp () {
        if (this.appCommand) {
            const testedApp = new TestedApp();

            await testedApp.start(this.appCommand, this.appInitDelay);

            return testedApp;
        }

        return null;
    }


    // API
    async createRunnableConfiguration () {
        const reporterPlugins = this._getReporterPlugins();

        // NOTE: If a user forgot to specify a browser, but has specified a path to tests, the specified path will be
        // considered as the browser argument, and the tests path argument will have the predefined default value.
        // It's very ambiguous for the user, who might be confused by compilation errors from an unexpected test.
        // So, we need to retrieve the browser aliases and paths before tests compilation.
        const browserInfo = await this._getBrowserInfo();
        const tests       = await this._getTests();
        const testedApp   = await this._startTestedApp();
        const browserSet  = await this._getBrowserConnections(browserInfo);

        return { reporterPlugins, browserSet, tests, testedApp };
    }
}
