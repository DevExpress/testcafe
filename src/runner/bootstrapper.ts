import { dirname } from 'path';
import fs from 'fs';
import isCI from 'is-ci';
import { flatten, chunk, times } from 'lodash';
import makeDir from 'make-dir';
import OS from 'os-family';
import { errors, findWindow } from 'testcafe-browser-tools';
import authenticationHelper from '../cli/authentication-helper';
import Compiler from '../compiler';
import BrowserConnection from '../browser/connection';
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
import BrowserProvider from '../browser/provider';
import BrowserConnectionGateway from '../browser/connection/gateway';
import { CompilerArguments } from '../compiler/interfaces';
import CompilerService from '../services/compiler/host';
import Test from '../api/structure/test';
import BrowserJob from './browser-job';
import { Proxy } from 'testcafe-hammerhead';
import Screenshots from '../screenshots';
import WarningLog from '../notifications/warning-log';
import TestCafeConfiguration from '../configuration/testcafe-configuration';
import {
    TestSource,
    Filter,
    ReporterPlugin,
    ReporterPluginSource,
    BasicRuntimeResources,
    RuntimeResources, BrowserConnectionRelatedResources
} from './interfaces';

import { EventEmitter } from 'events';

interface ReporterPluginFactory {
    (): ReporterPlugin;
}

function isReporterPluginFactory (value: string | Function): value is ReporterPluginFactory {
    return typeof value === 'function';
}

interface BrowserInfo {
    browserName: string;
    providerName: string;
    provider: BrowserProvider;
}

type BrowserInfoSource = BrowserInfo | BrowserConnection;

interface PromiseSuccess<T> {
    result: T;
}

interface PromiseError<E extends Error = Error> {
    error: E;
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

export default class Bootstrapper extends EventEmitter {
    private readonly browserConnectionGateway: BrowserConnectionGateway;
    private readonly proxy: Proxy;
    private readonly _configuration: TestCafeConfiguration;
    private readonly compilerService?: CompilerService;

    public static readonly TESTS_BOOSTRAPPING_DONE_EVENT = 'tests-bootstrapping-done';

    public constructor (proxy: Proxy, browserConnectionGateway: BrowserConnectionGateway, configuration: TestCafeConfiguration, compilerService?: CompilerService) {
        super();

        this.proxy                    = proxy;
        this.browserConnectionGateway = browserConnectionGateway;
        this.compilerService          = compilerService;
        this._configuration           = configuration;
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

    private async _getBrowserInfo (): Promise<BrowserInfoSource[]> {
        const browsers = this._configuration.getBrowsersOption();

        if (!browsers.length)
            throw new GeneralError(RUNTIME_ERRORS.browserNotSet);

        const browserInfo = await Promise.all(browsers.map(browser => browserProviderPool.getBrowserInfo(browser)));

        return flatten(browserInfo);
    }

    private _createAutomatedConnections (browserInfo: BrowserInfo[], concurrency: number): BrowserConnection[][] {
        if (!browserInfo)
            return [];

        const allowMultipleWindows = this._configuration.getAllowMultipleWindowsOption();

        return browserInfo
            .map(browser => times(concurrency, () => new BrowserConnection(this.browserConnectionGateway, browser, false, allowMultipleWindows)));
    }

    private _createScreenshots (): Screenshots {
        const screenshotOpts                  = this._configuration.getScreenshotsOption();
        const disableScreenshots              = this._configuration.getDisableScreenshotsOption();
        const { path, pathPattern, fullPage } = screenshotOpts;

        return new Screenshots({
            enabled: !disableScreenshots,
            path,
            pathPattern,
            fullPage
        });
    }

    private async _getBrowserSet (browserInfo: BrowserInfoSource[]): Promise<BrowserSet> {
        const { automated, remotes } = Bootstrapper._splitBrowserInfo(browserInfo);
        const concurrency            = this._configuration.getConcurrencyOption();

        if (remotes && remotes.length % concurrency)
            throw new GeneralError(RUNTIME_ERRORS.cannotDivideRemotesCountByConcurrency);

        const browserConnections = this
            ._createAutomatedConnections(automated, concurrency)
            .concat(chunk(remotes, concurrency));

        return BrowserSet.from(browserConnections);
    }

    private _createBrowserJobs (browserSet: BrowserSet, screenshots: Screenshots, warningLog: WarningLog): BrowserJob[] {
        const browserJobs: BrowserJob[]     = [];
        const browserConnectionGroupsLength = browserSet.browserConnectionGroups.length;

        browserSet.browserConnectionGroups.map(browserConnectionGroup => {
            const job = new BrowserJob(browserConnectionGroup, this.proxy, screenshots, warningLog, this._configuration);

            this.on(Bootstrapper.TESTS_BOOSTRAPPING_DONE_EVENT, (tests: Test[]) => {
                job.init(tests, browserConnectionGroupsLength);

                browserConnectionGroup.map(bc => bc.emit('testsBootstrapped'));
            });

            browserConnectionGroup.map(bc => bc.addJob(job));
            browserJobs.push(job);
        });

        return browserJobs;
    }

    private async _getBrowserConnectionRelatedResources (browserInfo: BrowserInfoSource[]): Promise<BrowserConnectionRelatedResources> {
        const browserSet  = await this._getBrowserSet(browserInfo);
        const screenshots = this._createScreenshots();
        const warningLog  = new WarningLog();
        const browserJobs = this._createBrowserJobs(browserSet, screenshots, warningLog);

        return {
            browserSet,
            browserJobs,
            warningLog,
            screenshots
        };
    }

    private _filterTests (tests: Test[], predicate: Filter): Test[] {
        if (!predicate)
            return tests;

        return tests.filter(test => predicate(test.name, test.fixture.name, test.fixture.path, test.meta, test.fixture.meta));
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
        const cwd                             = process.cwd();
        const sources                         = this._configuration.getSrcOption();
        const tsConfigPath                    = this._configuration.getTsConfigPathOption();
        const { sourceList, compilerOptions } = await this._getCompilerArguments(cwd, sources, tsConfigPath);

        if (!sourceList.length)
            throw new GeneralError(RUNTIME_ERRORS.testFilesNotFound, getConcatenatedValuesString(sources, '\n', ''), cwd);

        let tests = await this._compileTests({ sourceList, compilerOptions });

        const testsWithOnlyFlag = tests.filter(test => test.only);

        if (testsWithOnlyFlag.length)
            tests = testsWithOnlyFlag;

        if (!tests.length)
            throw new GeneralError(RUNTIME_ERRORS.noTestsToRun);

        tests = this._filterTests(tests, this._configuration.getFilterOption());

        if (!tests.length)
            throw new GeneralError(RUNTIME_ERRORS.noTestsToRunDueFiltering);

        this.emit(Bootstrapper.TESTS_BOOSTRAPPING_DONE_EVENT, tests);

        return tests;
    }

    private async _getCompilerArguments (cwd: string, sources: TestSource[], tsConfigPath: string): Promise<CompilerArguments> {
        const sourceList = await parseFileList(sources, cwd);

        const compilerOptions = {
            typeScriptOptions: {
                tsConfigPath
            }
        };

        return { sourceList, compilerOptions };
    }

    private async _ensureOutStream (outStream: string | WritableStream): Promise<WritableStream> {
        if (typeof outStream !== 'string')
            return outStream;

        const fullReporterOutputPath = resolvePathRelativelyCwd(outStream);

        await makeDir(dirname(fullReporterOutputPath));

        return fs.createWriteStream(fullReporterOutputPath);
    }

    private _requireReporterPluginFactory (reporterName: string): ReporterPluginFactory {
        try {
            return require('testcafe-reporter-' + reporterName);
        }
        catch (err) {
            throw new GeneralError(RUNTIME_ERRORS.cannotFindReporterForAlias, reporterName);
        }
    }

    private _getPluginFactory (reporterFactorySource: string | ReporterPluginFactory): ReporterPluginFactory {
        if (!isReporterPluginFactory(reporterFactorySource))
            return this._requireReporterPluginFactory(reporterFactorySource);

        return reporterFactorySource;
    }

    private async _getReporterPlugins (): Promise<ReporterPluginSource[]> {
        const reporters = this._configuration.getReporterOption();

        return Promise.all(reporters.map(async ({ name, output }) => {
            const pluginFactory = this._getPluginFactory(name);
            const outStream     = output ? await this._ensureOutStream(output) : void 0;

            return {
                plugin: pluginFactory(),
                outStream,
                name
            };
        }));
    }

    private async _startTestedApp (): Promise<TestedApp|undefined> {
        const appCommand   = this._configuration.getAppCommandOption();
        const appInitDelay = this._configuration.getAppInitDelayOption();

        if (!appCommand)
            return void 0;

        const testedApp = new TestedApp();

        await testedApp.start(appCommand, appInitDelay as number);

        return testedApp;
    }

    private async _canUseParallelBootstrapping (browserInfo: BrowserInfoSource[]): Promise<boolean> {
        const isLocalPromises = browserInfo.map(browser => browser.provider.isLocalBrowser(void 0, Bootstrapper._getBrowserName(browser)));
        const isLocalBrowsers = await Promise.all(isLocalPromises);

        return isLocalBrowsers.every(result => result);
    }

    private async _bootstrapSequence (browserInfo: BrowserInfoSource[]): Promise<BasicRuntimeResources> {
        const tests                             = await this._getTests();
        const testedApp                         = await this._startTestedApp();
        const browserConnectionRelatedResources = await this._getBrowserConnectionRelatedResources(browserInfo);

        return { tests, testedApp, ...browserConnectionRelatedResources };
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
            browserConnectionRelatedResources: this._getBrowserConnectionRelatedResources(browserInfo),
            tests:                             this._getTests(),
            app:                               this._startTestedApp()
        };

        const bootstrappingResultPromises = this._getBootstrappingPromises(bootstrappingPromises);

        const bootstrappingResults = await Promise.all([
            bootstrappingResultPromises.browserConnectionRelatedResources,
            bootstrappingResultPromises.tests,
            bootstrappingResultPromises.app
        ]);

        const [browserConnectionRelatedResourceResult, testResults, appResults] = bootstrappingResults;

        if (isPromiseError(browserConnectionRelatedResourceResult) || isPromiseError(testResults) || isPromiseError(appResults)) {
            //@ts-ignore
            throw await this._getBootstrappingError(...bootstrappingResults);
        }

        return {
            tests:     testResults.result,
            testedApp: appResults.result,
            ...browserConnectionRelatedResourceResult.result
        };
    }

    // API
    public async createRunnableConfiguration (): Promise<RuntimeResources> {
        const reporterPlugins     = await this._getReporterPlugins();
        const clientScriptSources = this._configuration.getClientScriptsOption();
        const commonClientScripts = await loadClientScripts(clientScriptSources);

        // NOTE: If a user forgot to specify a browser, but has specified a path to tests, the specified path will be
        // considered as the browser argument, and the tests path argument will have the predefined default value.
        // It's very ambiguous for the user, who might be confused by compilation errors from an unexpected test.
        // So, we need to retrieve the browser aliases and paths before tests compilation.
        const browserInfo = await this._getBrowserInfo();

        if (OS.mac)
            await Bootstrapper._checkRequiredPermissions(browserInfo);

        if (await this._canUseParallelBootstrapping(browserInfo))
            return { reporterPlugins, ...await this._bootstrapParallel(browserInfo), commonClientScripts };

        return { reporterPlugins, ...await this._bootstrapSequence(browserInfo), commonClientScripts };
    }
}
