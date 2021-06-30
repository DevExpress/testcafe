import path from 'path';
import fs from 'fs';
import {
    chunk,
    times
} from 'lodash';

import makeDir from 'make-dir';
import debug from 'debug';
import prettyTime from 'pretty-hrtime';
import Compiler from '../compiler';
import BrowserConnection, { BrowserInfo } from '../browser/connection';
import BrowserSet from './browser-set';
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
import { getPluginFactory, processReporterName } from '../utils/reporter';
import { BootstrapperInit, BrowserSetOptions } from './interfaces';
import WarningLog from '../notifications/warning-log';
import WARNING_MESSAGES from '../notifications/warning-message';
import guardTimeExecution from '../utils/guard-time-execution';

const DEBUG_SCOPE = 'testcafe:bootstrapper';

type TestSource = unknown;

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
    public browsers: BrowserInfoSource[];
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

    private readonly TESTS_COMPILATION_UPPERBOUND: number;

    public constructor ({ browserConnectionGateway, compilerService }: BootstrapperInit) {
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
        this.compilerService          = compilerService;

        this.TESTS_COMPILATION_UPPERBOUND = 60;
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
            throw new GeneralError(RUNTIME_ERRORS.testFilesNotFound, cwd, getConcatenatedValuesString(this.sources, '\n', ''));

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

        if (await this._canUseParallelBootstrapping(this.browsers))
            return { reporterPlugins, ...await this._bootstrapParallel(this.browsers), commonClientScripts };

        return { reporterPlugins, ...await this._bootstrapSequence(this.browsers), commonClientScripts };
    }
}
