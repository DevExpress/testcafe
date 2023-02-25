import {
    chunk,
    times,
    union,
    castArray,
    flattenDeep as flatten,
} from 'lodash';

import debug from 'debug';
import prettyTime from 'pretty-hrtime';
import Compiler from '../compiler';
import BrowserConnection, { BrowserInfo } from '../browser/connection';
import BrowserSet from './browser-set';
import { GeneralError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';
import TestedApp from './tested-app';
import parseFileList from '../utils/parse-file-list';
import loadClientScripts from '../custom-client-scripts/load';
import { getConcatenatedValuesString } from '../utils/string';
import { ReporterSource } from '../reporter/interfaces';
import ClientScript from '../custom-client-scripts/client-script';
import ClientScriptInit from '../custom-client-scripts/client-script-init';
import BrowserConnectionGateway from '../browser/connection/gateway';
import { CompilerArguments } from '../compiler/interfaces';
import CompilerService from '../services/compiler/host';
import Test from '../api/structure/test';
import { BootstrapperInit, BrowserSetOptions } from './interfaces';
import WarningLog from '../notifications/warning-log';
import WARNING_MESSAGES from '../notifications/warning-message';
import guardTimeExecution from '../utils/guard-time-execution';
import asyncFilter from '../utils/async-filter';
import Fixture from '../api/structure/fixture';
import MessageBus from '../utils/message-bus';
import wrapTestFunction from '../api/wrap-test-function';
import { assertType, is } from '../errors/runtime/type-assertions';
import { generateUniqueId } from 'testcafe-hammerhead';
import assertRequestHookType from '../api/request-hooks/assert-type';
import userVariables from '../api/user-variables';
import Configuration from '../configuration/configuration-base';
import OPTION_NAMES from '../configuration/option-names';

const DEBUG_SCOPE = 'testcafe:bootstrapper';

type TestSource = unknown;

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

interface RunnableConfiguration extends BasicRuntimeResources {
    commonClientScripts: ClientScript[];
    id: string;
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
    public filter?: FilterFunction;
    public appCommand?: string;
    public appInitDelay?: number;
    public tsConfigPath?: string;
    public clientScripts: ClientScriptInit[];
    public disableMultipleWindows: boolean;
    public proxyless: boolean;
    public compilerOptions?: CompilerOptions;
    public browserInitTimeout?: number;
    public hooks?: GlobalHooks;
    public configuration: Configuration;

    private readonly compilerService?: CompilerService;
    private readonly debugLogger: debug.Debugger;
    private readonly warningLog: WarningLog;
    private readonly messageBus: MessageBus;

    private readonly TESTS_COMPILATION_UPPERBOUND: number;

    public constructor ({ browserConnectionGateway, compilerService, messageBus, configuration }: BootstrapperInit) {
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
        this.proxyless                = false;
        this.compilerOptions          = void 0;
        this.debugLogger              = debug(DEBUG_SCOPE);
        this.warningLog               = new WarningLog(null, WarningLog.createAddWarningCallback(messageBus));
        this.compilerService          = compilerService;
        this.messageBus               = messageBus;
        this.configuration            = configuration;

        this.TESTS_COMPILATION_UPPERBOUND = 60;
    }

    private static _getBrowserName (browser: BrowserInfoSource): string {
        if (browser instanceof BrowserConnection)
            return browser.browserInfo.browserName;

        return browser.browserName;
    }

    private static _splitBrowserInfo (browserInfo: BrowserInfoSource[]): SeparatedBrowserInfo {
        const remotes: BrowserConnection[] = [];
        const automated: BrowserInfo[]     = [];

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
            .map(browser => times(this.concurrency, () => new BrowserConnection(
                this.browserConnectionGateway, { ...browser }, false, this.disableMultipleWindows, this.proxyless, this.messageBus)));
    }

    private _getBrowserSetOptions (): BrowserSetOptions {
        return {
            concurrency:        this.concurrency,
            browserInitTimeout: this.browserInitTimeout,
            warningLog:         this.warningLog,
        };
    }

    private async _getBrowserConnections (browserInfo: BrowserInfoSource[]): Promise<BrowserSet> {
        const { automated, remotes } = Bootstrapper._splitBrowserInfo(browserInfo);

        if (remotes && remotes.length % this.concurrency)
            throw new GeneralError(RUNTIME_ERRORS.cannotDivideRemotesCountByConcurrency);

        let browserConnections = this._createAutomatedConnections(automated);

        remotes.forEach(remoteConnection => {
            remoteConnection.messageBus = this.messageBus;

            remoteConnection.initMessageBus();
        });

        browserConnections = browserConnections.concat(chunk(remotes, this.concurrency));

        return BrowserSet.from(browserConnections, this._getBrowserSetOptions());
    }

    private async _filterTests (tests: Test[], predicate: FilterFunction): Promise<Test[]> {
        return asyncFilter(tests, test => {
            const testFixture = test.fixture as Fixture;

            return predicate(
                test.name as string,
                testFixture.name as string,
                testFixture.path,
                test.meta,
                testFixture.meta);
        });
    }

    private async _compileTests ({ sourceList, compilerOptions, runnableConfigurationId }: CompilerArguments): Promise<Test[]> {
        const baseUrl          = this.configuration.getOption(OPTION_NAMES.baseUrl) as string;
        const experimentalEsm  = this.configuration.getOption(OPTION_NAMES.experimentalEsm) as boolean;

        if (this.compilerService) {
            await this.compilerService.init();
            await this.compilerService.setUserVariables(userVariables.value);

            return this.compilerService.getTests({ sourceList, compilerOptions, runnableConfigurationId }, baseUrl);
        }

        const compiler = new Compiler(sourceList, compilerOptions, { baseUrl, isCompilerServiceMode: false, experimentalEsm });

        return compiler.getTests();
    }

    private _assertGlobalHooks (): void {
        if (!this.hooks)
            return;

        if (this.hooks.fixture?.before)
            assertType(is.function, 'globalBefore', 'The fixture.globalBefore hook', this.hooks.fixture.before);

        if (this.hooks.fixture?.after)
            assertType(is.function, 'globalAfter', 'The fixture.globalAfter hook', this.hooks.fixture.after);

        if (this.hooks.test?.before)
            assertType(is.function, 'globalBefore', 'The test.globalBefore hook', this.hooks.test.before);

        if (this.hooks.test?.after)
            assertType(is.function, 'globalAfter', 'The test.globalAfter hook', this.hooks.test.after);

        if (this.hooks.request)
            assertRequestHookType(flatten(castArray(this.hooks.request)));
    }

    private _setGlobalHooksToTests (tests: Test[]): void {
        if (!this.hooks)
            return;

        this._assertGlobalHooks();

        const fixtureBefore = this.hooks.fixture?.before || null;
        const fixtureAfter  = this.hooks.fixture?.after || null;
        const testBefore    = this.hooks.test?.before ? wrapTestFunction(this.hooks.test.before) : null;
        const testAfter     = this.hooks.test?.after ? wrapTestFunction(this.hooks.test.after) : null;
        const request       = this.hooks.request || [];

        tests.forEach(item => {
            if (item.fixture) {
                item.fixture.globalBeforeFn = item.fixture.globalBeforeFn || fixtureBefore;
                item.fixture.globalAfterFn  = item.fixture.globalAfterFn || fixtureAfter;
            }

            item.globalBeforeFn = testBefore;
            item.globalAfterFn  = testAfter;
            item.requestHooks   = union(flatten(castArray(request)), item.requestHooks);
        });
    }

    private async _getTests (id: string): Promise<Test[]> {
        const cwd        = process.cwd();
        const sourceList = await parseFileList(this.sources, cwd);

        if (!sourceList.length)
            throw new GeneralError(RUNTIME_ERRORS.testFilesNotFound, cwd, getConcatenatedValuesString(this.sources, '\n', ''));

        let tests = await guardTimeExecution(
            async () => await this._compileTests({ sourceList, compilerOptions: this.compilerOptions, runnableConfigurationId: id }),
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
            tests = await this._filterTests(tests, this.filter);

        if (!tests.length)
            throw new GeneralError(RUNTIME_ERRORS.noTestsToRunDueFiltering);

        this._setGlobalHooksToTests(tests);

        return tests;
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

    private async _bootstrapSequence (browserInfo: BrowserInfoSource[], id: string): Promise<BasicRuntimeResources> {
        const tests      = await this._getTests(id);
        const testedApp  = await this._startTestedApp();
        const browserSet = await this._getBrowserConnections(browserInfo);

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

    private async _bootstrapParallel (browserInfo: BrowserInfoSource[], id: string): Promise<BasicRuntimeResources> {
        const bootstrappingPromises = {
            browserSet: this._getBrowserConnections(browserInfo),
            tests:      this._getTests(id),
            app:        this._startTestedApp(),
        };

        const bootstrappingResultPromises = this._getBootstrappingPromises(bootstrappingPromises);

        const bootstrappingResults = await Promise.all([
            bootstrappingResultPromises.browserSet,
            bootstrappingResultPromises.tests,
            bootstrappingResultPromises.app,
        ]);

        const [browserSetResults, testResults, appResults] = bootstrappingResults;

        if (isPromiseError(browserSetResults) || isPromiseError(testResults) || isPromiseError(appResults))
            throw await this._getBootstrappingError(...bootstrappingResults);

        return {
            browserSet: browserSetResults.result,
            tests:      testResults.result,
            testedApp:  appResults.result,
        };
    }

    // API
    public async createRunnableConfiguration (): Promise<RunnableConfiguration> {
        const id                  = generateUniqueId();
        const commonClientScripts = await loadClientScripts(this.clientScripts);

        if (await this._canUseParallelBootstrapping(this.browsers))
            return { ...await this._bootstrapParallel(this.browsers, id), commonClientScripts, id };

        return { ...await this._bootstrapSequence(this.browsers, id), commonClientScripts, id };
    }

    public restoreMessageBusListeners (): void {
        const connections = this.browserConnectionGateway.getConnections();

        Object.values(connections).forEach(connection => {
            connection.assignTestRunStartEventListener();
        });
    }
}
