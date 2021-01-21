import path from 'path';
import fs from 'fs';
import isCI from 'is-ci';
import {
    flatten,
    chunk,
    times
} from 'lodash';

import makeDir from 'make-dir';
import OS from 'os-family';
import debug from 'debug';
import prettyTime from 'pretty-hrtime';
import { errors, findWindow } from 'testcafe-browser-tools';
import authenticationHelper from '../cli/authentication-helper';
import Compiler from '../compiler';
import BrowserConnection, { BrowserInfo } from '../browser/connection';
import browserProviderPool from '../browser/provider/pool';
import BrowserSet from './browser-set';
import RemoteBrowserProvider from '../browser/provider/built-in/remote';
import { GeneralError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';
import TestedApp from './tested-app';
import parseFileList from '../utils/parse-file-list';
import resolvePathRelativelyCwd from '../utils/resolve-path-relatively-cwd';
import loadClientScripts from '../custom-client-scripts/load';
import { getConcatenatedValuesString } from '../utils/string';

import { Writable as WritableStream } from 'stream';
import { ReporterSource, ReporterPluginSource } from '../reporter/interfaces';
import ClientScript from '../custom-client-scripts/client-script';
import ClientScriptInit from '../custom-client-scripts/client-script-init';
import BrowserConnectionGateway from '../browser/connection/gateway';
import { CompilerArguments } from '../compiler/interfaces';
import CompilerService from '../services/compiler/host';
import { Metadata } from '../api/structure/interfaces';
import Test from '../api/structure/test';
import detectDisplay from '../utils/detect-display';
import { getPluginFactory, processReporterName } from '../utils/reporter';
import { BrowserSetOptions } from './interfaces';
import WarningLog from '../notifications/warning-log';
import WARNING_MESSAGES from '../notifications/warning-message';
import guardTimeExecution from '../utils/guard-time-execution';

const DEBUG_SCOPE = 'testcafe:bootstrapper';

type TestSource = unknown;

type BrowserSource = BrowserConnection | string;

interface Filter {
    (testName: string, fixtureName: string, fixturePath: string, testMeta: Metadata, fixtureMeta: Metadata): boolean;
}

type BrowserInfoSource = BrowserInfo | BrowserConnection;

interface PromiseSuccess<T> {
    result: T;
}

interface PromiseError<E extends Error = Error> {
    error: E;
}

interface BasicRuntimeResources {
    browserSet: BrowserSet;
    tests: Test[];
    testedApp?: TestedApp;
}

interface RuntimeResources extends BasicRuntimeResources {
    reporterPlugins: ReporterPluginSource[];
    commonClientScripts: ClientScript[];
}

type PromiseResult<T, E extends Error = Error> = PromiseSuccess<T> | PromiseError<E>;

function isPromiseError<T, E extends Error = Error> (value: PromiseResult<T, E>): value is PromiseError<E> {
    return (value as PromiseError<E>).error !== void 0;
}

interface SeparatedBrowserInfo {
    remotes: BrowserConnection[];
    automated: BrowserInfo[];
}

type PromiseCollection<T> = {
    [K in keyof T]: Promise<T[K]>
}

type ResultCollection<T> = { [P in keyof T]: PromiseResult<T[P]> };

export default class Bootstrapper {
    private readonly browserConnectionGateway: BrowserConnectionGateway;
    public concurrency: number;
    public sources: TestSource[];
    public browsers: BrowserSource[];
    public reporters: ReporterSource[];
    public filter?: Filter;
    public appCommand?: string;
    public appInitDelay?: number;
    public tsConfigPath?: string;
    public clientScripts: ClientScriptInit[];
    public disableMultipleWindows: boolean;
    public compilerOptions?: CompilerOptions;
    public browserInitTimeout?: number;

    private readonly compilerService?: CompilerService;
    private readonly debugLogger: debug.Debugger;
    private readonly warningLog: WarningLog;

    private TESTS_COMPILATION_UPPERBOUND: number;

    public constructor (browserConnectionGateway: BrowserConnectionGateway, compilerService?: CompilerService) {
        this.browserConnectionGateway = browserConnectionGateway;
        this.concurrency              = 1;
        this.sources                  = [];
        this.browsers                 = [];
        this.reporters                = [];
        this.filter                   = void 0;
        this.appCommand               = void 0;
        this.appInitDelay             = void 0;
        this.tsConfigPath             = void 0;
        this.clientScripts            = [];
        this.disableMultipleWindows   = false;
        this.compilerOptions          = void 0;
        this.debugLogger              = debug(DEBUG_SCOPE);
        this.warningLog               = new WarningLog();

        this.TESTS_COMPILATION_UPPERBOUND = 60;

        this.compilerService = compilerService;
    }

    private static _getBrowserName (browser: BrowserInfoSource): string {
        if (browser instanceof BrowserConnection)
            return browser.browserInfo.browserName;

        return browser.browserName;
    }

    private static _splitBrowserInfo (browserInfo: BrowserInfoSource[]): SeparatedBrowserInfo {
        const remotes: BrowserConnection[]  = [];
        const automated: BrowserInfo[]      = [];

        browserInfo.forEach(browser => {
            if (browser instanceof BrowserConnection)
                remotes.push(browser);
            else
                automated.push(browser);
        });

        return { remotes, automated };
    }

    private static async _hasLocalBrowsers (browserInfo: BrowserInfoSource[]): Promise<boolean> {
        for (const browser of browserInfo) {
            if (browser instanceof BrowserConnection)
                continue;

            if (await browser.provider.isLocalBrowser(void 0, browser.browserName))
                return true;
        }

        return false;
    }

    private static async _checkRequiredPermissions (browserInfo: BrowserInfoSource[]): Promise<void> {
        const hasLocalBrowsers = await Bootstrapper._hasLocalBrowsers(browserInfo);

        const { error } = await authenticationHelper(
            () => findWindow(''),
            errors.UnableToAccessScreenRecordingAPIError,
            {
                interactive: hasLocalBrowsers && !isCI
            }
        );

        if (!error)
            return;

        if (hasLocalBrowsers)
            throw error;

        RemoteBrowserProvider.canDetectLocalBrowsers = false;
    }

    private static async _checkThatTestsCanRunWithoutDisplay (browserInfoSource: BrowserInfoSource[]): Promise<void> {
        for (let browserInfo of browserInfoSource) {
            if (browserInfo instanceof BrowserConnection)
                browserInfo = browserInfo.browserInfo;

            const isLocalBrowser    = await browserInfo.provider.isLocalBrowser(void 0, browserInfo.browserName);
            const isHeadlessBrowser = await browserInfo.provider.isHeadlessBrowser(void 0, browserInfo.browserName);

            if (isLocalBrowser && !isHeadlessBrowser) {
                throw new GeneralError(
                    RUNTIME_ERRORS.cannotRunLocalNonHeadlessBrowserWithoutDisplay,
                    browserInfo.alias
                );
            }
        }
    }

    private async _getBrowserInfo (): Promise<BrowserInfoSource[]> {
        if (!this.browsers.length)
            throw new GeneralError(RUNTIME_ERRORS.browserNotSet);

        const browserInfo = await Promise.all(this.browsers.map(browser => browserProviderPool.getBrowserInfo(browser)));

        return flatten(browserInfo);
    }

    private _createAutomatedConnections (browserInfo: BrowserInfo[]): BrowserConnection[][] {
        if (!browserInfo)
            return [];

        return browserInfo
            .map(browser => times(this.concurrency, () => new BrowserConnection(this.browserConnectionGateway, browser, false, this.disableMultipleWindows)));
    }

    private _getBrowserSetOptions (): BrowserSetOptions {
        return {
            concurrency:        this.concurrency,
            browserInitTimeout: this.browserInitTimeout,
            warningLog:         this.warningLog
        };
    }

    private async _getBrowserConnections (browserInfo: BrowserInfoSource[]): Promise<BrowserSet> {
        const { automated, remotes } = Bootstrapper._splitBrowserInfo(browserInfo);

        if (remotes && remotes.length % this.concurrency)
            throw new GeneralError(RUNTIME_ERRORS.cannotDivideRemotesCountByConcurrency);

        let browserConnections = this._createAutomatedConnections(automated);

        browserConnections = browserConnections.concat(chunk(remotes, this.concurrency));

        return BrowserSet.from(browserConnections, this._getBrowserSetOptions());
    }

    private _filterTests (tests: Test[], predicate: Filter): Test[] {
        return tests.filter(test => predicate(test.name as string, test.fixture.name as string, test.fixture.path, test.meta, test.fixture.meta));
    }

    private async _compileTests ({ sourceList, compilerOptions }: CompilerArguments): Promise<Test[]> {
        if (this.compilerService) {
            await this.compilerService.init();

            return this.compilerService.getTests({ sourceList, compilerOptions });
        }

        const compiler = new Compiler(sourceList, compilerOptions);

        return compiler.getTests();
    }

    private async _getTests (): Promise<Test[]> {
        const cwd        = process.cwd();
        const sourceList = await parseFileList(this.sources, cwd);

        if (!sourceList.length)
            throw new GeneralError(RUNTIME_ERRORS.testFilesNotFound, getConcatenatedValuesString(this.sources, '\n', ''), cwd);

        let tests = await guardTimeExecution(
            async () => await this._compileTests({ sourceList, compilerOptions: this.compilerOptions }),
            elapsedTime => {
                this.debugLogger(`tests compilation took ${prettyTime(elapsedTime)}`);

                const [ elapsedSeconds ] = elapsedTime;

                if (elapsedSeconds > this.TESTS_COMPILATION_UPPERBOUND)
                    this.warningLog.addWarning(WARNING_MESSAGES.testsCompilationTakesTooLong, prettyTime(elapsedTime));
            }
        );

        const testsWithOnlyFlag = tests.filter(test => test.only);

        if (testsWithOnlyFlag.length)
            tests = testsWithOnlyFlag;

        if (!tests.length)
            throw new GeneralError(RUNTIME_ERRORS.noTestsToRun);

        if (this.filter)
            tests = this._filterTests(tests, this.filter);

        if (!tests.length)
            throw new GeneralError(RUNTIME_ERRORS.noTestsToRunDueFiltering);

        return tests;
    }

    private async _ensureOutStream (outStream: string | WritableStream): Promise<WritableStream> {
        if (typeof outStream !== 'string')
            return outStream;

        const fullReporterOutputPath = resolvePathRelativelyCwd(outStream);

        await makeDir(path.dirname(fullReporterOutputPath));

        return fs.createWriteStream(fullReporterOutputPath);
    }

    private static _addDefaultReporter (reporters: ReporterSource[]): void {
        reporters.push({
            name:   'spec',
            output: process.stdout
        });
    }

    private async _getReporterPlugins (): Promise<ReporterPluginSource[]> {
        if (!this.reporters.length)
            Bootstrapper._addDefaultReporter(this.reporters);

        return Promise.all(this.reporters.map(async ({ name, output }) => {
            const pluginFactory = getPluginFactory(name);
            const processedName = processReporterName(name);
            const outStream     = output ? await this._ensureOutStream(output) : void 0;

            return {
                plugin: pluginFactory(),
                name:   processedName,
                outStream
            };
        }));
    }

    private async _startTestedApp (): Promise<TestedApp|undefined> {
        if (!this.appCommand)
            return void 0;

        const testedApp = new TestedApp();

        await testedApp.start(this.appCommand, this.appInitDelay as number);

        return testedApp;
    }

    private async _canUseParallelBootstrapping (browserInfo: BrowserInfoSource[]): Promise<boolean> {
        const isLocalPromises = browserInfo.map(browser => browser.provider.isLocalBrowser(void 0, Bootstrapper._getBrowserName(browser)));
        const isLocalBrowsers = await Promise.all(isLocalPromises);

        return isLocalBrowsers.every(result => result);
    }

    private async _bootstrapSequence (browserInfo: BrowserInfoSource[]): Promise<BasicRuntimeResources> {
        const tests       = await this._getTests();
        const testedApp   = await this._startTestedApp();
        const browserSet  = await this._getBrowserConnections(browserInfo);

        return { tests, testedApp, browserSet };
    }

    private _wrapBootstrappingPromise<T> (promise: Promise<T>): Promise<PromiseResult<T>> {
        return promise
            .then(result => ({ error: void 0, result }))
            .catch(error => ({ result: void 0, error }));
    }

    private async _getBootstrappingError (browserSetStatus: PromiseResult<BrowserSet>, testsStatus: PromiseResult<Test[]>, testedAppStatus: PromiseResult<TestedApp|undefined>): Promise<Error> {
        if (!isPromiseError(browserSetStatus))
            await browserSetStatus.result.dispose();

        if (!isPromiseError(browserSetStatus) && !isPromiseError(testedAppStatus) && testedAppStatus.result)
            await testedAppStatus.result.kill();

        if (isPromiseError(testsStatus))
            return testsStatus.error;

        if (isPromiseError(testedAppStatus))
            return testedAppStatus.error;

        if (isPromiseError(browserSetStatus))
            return browserSetStatus.error;

        return new Error('Unexpected call');
    }

    private _getBootstrappingPromises<T> (arg: PromiseCollection<T>): PromiseCollection<ResultCollection<T>> {
        const result = {} as unknown as PromiseCollection<ResultCollection<T>>;

        for (const k in arg)
            result[k] = this._wrapBootstrappingPromise(arg[k]);

        return result;
    }

    private async _bootstrapParallel (browserInfo: BrowserInfoSource[]): Promise<BasicRuntimeResources> {
        const bootstrappingPromises = {
            browserSet: this._getBrowserConnections(browserInfo),
            tests:      this._getTests(),
            app:        this._startTestedApp()
        };

        const bootstrappingResultPromises = this._getBootstrappingPromises(bootstrappingPromises);

        const bootstrappingResults = await Promise.all([
            bootstrappingResultPromises.browserSet,
            bootstrappingResultPromises.tests,
            bootstrappingResultPromises.app
        ]);

        const [browserSetResults, testResults, appResults] = bootstrappingResults;

        if (isPromiseError(browserSetResults) || isPromiseError(testResults) || isPromiseError(appResults))
            throw await this._getBootstrappingError(...bootstrappingResults);

        return {
            browserSet: browserSetResults.result,
            tests:      testResults.result,
            testedApp:  appResults.result
        };
    }

    // API
    public async createRunnableConfiguration (): Promise<RuntimeResources> {
        const reporterPlugins     = await this._getReporterPlugins();
        const commonClientScripts = await loadClientScripts(this.clientScripts);

        // NOTE: If a user forgot to specify a browser, but has specified a path to tests, the specified path will be
        // considered as the browser argument, and the tests path argument will have the predefined default value.
        // It's very ambiguous for the user, who might be confused by compilation errors from an unexpected test.
        // So, we need to retrieve the browser aliases and paths before tests compilation.
        const browserInfo = await this._getBrowserInfo();

        if (OS.mac)
            await Bootstrapper._checkRequiredPermissions(browserInfo);

        if (OS.linux && !detectDisplay())
            await Bootstrapper._checkThatTestsCanRunWithoutDisplay(browserInfo);

        if (await this._canUseParallelBootstrapping(browserInfo))
            return { reporterPlugins, ...await this._bootstrapParallel(browserInfo), commonClientScripts };

        return { reporterPlugins, ...await this._bootstrapSequence(browserInfo), commonClientScripts };
    }
}
