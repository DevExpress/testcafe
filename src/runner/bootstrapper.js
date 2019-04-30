import { isUndefined, filter, flatten, chunk, times } from 'lodash';
import Promise from 'pinkie';
import Compiler from '../compiler';
import BrowserConnection from '../browser/connection';
import { GeneralError } from '../errors/runtime';
import browserProviderPool from '../browser/provider/pool';
import { RUNTIME_ERRORS } from '../errors/types';
import BrowserSet from './browser-set';
import TestedApp from './tested-app';
import parseFileList from '../utils/parse-file-list';
import path from 'path';
import fs from 'fs';
import makeDir from 'make-dir';
import resolvePathRelativelyCwd from '../utils/resolve-path-relatively-cwd';

export default class Bootstrapper {
    constructor (browserConnectionGateway) {
        this.browserConnectionGateway = browserConnectionGateway;

        this.concurrency                 = null;
        this.sources                     = [];
        this.browsers                    = [];
        this.reporters                   = [];
        this.filter                      = null;
        this.appCommand                  = null;
        this.appInitDelay                = null;
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
            throw new GeneralError(RUNTIME_ERRORS.browserNotSet);

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
            throw new GeneralError(RUNTIME_ERRORS.cannotDivideRemotesCountByConcurrency);

        let browserConnections = this._createAutomatedConnections(automated);

        browserConnections = browserConnections.concat(chunk(remotes, this.concurrency));

        return await BrowserSet.from(browserConnections);
    }

    async _getTests () {
        if (!this.sources.length)
            throw new GeneralError(RUNTIME_ERRORS.testSourcesNotSet);

        const parsedFileList = await parseFileList(this.sources, process.cwd());
        const compiler       = new Compiler(parsedFileList);
        let tests            = await compiler.getTests();

        const testsWithOnlyFlag = tests.filter(test => test.only);

        if (testsWithOnlyFlag.length)
            tests = testsWithOnlyFlag;

        if (this.filter)
            tests = tests.filter(test => this.filter(test.name, test.fixture.name, test.fixture.path, test.meta, test.fixture.meta));

        if (!tests.length)
            throw new GeneralError(RUNTIME_ERRORS.noTestsToRun);

        return tests;
    }

    async _ensureOutStream (outStream) {
        if (typeof outStream !== 'string')
            return outStream;

        const fullReporterOutputPath = resolvePathRelativelyCwd(outStream);

        await makeDir(path.dirname(fullReporterOutputPath));

        return fs.createWriteStream(fullReporterOutputPath);
    }

    static _addDefaultReporter (reporters) {
        reporters.push({
            name: 'spec',
            file: process.stdout
        });
    }

    async _getReporterPlugins () {
        const stdoutReporters = filter(this.reporters, r => isUndefined(r.output) || r.output === process.stdout);

        if (stdoutReporters.length > 1)
            throw new GeneralError(RUNTIME_ERRORS.multipleStdoutReporters, stdoutReporters.map(r => r.name).join(', '));

        if (!this.reporters.length)
            Bootstrapper._addDefaultReporter(this.reporters);

        return Promise.all(this.reporters.map(async ({ name, output }) => {
            let pluginFactory = name;
            let pluginName    = null;

            const outStream = await this._ensureOutStream(output);

            if (typeof pluginFactory !== 'function') {
                try {
                    pluginFactory = require('testcafe-reporter-' + name);
                    pluginName    = name;
                }
                catch (err) {
                    throw new GeneralError(RUNTIME_ERRORS.cannotFindReporterForAlias, name);
                }
            }

            const plugin = pluginFactory();

            plugin.name = pluginName;

            return {
                plugin,
                outStream
            };
        }));
    }

    async _startTestedApp () {
        if (this.appCommand) {
            const testedApp = new TestedApp();

            await testedApp.start(this.appCommand, this.appInitDelay);

            return testedApp;
        }

        return null;
    }

    async _canUseParallelBootstrapping (browserInfo) {
        const isLocalPromises = browserInfo.map(browser => browser.provider.isLocalBrowser(null, browserInfo.browserName));
        const isLocalBrowsers = await Promise.all(isLocalPromises);

        return isLocalBrowsers.every(result => result);
    }

    async _bootstrapSequence (browserInfo) {
        const tests       = await this._getTests();
        const testedApp   = await this._startTestedApp();
        const browserSet  = await this._getBrowserConnections(browserInfo);

        return { tests, testedApp, browserSet };
    }

    _wrapBootstrappingPromise (promise) {
        return promise
            .then(result => ({ error: null, result }))
            .catch(error => ({ result: null, error }));
    }

    async _handleBootstrappingError ([browserSetStatus, testsStatus, testedAppStatus]) {
        if (!browserSetStatus.error)
            await browserSetStatus.result.dispose();

        if (!testedAppStatus.error && testedAppStatus.result)
            await testedAppStatus.result.kill();

        if (testsStatus.error)
            throw testsStatus.error;
        else if (testedAppStatus.error)
            throw testedAppStatus.error;
        else
            throw browserSetStatus.error;
    }

    async _bootstrapParallel (browserInfo) {
        let bootstrappingPromises = [
            this._getBrowserConnections(browserInfo),
            this._getTests(),
            this._startTestedApp()
        ];

        bootstrappingPromises = bootstrappingPromises.map(promise => this._wrapBootstrappingPromise(promise));

        const bootstrappingStatuses = await Promise.all(bootstrappingPromises);

        if (bootstrappingStatuses.some(status => status.error))
            await this._handleBootstrappingError(bootstrappingStatuses);

        const [browserSet, tests, testedApp] = bootstrappingStatuses.map(status => status.result);

        return { browserSet, tests, testedApp };
    }

    // API
    async createRunnableConfiguration () {
        const reporterPlugins = await this._getReporterPlugins();

        // NOTE: If a user forgot to specify a browser, but has specified a path to tests, the specified path will be
        // considered as the browser argument, and the tests path argument will have the predefined default value.
        // It's very ambiguous for the user, who might be confused by compilation errors from an unexpected test.
        // So, we need to retrieve the browser aliases and paths before tests compilation.
        const browserInfo = await this._getBrowserInfo();

        if (await this._canUseParallelBootstrapping(browserInfo))
            return { reporterPlugins, ...await this._bootstrapParallel(browserInfo) };

        return { reporterPlugins, ...await this._bootstrapSequence(browserInfo) };
    }
}
