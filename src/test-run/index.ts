import {
    pull,
    remove,
    chain,
} from 'lodash';

import { nanoid } from 'nanoid';
import { readSync as read } from 'read-file-relative';
import promisifyEvent from 'promisify-event';
import Mustache from 'mustache';
import AsyncEventEmitter from '../utils/async-event-emitter';
import TestRunDebugLog from './debug-log';
import TestRunErrorFormattableAdapter from '../errors/test-run/formattable-adapter';
import TestCafeErrorList from '../errors/error-list';
import { GeneralError } from '../errors/runtime';

import {
    RequestHookUnhandledError,
    PageLoadError,
    RoleSwitchInRoleInitializerError,
    SwitchToWindowPredicateError,
    WindowNotFoundError,
    RequestHookBaseError,
    TestTimeoutError,
    ExternalAssertionLibraryError,
    RunTimeoutError,
} from '../errors/test-run/';

import CLIENT_MESSAGES from './client-messages';
import COMMAND_TYPE from './commands/type';
import delay from '../utils/delay';
import isPasswordInput from '../utils/is-password-input';
import testRunMarker from './marker-symbol';
import testRunTracker from '../api/test-run-tracker';
import ROLE_PHASE from '../role/phase';
import ReporterPluginHost from '../reporter/plugin-host';
import BrowserConsoleMessages from './browser-console-messages';
import WarningLog from '../notifications/warning-log';
import WARNING_MESSAGE from '../notifications/warning-message';

import {
    StateSnapshot,
    SPECIAL_ERROR_PAGE,
    RequestFilterRule,
    InjectableResources,
    RequestHookMethodError,
    StoragesSnapshot,
    RequestHookEventProvider,
} from 'testcafe-hammerhead';

import * as INJECTABLES from '../assets/injectables';
import { findProblematicScripts } from '../custom-client-scripts/utils';
import { getPluralSuffix, getConcatenatedValuesString } from '../utils/string';

import {
    isCommandRejectableByPageError,
    isBrowserManipulationCommand,
    isScreenshotCommand,
    isServiceCommand,
    canSetDebuggerBreakpointBeforeCommand,
    isExecutableOnClientCommand,
    isResizeWindowCommand,
} from './commands/utils';

import {
    ExecuteAsyncExpressionCommand,
    ExecuteExpressionCommand,
    GetCurrentWindowsCommand,
    SwitchToWindowByPredicateCommand,
    SwitchToWindowCommand,
    GetCookiesCommand,
    SetCookiesCommand,
    DeleteCookiesCommand,
    AddRequestHooksCommand,
    RemoveRequestHooksCommand,
    RunCustomActionCommand,
} from './commands/actions';
import { DebugCommand } from './commands/observation';

import { RUNTIME_ERRORS, TEST_RUN_ERRORS } from '../errors/types';
import processTestFnError from '../errors/process-test-fn-error';
import { createReplicator, SelectorNodeTransform } from '../client-functions/replicator';
import Test from '../api/structure/test';
import Capturer from '../screenshots/capturer';
import { Dictionary } from '../configuration/interfaces';
import SessionController from './session-controller';
import TestController from '../api/test-controller';
import BrowserManipulationQueue from './browser-manipulation-queue';
import ObservedCallsitesStorage from './observed-callsites-storage';
import ClientScript from '../custom-client-scripts/client-script';
import BrowserConnection from '../browser/connection';
import { Quarantine } from '../utils/get-options/quarantine';
import RequestHook from '../api/request-hooks/hook';
import DriverStatus from '../client/driver/status';
import { CommandBase, ActionCommandBase } from './commands/base.js';
import Role from '../role/role';
import { TestRunErrorBase } from '../shared/errors';
import { CallsiteRecord } from '@devexpress/callsite-record';
import EventEmitter from 'events';
import getAssertionTimeout from '../utils/get-options/get-assertion-timeout';
import { AssertionCommand } from './commands/assertion';
import { TakeScreenshotBaseCommand } from './commands/browser-manipulation';
//@ts-ignore
import { TestRun as LegacyTestRun } from 'testcafe-legacy-api';
import { AuthCredentials } from '../api/structure/interfaces';
import TestRunPhase from './phase';

import {
    ExecuteClientFunctionCommand,
    ExecuteSelectorCommand,
} from './commands/execute-client-function';

import addRenderedWarning from '../notifications/add-rendered-warning';
import getBrowser from '../utils/get-browser';
import AssertionExecutor from '../assertions/executor';
import asyncFilter from '../utils/async-filter';
import Fixture from '../api/structure/fixture';
import MessageBus from '../utils/message-bus';
import executeFnWithTimeout from '../utils/execute-fn-with-timeout';
import { URL } from 'url';
import { CookieOptions } from './commands/options';
import { prepareSkipJsErrorsOptions } from '../api/skip-js-errors';
import { CookieProviderFactory } from './cookies/factory';
import { CookieProvider } from './cookies/base';
import { StoragesProvider } from './storages/base';
import { StoragesProviderFactory } from './storages/factory';

import wrapCustomAction from '../api/wrap-custom-action';

import {
    NativeAutomationRoleProvider,
    ProxyRoleProvider,
    RoleProvider,
} from './role-provider';

import NativeAutomationRequestPipeline from '../native-automation/request-pipeline';
import { NativeAutomationBase } from '../native-automation';
import ReportDataLog from '../reporter/report-data-log';
import remoteChrome from 'chrome-remote-interface';

const lazyRequire                   = require('import-lazy')(require);
const ClientFunctionBuilder         = lazyRequire('../client-functions/client-function-builder');
const TestRunBookmark               = lazyRequire('./bookmark');
const actionCommands                = lazyRequire('./commands/actions');
const browserManipulationCommands   = lazyRequire('./commands/browser-manipulation');
const serviceCommands               = lazyRequire('./commands/service');
const executeClientFunctionCommands = lazyRequire('./commands/execute-client-function');

const { executeJsExpression, executeAsyncJsExpression } = lazyRequire('./execute-js-expression');

const TEST_RUN_TEMPLATE               = read('../client/test-run/index.js.mustache') as string;
const IFRAME_TEST_RUN_TEMPLATE        = read('../client/test-run/iframe.js.mustache') as string;
const TEST_DONE_CONFIRMATION_RESPONSE = 'test-done-confirmation';
const MAX_RESPONSE_DELAY              = 3000;
const CHILD_WINDOW_READY_TIMEOUT      = 30 * 1000;

const ALL_DRIVER_TASKS_ADDED_TO_QUEUE_EVENT = 'all-driver-tasks-added-to-queue';


interface TestRunInit {
    test: Test;
    browserConnection: BrowserConnection;
    screenshotCapturer: Capturer;
    globalWarningLog: WarningLog;
    opts: Dictionary<OptionValue>;
    messageBus?: MessageBus;
    startRunExecutionTime?: Date;
    nativeAutomation: boolean;
}

interface DriverTask {
    command: CommandBase;
    resolve: Function;
    reject: Function;
    callsite: CallsiteRecord;
}

interface DriverMessage {
    status: DriverStatus;
}

interface DriverWarning {
    type: keyof typeof WARNING_MESSAGE;
    args: string[];
}

interface RequestTimeout {
    page?: number;
    ajax?: number;
}

interface ExecutionTimeout {
    timeout: number;
    rejectWith: TestTimeoutError | RunTimeoutError;
}

interface PendingRequest {
    responseTimeout: NodeJS.Timeout;
    resolve: Function;
    reject: Function;
}

interface BrowserManipulationResult {
    result: unknown;
    error: unknown;
}

interface OpenedWindowInformation {
    id: string;
    url: string;
    title: string;
}

export default class TestRun extends AsyncEventEmitter {
    private [testRunMarker]: boolean;
    public readonly warningLog: WarningLog;
    public readonly reportDataLog: ReportDataLog;
    private readonly opts: Dictionary<OptionValue>;
    public readonly test: Test;
    public readonly browserConnection: BrowserConnection;
    public unstable: boolean;
    public phase: TestRunPhase;
    private driverTaskQueue: DriverTask[];
    private testDoneCommandQueued: boolean;
    public activeDialogHandler: ExecuteClientFunctionCommand | null;
    public activeIframeSelector: ExecuteSelectorCommand | null;
    public speed: number;
    public pageLoadTimeout: number;
    private readonly testExecutionTimeout: ExecutionTimeout | null;
    private readonly runExecutionTimeout: ExecutionTimeout | null;
    private readonly disablePageReloads: boolean;
    private disablePageCaching: boolean;
    private disableMultipleWindows: boolean;
    private requestTimeout: RequestTimeout;
    public readonly session: SessionController;
    public consoleMessages: BrowserConsoleMessages;
    private pendingRequest: PendingRequest | null;
    public pendingPageError: PageLoadError | Error | null;
    public controller: TestController | null;
    public ctx: object;
    public fixtureCtx: object | null;
    public testRunCtx: object | null;
    private currentRoleId: string | null;
    private readonly usedRoleStates: Record<string, any>;
    public errs: TestRunErrorFormattableAdapter[];
    private lastDriverStatusId: string | null;
    private lastDriverStatusResponse: CommandBase | null | string;
    private fileDownloadingHandled: boolean;
    private attachmentDownloadingHandled: boolean;
    private resolveWaitForFileDownloadingPromise: Function | null;
    private addingDriverTasksCount: number;
    public debugging: boolean;
    private readonly debugOnFail: boolean;
    private readonly disableDebugBreakpoints: boolean;
    private readonly debugReporterPluginHost: ReporterPluginHost;
    private readonly browserManipulationQueue: BrowserManipulationQueue;
    private debugLog: TestRunDebugLog;
    public quarantine: Quarantine | null;
    private readonly debugLogger: any;
    public observedCallsites: ObservedCallsitesStorage;
    private readonly replicator: any;
    private disconnected: boolean;
    private errScreenshotPath: string | null;
    private asyncJsExpressionCallsites: Map<string, CallsiteRecord>;
    public readonly browser: Browser;
    private readonly _messageBus?: MessageBus;
    public readonly cookieProvider: CookieProvider;
    private _storagesProvider: StoragesProvider;
    public readonly startRunExecutionTime?: Date;
    public finishTime?: Date;
    private readonly _requestHookEventProvider: RequestHookEventProvider;
    private readonly _roleProvider: RoleProvider;
    public readonly isNativeAutomation: boolean;
    public readonly isExperimentalMultipleWindows: boolean;

    public constructor ({ test, browserConnection, screenshotCapturer, globalWarningLog, opts, messageBus, startRunExecutionTime, nativeAutomation }: TestRunInit) {
        super();

        this[testRunMarker]    = true;
        this._messageBus       = messageBus;
        this.warningLog        = new WarningLog(globalWarningLog, WarningLog.createAddWarningCallback(messageBus, this));
        this.reportDataLog     = new ReportDataLog(ReportDataLog.createAddDataCallback(messageBus, this));
        this.opts              = opts;
        this.test              = test;
        this.browserConnection = browserConnection;
        this.unstable          = false;
        this.browser           = getBrowser(browserConnection, nativeAutomation);

        this.phase = TestRunPhase.initial;

        this.driverTaskQueue       = [];
        this.testDoneCommandQueued = false;

        this.activeDialogHandler  = null;
        this.activeIframeSelector = null;
        this.speed                = this.opts.speed as number;
        this.pageLoadTimeout      = this._getPageLoadTimeout(test, opts);
        this.testExecutionTimeout = this._getTestExecutionTimeout(opts);

        this.disablePageReloads = test.disablePageReloads || opts.disablePageReloads as boolean && test.disablePageReloads !== false;
        this.disablePageCaching = test.disablePageCaching || opts.disablePageCaching as boolean;
        this.isNativeAutomation = nativeAutomation;

        this.disableMultipleWindows        = opts.disableMultipleWindows as boolean;
        this.isExperimentalMultipleWindows = opts.experimentalMultipleWindows as boolean;

        this.requestTimeout = this._getRequestTimeout(test, opts);

        this.session = SessionController.getSession(this);

        this.consoleMessages = new BrowserConsoleMessages();

        this.pendingRequest   = null;
        this.pendingPageError = null;

        this.controller = null;
        this.ctx        = Object.create(null);
        this.fixtureCtx = null;
        this.testRunCtx = null;

        this.currentRoleId  = null;
        this.usedRoleStates = Object.create(null);

        this.errs = [];

        this.lastDriverStatusId       = null;
        this.lastDriverStatusResponse = null;

        this.fileDownloadingHandled               = false;
        this.resolveWaitForFileDownloadingPromise = null;

        this.attachmentDownloadingHandled = false;

        this.addingDriverTasksCount = 0;

        this.debugging               = this.opts.debugMode as boolean;
        this.debugOnFail             = this.opts.debugOnFail as boolean;
        this.disableDebugBreakpoints = false;
        this.debugReporterPluginHost = new ReporterPluginHost({ noColors: false });

        this.browserManipulationQueue = new BrowserManipulationQueue(browserConnection, screenshotCapturer, this.warningLog, nativeAutomation);

        this.debugLog = new TestRunDebugLog(this.browserConnection.userAgent);

        this.quarantine = null;

        this.debugLogger = this.opts.debugLogger;

        this.observedCallsites          = new ObservedCallsitesStorage();
        this.asyncJsExpressionCallsites = new Map<string, CallsiteRecord>();

        this.replicator = createReplicator([ new SelectorNodeTransform() ]);

        this.disconnected      = false;
        this.errScreenshotPath = null;

        this.startRunExecutionTime     = startRunExecutionTime;
        this.runExecutionTimeout       = this._getRunExecutionTimeout(opts);
        this._requestHookEventProvider = this._getRequestHookEventProvider();
        this._roleProvider             = this._getRoleProvider();

        this.cookieProvider    = CookieProviderFactory.create(this, this.isNativeAutomation);
        this._storagesProvider = StoragesProviderFactory.create(this, this.isNativeAutomation);

        this._addInjectables();
    }

    private _getRequestHookEventProvider (): RequestHookEventProvider {
        if (!this.isNativeAutomation)
            return this.session.requestHookEventProvider;

        return this._nativeAutomationRequestPipeline.requestHookEventProvider;
    }

    public saveStoragesSnapshot (storageSnapshot: StoragesSnapshot): void {
        if (this.isNativeAutomation)
            this._nativeAutomationRequestPipeline.restoringStorages = storageSnapshot;
    }

    private get _nativeAutomationRequestPipeline (): NativeAutomationRequestPipeline {
        return this._nativeAutomation.requestPipeline;
    }

    private get _nativeAutomation (): NativeAutomationBase {
        return this.browserConnection.getNativeAutomation();
    }

    private _getRoleProvider (): RoleProvider {
        if (this.isNativeAutomation)
            return new NativeAutomationRoleProvider(this);

        return new ProxyRoleProvider(this);
    }

    private _getPageLoadTimeout (test: Test, opts: Dictionary<OptionValue>): number {
        if (test.timeouts?.pageLoadTimeout !== void 0)
            return test.timeouts.pageLoadTimeout;

        return opts.pageLoadTimeout as number;
    }

    private _getRequestTimeout (test: Test, opts: Dictionary<OptionValue>): RequestTimeout {
        return {
            page: test.timeouts?.pageRequestTimeout || opts.pageRequestTimeout as number,
            ajax: test.timeouts?.ajaxRequestTimeout || opts.ajaxRequestTimeout as number,
        };
    }

    private _getExecutionTimeout (timeout: number, error: TestTimeoutError | RunTimeoutError): ExecutionTimeout {
        return {
            timeout,
            rejectWith: error,
        };
    }

    private _getTestExecutionTimeout (opts: Dictionary<OptionValue>): ExecutionTimeout | null {
        const testExecutionTimeout = opts.testExecutionTimeout as number || 0;

        if (!testExecutionTimeout)
            return null;

        return this._getExecutionTimeout(testExecutionTimeout, new TestTimeoutError(testExecutionTimeout));
    }

    private _getRunExecutionTimeout (opts: Dictionary<OptionValue>): ExecutionTimeout | null {
        const runExecutionTimeout = opts.runExecutionTimeout as number || 0;

        if (!runExecutionTimeout)
            return null;

        return this._getExecutionTimeout(runExecutionTimeout, new RunTimeoutError(runExecutionTimeout));
    }

    public get restRunExecutionTimeout (): ExecutionTimeout | null {
        if (!this.startRunExecutionTime || !this.runExecutionTimeout)
            return null;

        const currentTimeout = Math.max(this.runExecutionTimeout.timeout - (Date.now() - this.startRunExecutionTime.getTime()), 0);

        return this._getExecutionTimeout(currentTimeout, this.runExecutionTimeout.rejectWith);
    }

    public get executionTimeout (): ExecutionTimeout | null {
        return this.restRunExecutionTimeout && (!this.testExecutionTimeout || this.restRunExecutionTimeout.timeout < this.testExecutionTimeout.timeout)
            ? this.restRunExecutionTimeout
            : this.testExecutionTimeout || null;
    }

    public async getCurrentCDPSession (): Promise<remoteChrome.ProtocolApi | null> {
        return this.browserConnection.getCurrentCDPSession();
    }

    private _addClientScriptContentWarningsIfNecessary (): void {
        const { empty, duplicatedContent } = findProblematicScripts(this.test.clientScripts as ClientScript[]);

        if (empty.length)
            this.warningLog.addWarning(WARNING_MESSAGE.clientScriptsWithEmptyContent);

        if (duplicatedContent.length) {
            const suffix                            = getPluralSuffix(duplicatedContent);
            const duplicatedContentClientScriptsStr = getConcatenatedValuesString(duplicatedContent, '\n');

            this.warningLog.addWarning(WARNING_MESSAGE.clientScriptsWithDuplicatedContent, suffix, duplicatedContentClientScriptsStr);
        }
    }

    private _addInjectables (): void {
        this._addClientScriptContentWarningsIfNecessary();

        if (!this.isNativeAutomation) {
            this.injectable.scripts.push(...INJECTABLES.SCRIPTS);
            this.injectable.styles.push(INJECTABLES.TESTCAFE_UI_STYLES);
        }

        this.injectable.userScripts.push(...this.test.clientScripts.map(script => {
            return {
                url:  (script as ClientScript).getResultUrl(this.id),
                page: script.page as RequestFilterRule,
            };
        }));
    }

    public get id (): string {
        return this.session.id;
    }

    public get injectable (): InjectableResources {
        return this.session.injectable;
    }

    public addQuarantineInfo (quarantine: Quarantine): void {
        this.quarantine = quarantine;
    }

    private async _addRequestHook (hook: RequestHook): Promise<void> {
        if (this.test.requestHooks.includes(hook))
            return;

        this.test.requestHooks.push(hook);
        await this._initRequestHook(hook);
    }

    private async _removeRequestHook (hook: RequestHook): Promise<void> {
        if (!this.test.requestHooks.includes(hook))
            return;

        pull(this.test.requestHooks, hook);
        await this._disposeRequestHook(hook);
    }

    private async _initRequestHook (hook: RequestHook): Promise<void> {
        hook._warningLog = this.warningLog;

        await Promise.all(hook._requestFilterRules.map(rule => {
            return this._requestHookEventProvider.addRequestEventListeners(rule, {
                onRequest:           hook.onRequest.bind(hook),
                onConfigureResponse: hook._onConfigureResponse.bind(hook),
                onResponse:          hook.onResponse.bind(hook),
            }, (err: RequestHookMethodError) => this._onRequestHookMethodError(err, hook._className));
        }));
    }

    private _onRequestHookMethodError (event: RequestHookMethodError, hookClassName: string): void {
        let err: Error | TestRunErrorBase            = event.error;
        const isRequestHookNotImplementedMethodError = (err as unknown as TestRunErrorBase)?.code === TEST_RUN_ERRORS.requestHookNotImplementedError;

        if (!isRequestHookNotImplementedMethodError)
            err = new RequestHookUnhandledError(err, hookClassName, event.methodName);

        this.addError(err);
    }

    private async _disposeRequestHook (hook: RequestHook): Promise<void> {
        hook._warningLog = null;

        await Promise.all(hook._requestFilterRules.map(rule => {
            return this._requestHookEventProvider.removeRequestEventListeners(rule);
        }));
    }

    private async _detachRequestEventListeners (rules: RequestFilterRule[]): Promise<void> {
        await Promise.all(rules.map(rule => {
            return this._requestHookEventProvider.removeRequestEventListeners(rule);
        }));
    }

    private async _initRequestHooks (): Promise<void> {
        await Promise.all(this.test.requestHooks.map(hook => this._initRequestHook(hook)));
    }

    private _prepareSkipJsErrorsOption (): boolean | ExecuteClientFunctionCommand {
        const options = this.test.skipJsErrorsOptions !== void 0
            ? this.test.skipJsErrorsOptions
            : this.opts.skipJsErrors as SkipJsErrorsOptionsObject | boolean || false;

        return prepareSkipJsErrorsOptions(options);
    }

    // Hammerhead payload
    public async getPayloadScript (windowId?: string): Promise<string> {
        this.fileDownloadingHandled               = false;
        this.resolveWaitForFileDownloadingPromise = null;

        const skipJsErrors = this._prepareSkipJsErrorsOption();

        return Mustache.render(TEST_RUN_TEMPLATE, {
            testRunId:                                               JSON.stringify(this.session.id),
            browserId:                                               JSON.stringify(this.browserConnection.id),
            activeWindowId:                                          JSON.stringify(this.activeWindowId),
            windowId:                                                JSON.stringify(windowId || ''),
            browserHeartbeatRelativeUrl:                             JSON.stringify(this.browserConnection.heartbeatRelativeUrl),
            browserStatusRelativeUrl:                                JSON.stringify(this.browserConnection.statusRelativeUrl),
            browserStatusDoneRelativeUrl:                            JSON.stringify(this.browserConnection.statusDoneRelativeUrl),
            browserIdleRelativeUrl:                                  JSON.stringify(this.browserConnection.idleRelativeUrl),
            browserActiveWindowIdUrl:                                JSON.stringify(this.browserConnection.activeWindowIdUrl),
            browserEnsureWindowInNativeAutomationUrl:                JSON.stringify(this.browserConnection.ensureWindowInNativeAutomationUrl),
            browserCloseWindowUrl:                                   JSON.stringify(this.browserConnection.closeWindowUrl),
            browserOpenFileProtocolRelativeUrl:                      JSON.stringify(this.browserConnection.openFileProtocolRelativeUrl),
            browserDispatchNativeAutomationEventRelativeUrl:         JSON.stringify(this.browserConnection.dispatchNativeAutomationEventRelativeUrl),
            browserDispatchNativeAutomationEventSequenceRelativeUrl: JSON.stringify(this.browserConnection.dispatchNativeAutomationEventSequenceRelativeUrl),
            browserParseSelectorUrl:                                 JSON.stringify(this.browserConnection.parseSelectorRelativeUrl),
            userAgent:                                               JSON.stringify(this.browserConnection.userAgent),
            testName:                                                JSON.stringify(this.test.name),
            fixtureName:                                             JSON.stringify((this.test.fixture as Fixture).name),
            selectorTimeout:                                         this.opts.selectorTimeout,
            pageLoadTimeout:                                         this.pageLoadTimeout,
            childWindowReadyTimeout:                                 CHILD_WINDOW_READY_TIMEOUT,
            skipJsErrors:                                            JSON.stringify(skipJsErrors),
            retryTestPages:                                          this.opts.retryTestPages,
            speed:                                                   this.speed,
            dialogHandler:                                           JSON.stringify(this.activeDialogHandler),
            canUseDefaultWindowActions:                              JSON.stringify(await this.browserConnection.canUseDefaultWindowActions()),
            nativeAutomation:                                        this.isNativeAutomation,
            experimentalMultipleWindows:                             this.isExperimentalMultipleWindows,
            domain:                                                  JSON.stringify(this.browserConnection.browserConnectionGateway.proxy.server1Info.domain),
        });
    }

    public async getIframePayloadScript (): Promise<string> {
        const browserEnsureWindowInNativeAutomationUrl = JSON.stringify(this.browserConnection.ensureWindowInNativeAutomationUrl);
        const experimentalMultipleWindows = this.isExperimentalMultipleWindows;

        return Mustache.render(IFRAME_TEST_RUN_TEMPLATE, {
            testRunId:        JSON.stringify(this.session.id),
            selectorTimeout:  this.opts.selectorTimeout,
            pageLoadTimeout:  this.pageLoadTimeout,
            retryTestPages:   !!this.opts.retryTestPages,
            speed:            this.speed,
            dialogHandler:    JSON.stringify(this.activeDialogHandler),
            nativeAutomation: JSON.stringify(this.isNativeAutomation),
            domain:           JSON.stringify(this.browserConnection.browserConnectionGateway.proxy.server1Info.domain),
            browserEnsureWindowInNativeAutomationUrl,
            experimentalMultipleWindows,
        });
    }

    // Hammerhead handlers
    public getAuthCredentials (): null | AuthCredentials {
        return this.test.authCredentials;
    }

    public handleFileDownload (): void {
        if (this.resolveWaitForFileDownloadingPromise) {
            this.resolveWaitForFileDownloadingPromise(true);
            this.resolveWaitForFileDownloadingPromise = null;
        }
        else
            this.fileDownloadingHandled = true;
    }

    public handleAttachment (data: { isOpenedInNewWindow: boolean }): void {
        if (data.isOpenedInNewWindow)
            this.attachmentDownloadingHandled = true;
    }

    public handlePageError (ctx: any, err: Error): void {
        this.pendingPageError = new PageLoadError(err, ctx.reqOpts.url);

        ctx.redirect(ctx.toProxyUrl(SPECIAL_ERROR_PAGE));
    }

    // Test function execution
    private async _executeTestFn (phase: TestRunPhase, fn: Function, timeout: ExecutionTimeout | null): Promise<boolean> {
        this.phase = phase;

        try {
            await executeFnWithTimeout(fn, timeout, this);
        }
        catch (err: any) {
            await this._makeScreenshotOnFail();

            this.addError(err);

            return false;
        }
        finally {
            this.errScreenshotPath = null;
        }

        return !this._addPendingPageErrorIfAny();
    }

    private async _runBeforeHook (): Promise<boolean> {
        if (this.test.globalBeforeFn)
            await this._executeTestFn(TestRunPhase.inTestBeforeHook, this.test.globalBeforeFn, this.executionTimeout);

        if (this.test.beforeFn)
            return await this._executeTestFn(TestRunPhase.inTestBeforeHook, this.test.beforeFn, this.executionTimeout);

        if (this.test.fixture?.beforeEachFn)
            return await this._executeTestFn(TestRunPhase.inFixtureBeforeEachHook, this.test.fixture?.beforeEachFn, this.executionTimeout);

        return true;
    }

    private async _runAfterHook (): Promise<void> {
        if (this.test.afterFn)
            await this._executeTestFn(TestRunPhase.inTestAfterHook, this.test.afterFn, this.executionTimeout);
        else if (this.test.fixture?.afterEachFn)
            await this._executeTestFn(TestRunPhase.inFixtureAfterEachHook, this.test.fixture?.afterEachFn, this.executionTimeout);

        if (this.test.globalAfterFn)
            await this._executeTestFn(TestRunPhase.inTestAfterHook, this.test.globalAfterFn, this.executionTimeout);
    }

    private async _finalizeTestRun (id: string): Promise<void> {
        testRunTracker.removeActiveTestRun(id);
    }

    public async start (): Promise<void> {
        testRunTracker.addActiveTestRun(this);

        await this.emit('start');

        const onDisconnected = (err: Error): void => this._disconnect(err);

        this.browserConnection.once('disconnected', onDisconnected);

        await this.once('connected');

        await this.emit('ready');

        if (await this._runBeforeHook()) {
            await this._executeTestFn(TestRunPhase.inTest, this.test.fn as Function, this.executionTimeout);
            await this._runAfterHook();
        }

        if (this.disconnected)
            return;

        this.phase = TestRunPhase.pendingFinalization;

        this.browserConnection.removeListener('disconnected', onDisconnected);

        if (this.errs.length && this.debugOnFail) {
            const errStr = this.debugReporterPluginHost.formatError(this.errs[0]);

            await this._enqueueSetBreakpointCommand(void 0, null, errStr);
        }

        await this.emit('before-done');

        await this._internalExecuteCommand(new serviceCommands.TestDoneCommand());

        this._addPendingPageErrorIfAny();
        this._requestHookEventProvider.clearRequestEventListeners();
        this.normalizeRequestHookErrors();

        await this._finalizeTestRun(this.session.id);

        await this.emit('done');
    }

    // Errors
    private _addPendingPageErrorIfAny (): boolean {
        const error = this.pendingPageError;

        if (error) {
            this.addError(error);

            this.pendingPageError = null;

            return true;
        }

        return false;
    }

    private _ensureErrorId (err: Error): void {
        // @ts-ignore
        err.id = err.id || nanoid(7);
    }

    private _createErrorAdapter (err: Error): TestRunErrorFormattableAdapter {
        this._ensureErrorId(err);

        return new TestRunErrorFormattableAdapter(err, {
            userAgent:      this.browserConnection.userAgent,
            screenshotPath: this.errScreenshotPath || '',
            testRunId:      this.id,
            testRunPhase:   this.phase,
        });
    }

    public addError (err: Error | TestCafeErrorList | TestRunErrorBase): void {
        const errList = (err instanceof TestCafeErrorList ? err.items : [err]) as Error[];

        errList.forEach(item => {
            const adapter = this._createErrorAdapter(item);

            this.errs.push(adapter);
        });
    }

    public normalizeRequestHookErrors (): void {
        const requestHookErrors = remove(this.errs, e =>
            (e as unknown as TestRunErrorBase).code === TEST_RUN_ERRORS.requestHookNotImplementedError ||
            (e as unknown as TestRunErrorBase).code === TEST_RUN_ERRORS.requestHookUnhandledError) as unknown as RequestHookBaseError[];

        if (!requestHookErrors.length)
            return;

        const uniqRequestHookErrors = chain(requestHookErrors)
            .uniqBy(e => {
                const err = e as unknown as RequestHookBaseError;

                return err.hookClassName + err.methodName;
            })
            .sortBy(['hookClassName', 'methodName'])
            .value() as unknown as TestRunErrorFormattableAdapter[];

        this.errs = this.errs.concat(uniqRequestHookErrors);
    }

    // Task queue
    private _enqueueCommand (command: CommandBase, callsite: CallsiteRecord): Promise<unknown> {
        if (this.pendingRequest)
            this._resolvePendingRequest(command);

        return new Promise(async (resolve, reject) => { // eslint-disable-line no-async-promise-executor
            this.addingDriverTasksCount--;
            this.driverTaskQueue.push({ command, resolve, reject, callsite });

            if (!this.addingDriverTasksCount)
                await this.emit(ALL_DRIVER_TASKS_ADDED_TO_QUEUE_EVENT, this.driverTaskQueue.length);
        });
    }

    public get driverTaskQueueLength (): Promise<number> {
        return this.addingDriverTasksCount ? promisifyEvent(this as unknown as EventEmitter, ALL_DRIVER_TASKS_ADDED_TO_QUEUE_EVENT) : Promise.resolve(this.driverTaskQueue.length);
    }

    public async _enqueueBrowserConsoleMessagesCommand (command: CommandBase, callsite: CallsiteRecord): Promise<unknown> {
        await this._enqueueCommand(command, callsite);

        const consoleMessageCopy = this.consoleMessages.getCopy();

        // @ts-ignore
        return consoleMessageCopy[String(this.activeWindowId)];
    }

    public async _enqueueGetCookies (command: GetCookiesCommand): Promise<Partial<CookieOptions>[]> {
        const { cookies, urls } = command;

        return this.cookieProvider.getCookies(cookies, urls);
    }

    public async _enqueueSetCookies (command: SetCookiesCommand): Promise<void> {
        const cookies = command.cookies;
        const url     = command.url || await this.getCurrentUrl();

        return this.cookieProvider.setCookies(cookies, url);
    }

    public async _enqueueDeleteCookies (command: DeleteCookiesCommand): Promise<void> {
        const { cookies, urls } = command;

        return this.cookieProvider.deleteCookies(cookies, urls);
    }

    private async _enqueueSetBreakpointCommand (callsite: CallsiteRecord | undefined, selector?: object | null, error?: string): Promise<void> {
        if (this.debugLogger)
            this.debugLogger.showBreakpoint(this.session.id, this.browserConnection.userAgent, callsite, error);

        this.debugging = await this._internalExecuteCommand(new serviceCommands.SetBreakpointCommand(!!error, selector), callsite) as boolean;
    }

    private _removeAllNonServiceTasks (): void {
        this.driverTaskQueue = this.driverTaskQueue.filter(driverTask => isServiceCommand(driverTask.command));

        this.browserManipulationQueue.removeAllNonServiceManipulations();
    }

    // Current driver task
    public get currentDriverTask (): DriverTask {
        return this.driverTaskQueue[0];
    }

    public get baseUrl (): string {
        return this.opts.baseUrl as string || '';
    }

    private _resolveCurrentDriverTask (result?: unknown): void {
        this.currentDriverTask.resolve(result);
        this.driverTaskQueue.shift();

        if (this.testDoneCommandQueued)
            this._removeAllNonServiceTasks();
    }

    private _rejectCurrentDriverTask (err: Error): void {
        // @ts-ignore
        err.callsite = err.callsite || this.currentDriverTask.callsite;

        this.currentDriverTask.reject(err);
        this._removeAllNonServiceTasks();
    }

    // Pending request
    private _clearPendingRequest (): void {
        if (this.pendingRequest) {
            clearTimeout(this.pendingRequest.responseTimeout);
            this.pendingRequest = null;
        }
    }

    private _resolvePendingRequest (command: CommandBase | null): void {
        this.lastDriverStatusResponse = command;

        if (this.pendingRequest)
            this.pendingRequest.resolve(command);

        this._clearPendingRequest();
    }

    // Handle driver request
    private _shouldResolveCurrentDriverTask (driverStatus: DriverStatus): boolean {
        const currentCommand = this.currentDriverTask.command;

        const isExecutingObservationCommand = currentCommand instanceof executeClientFunctionCommands.ExecuteSelectorCommand ||
            currentCommand instanceof ExecuteClientFunctionCommand;

        const isDebugActive = currentCommand instanceof serviceCommands.SetBreakpointCommand;

        const shouldExecuteCurrentCommand =
            driverStatus.isFirstRequestAfterWindowSwitching && (isExecutingObservationCommand || isDebugActive);

        return !shouldExecuteCurrentCommand;
    }

    private _fulfillCurrentDriverTask (driverStatus: DriverStatus): void {
        if (!this.currentDriverTask)
            return;

        if (driverStatus.warnings?.length) {
            driverStatus.warnings.forEach((warning: DriverWarning) => {
                addRenderedWarning(this.warningLog, WARNING_MESSAGE[warning.type], this.currentDriverTask.callsite, ...warning.args);
            });
        }

        if (driverStatus.executionError)
            this._rejectCurrentDriverTask(driverStatus.executionError);
        else if (this._shouldResolveCurrentDriverTask(driverStatus))
            this._resolveCurrentDriverTask(driverStatus.result);
    }

    private _handlePageErrorStatus (pageError: Error): boolean {
        if (this.currentDriverTask && isCommandRejectableByPageError(this.currentDriverTask.command)) {
            this._rejectCurrentDriverTask(pageError);
            this.pendingPageError = null;

            return true;
        }

        this.pendingPageError = this.pendingPageError || pageError;

        return false;
    }

    private async _handleDriverRequest (driverStatus: DriverStatus): Promise<CommandBase | null | string> {
        const isTestDone                 = this.currentDriverTask && this.currentDriverTask.command.type ===
                                           COMMAND_TYPE.testDone;
        const pageError                  = this.pendingPageError || driverStatus.pageError;
        const currentTaskRejectedByError = pageError && this._handlePageErrorStatus(pageError);

        this.consoleMessages.concat(driverStatus.consoleMessages);

        if (!currentTaskRejectedByError && driverStatus.isCommandResult) {
            if (isTestDone) {
                this._resolveCurrentDriverTask();

                return TEST_DONE_CONFIRMATION_RESPONSE;
            }

            this._fulfillCurrentDriverTask(driverStatus);

            if (driverStatus.isPendingWindowSwitching)
                return null;
        }

        return this._getCurrentDriverTaskCommand();
    }

    private async _getCurrentDriverTaskCommand (): Promise<CommandBase | null> {
        if (!this.currentDriverTask)
            return null;

        const command = this.currentDriverTask.command;

        if (command.type === COMMAND_TYPE.navigateTo && (command as any).stateSnapshot)
            await this._roleProvider.useStateSnapshot(JSON.parse((command as any).stateSnapshot));

        return command;
    }

    // Execute command
    private async _executeJsExpression (command: ExecuteExpressionCommand): Promise<unknown> {
        const resultVariableName = command.resultVariableName;
        let expression           = command.expression;

        if (resultVariableName)
            expression = `${resultVariableName} = ${expression}, ${resultVariableName}`;

        return executeJsExpression(expression, this, { skipVisibilityCheck: false });
    }

    private async _executeAsyncJsExpression (command: ExecuteAsyncExpressionCommand, callsite?: string): Promise<unknown> {
        return executeAsyncJsExpression(command.expression, this, callsite);
    }

    private async _executeAssertion (command: AssertionCommand, callsite: CallsiteRecord): Promise<void> {
        const assertionTimeout = getAssertionTimeout(command, this.opts);
        const executor         = new AssertionExecutor(command, assertionTimeout, callsite);

        executor.once('start-assertion-retries', (timeout: number) => this._internalExecuteCommand(new serviceCommands.ShowAssertionRetriesStatusCommand(timeout)));
        executor.once('end-assertion-retries', (success: boolean) => this._internalExecuteCommand(new serviceCommands.HideAssertionRetriesStatusCommand(success)));

        const executeFn = this.decoratePreventEmitActionEvents(() => executor.run(), { prevent: true });

        return await executeFn();
    }

    private _adjustConfigurationWithCommand (command: CommandBase): void {
        if (command.type === COMMAND_TYPE.testDone) {
            this.testDoneCommandQueued = true;
            if (this.debugLogger)
                this.debugLogger.hideBreakpoint(this.session.id);
        }

        else if (command.type === COMMAND_TYPE.setNativeDialogHandler)
            this.activeDialogHandler = (command as any).dialogHandler;

        else if (command.type === COMMAND_TYPE.switchToIframe)
            this.activeIframeSelector = (command as any).selector;

        else if (command.type === COMMAND_TYPE.switchToMainWindow)
            this.activeIframeSelector = null;

        else if (command.type === COMMAND_TYPE.setTestSpeed)
            this.speed = (command as any).speed;

        else if (command.type === COMMAND_TYPE.setPageLoadTimeout)
            this.pageLoadTimeout = (command as any).duration;

        else if (command.type === COMMAND_TYPE.debug)
            this.debugging = true;
    }

    private async _adjustScreenshotCommand (command: TakeScreenshotBaseCommand): Promise<void> {
        const browserId                    = this.browserConnection.id;
        const { hasChromelessScreenshots } = await this.browserConnection.provider.hasCustomActionForBrowser(browserId);

        if (!hasChromelessScreenshots)
            command.generateScreenshotMark();
    }

    public async _adjustCommandOptionsAndEnvironment (command: CommandBase, callsite: CallsiteRecord): Promise<void> {
        if ((command as any).options?.confidential !== void 0)
            return;

        if (command.type === COMMAND_TYPE.typeText) {
            const result = await this._internalExecuteCommand((command as any).selector, callsite);

            if (!result)
                return;

            const node = this.replicator.decode(result);

            (command as any).options.confidential = isPasswordInput(node);
        }

        else if (command.type === COMMAND_TYPE.pressKey) {
            const result = await this._internalExecuteCommand(new serviceCommands.GetActiveElementCommand());

            if (!result)
                return;

            const node = this.replicator.decode(result);

            (command as any).options.confidential = isPasswordInput(node);
        }
    }

    public async _setBreakpointIfNecessary (command: CommandBase, callsite?: CallsiteRecord): Promise<void> {
        if (!this.disableDebugBreakpoints && this.debugging && canSetDebuggerBreakpointBeforeCommand(command))
            await this._enqueueSetBreakpointCommand(callsite);
    }

    public async executeCommand (command: CommandBase | ActionCommandBase, callsite?: string | CallsiteRecord): Promise<unknown> {
        return command instanceof ActionCommandBase
            ? this._executeActionCommand(command, callsite as CallsiteRecord)
            : this._internalExecuteCommand(command, callsite);
    }

    public async _executeActionCommand (command: ActionCommandBase, callsite: CallsiteRecord): Promise<unknown> {
        const actionArgs = { apiActionName: command.methodName, command };

        let errorAdapter = null;
        let error        = null;
        let result       = null;

        const start = new Date().getTime();

        try {
            await this._adjustCommandOptionsAndEnvironment(command, callsite);
        }
        catch (err) {
            error = err;
        }

        await this.emitActionEvent('action-start', actionArgs);


        try {
            if (!error)
                result = await this._internalExecuteCommand(command, callsite);
        }
        catch (err) {
            if (this.phase === TestRunPhase.pendingFinalization && err instanceof ExternalAssertionLibraryError)
                addRenderedWarning(this.warningLog, { message: WARNING_MESSAGE.unawaitedMethodWithAssertion, actionId: command.actionId }, callsite);
            else
                error = err;
        }

        const duration = new Date().getTime() - start;

        if (error) {
            // NOTE: check if error is TestCafeErrorList is specific for the `useRole` action
            // if error is TestCafeErrorList we do not need to create an adapter,
            // since error is already was processed in role initializer
            if (!(error instanceof TestCafeErrorList)) {
                await this._makeScreenshotOnFail(command.actionId);

                errorAdapter = this._createErrorAdapter(processTestFnError(error));
            }
            else
                errorAdapter = error.adapter;
        }

        Object.assign(actionArgs, {
            result,
            duration,
            err: errorAdapter,
        });

        await this.emitActionEvent('action-done', actionArgs);

        if (error)
            throw error;

        return result;
    }

    public async _internalExecuteCommand (command: CommandBase, callsite?: CallsiteRecord | string): Promise<unknown> {
        this.debugLog.command(command);

        if (this.pendingPageError && isCommandRejectableByPageError(command))
            return this._rejectCommandWithPageError(callsite as CallsiteRecord);

        if (isExecutableOnClientCommand(command))
            this.addingDriverTasksCount++;

        this._adjustConfigurationWithCommand(command);

        await this._setBreakpointIfNecessary(command, callsite as CallsiteRecord);

        if (isScreenshotCommand(command)) {
            if (this.opts.disableScreenshots) {
                this.warningLog.addWarning({ message: WARNING_MESSAGE.screenshotsDisabled, actionId: command.actionId });

                return null;
            }

            await this._adjustScreenshotCommand(command as TakeScreenshotBaseCommand);
        }

        if (isBrowserManipulationCommand(command)) {
            this.browserManipulationQueue.push(command);

            if (isResizeWindowCommand(command) && this.opts.videoPath)
                this.warningLog.addWarning({ message: WARNING_MESSAGE.videoBrowserResizing, actionId: command.actionId }, this.test.name);
        }

        if (command.type === COMMAND_TYPE.wait)
            return delay((command as any).timeout);

        if (command.type === COMMAND_TYPE.setPageLoadTimeout)
            return null;

        if (command.type === COMMAND_TYPE.debug) {
            const canDebug = !this.browserConnection.isHeadlessBrowser();

            if (canDebug)
                return await this._enqueueSetBreakpointCommand(callsite as CallsiteRecord, (command as DebugCommand)?.selector, void 0);

            this.debugging = false;

            this.warningLog.addWarning({ message: WARNING_MESSAGE.debugInHeadlessError, actionId: command.actionId });

            return null;
        }

        if (command.type === COMMAND_TYPE.useRole) {
            let fn = (): Promise<void> => this._useRole((command as any).role, callsite as CallsiteRecord);

            fn = this.decoratePreventEmitActionEvents(fn, { prevent: true });
            fn = this.decorateDisableDebugBreakpoints(fn, { disable: true });

            return await fn();
        }

        if (command.type === COMMAND_TYPE.runCustomAction) {
            const { fn, args } = command as RunCustomActionCommand;
            const wrappedFn    = wrapCustomAction(fn);

            return await wrappedFn(this, args);
        }

        if (command.type === COMMAND_TYPE.report)
            return await this.reportDataLog.addData(command.args as any[]);

        if (command.type === COMMAND_TYPE.assertion)
            return this._executeAssertion(command as AssertionCommand, callsite as CallsiteRecord);

        if (command.type === COMMAND_TYPE.executeExpression)
            return await this._executeJsExpression(command as ExecuteExpressionCommand);

        if (command.type === COMMAND_TYPE.executeAsyncExpression)
            return this._executeAsyncJsExpression(command as ExecuteAsyncExpressionCommand, callsite as string);

        if (command.type === COMMAND_TYPE.getBrowserConsoleMessages)
            return this._enqueueBrowserConsoleMessagesCommand(command, callsite as CallsiteRecord);

        if (command.type === COMMAND_TYPE.switchToPreviousWindow)
            (command as any).windowId = this.browserConnection.previousActiveWindowId;

        if (command.type === COMMAND_TYPE.switchToWindowByPredicate)
            return this._switchToWindowByPredicate(command as SwitchToWindowByPredicateCommand);

        if (command.type === COMMAND_TYPE.getCookies)
            return this._enqueueGetCookies(command as GetCookiesCommand);

        if (command.type === COMMAND_TYPE.setCookies)
            return this._enqueueSetCookies(command as SetCookiesCommand);

        if (command.type === COMMAND_TYPE.deleteCookies)
            return this._enqueueDeleteCookies(command as DeleteCookiesCommand);

        if (command.type === COMMAND_TYPE.addRequestHooks)
            return Promise.all((command as AddRequestHooksCommand).hooks.map(hook => this._addRequestHook(hook)));

        if (command.type === COMMAND_TYPE.removeRequestHooks)
            return Promise.all((command as RemoveRequestHooksCommand).hooks.map(hook => this._removeRequestHook(hook)));

        if (command.type === COMMAND_TYPE.getCurrentCDPSession)
            return this.getCurrentCDPSession();

        return this._enqueueCommand(command, callsite as CallsiteRecord);
    }

    private _rejectCommandWithPageError (callsite?: CallsiteRecord): Promise<Error> {
        const err = this.pendingPageError;

        // @ts-ignore
        err.callsite          = callsite;
        this.pendingPageError = null;

        return Promise.reject(err);
    }

    private _sendCloseChildWindowOnFileDownloadingCommand (): CommandBase {
        return new actionCommands.CloseChildWindowOnFileDownloading();
    }

    public async _makeScreenshotOnFail (failedActionId?: string): Promise<void> {
        const { screenshots } = this.opts as { screenshots: ScreenshotOptionValue };

        if (!this.errScreenshotPath && screenshots?.takeOnFails)
            this.errScreenshotPath = await this._internalExecuteCommand(new browserManipulationCommands.TakeScreenshotOnFailCommand({ failedActionId, fullPage: screenshots.fullPage })) as string;
    }

    private _decorateWithFlag (fn: Function, flagName: string, value: boolean): () => Promise<void> {
        return async () => {
            // @ts-ignore
            this[flagName] = value;

            try {
                return await fn();
            }
            finally {
                // @ts-ignore
                this[flagName] = !value;
            }
        };
    }

    public decoratePreventEmitActionEvents (fn: Function, { prevent }: { prevent: boolean }): () => Promise<void> {
        return this._decorateWithFlag(fn, 'preventEmitActionEvents', prevent);
    }

    public decorateDisableDebugBreakpoints (fn: Function, { disable }: { disable: boolean }): () => Promise<void> {
        return this._decorateWithFlag(fn, 'disableDebugBreakpoints', disable);
    }

    // Role management
    public async getStateSnapshot (): Promise<StateSnapshot> {
        const state = await this._roleProvider.getStateSnapshot();

        state.storages = await this._internalExecuteCommand(new serviceCommands.BackupStoragesCommand()) as StoragesSnapshot;

        return state;
    }

    private async _cleanUpCtxs (): Promise<void> {
        this.ctx        = Object.create(null);
        this.fixtureCtx = Object.create(null);
        this.testRunCtx = Object.create(null);
    }

    public async switchToCleanRun (url: string): Promise<void> {
        await this._cleanUpCtxs();

        this.consoleMessages = new BrowserConsoleMessages();

        await this._roleProvider.useStateSnapshot(StateSnapshot.empty());

        if (this.speed !== this.opts.speed) {
            const setSpeedCommand = new actionCommands.SetTestSpeedCommand({ speed: this.opts.speed });

            await this._internalExecuteCommand(setSpeedCommand);
        }

        if (this.pageLoadTimeout !== this.opts.pageLoadTimeout) {
            const setPageLoadTimeoutCommand = new actionCommands.SetPageLoadTimeoutCommand({ duration: this.opts.pageLoadTimeout });

            await this._internalExecuteCommand(setPageLoadTimeoutCommand);
        }

        await this.navigateToUrl(url, true);

        if (this.activeDialogHandler) {
            const removeDialogHandlerCommand = new actionCommands.SetNativeDialogHandlerCommand({ dialogHandler: { fn: null } });

            await this._internalExecuteCommand(removeDialogHandlerCommand);
        }
    }

    public async navigateToUrl (url: string, forceReload: boolean, stateSnapshot?: string): Promise<void> {
        const navigateCommand = new actionCommands.NavigateToCommand({ url, forceReload, stateSnapshot });

        await this._internalExecuteCommand(navigateCommand);
    }

    private async _getStateSnapshotFromRole (role: Role): Promise<StateSnapshot> {
        const prevPhase = this.phase;

        if (role.phase === ROLE_PHASE.initialized && role.initErr instanceof TestCafeErrorList && role.initErr.hasErrors)
            role.initErr.adapter = this._createErrorAdapter(role.initErr.items[0]);

        this.phase = TestRunPhase.inRoleInitializer;

        if (role.phase === ROLE_PHASE.uninitialized)
            await role.initialize(this);

        else if (role.phase === ROLE_PHASE.pendingInitialization)
            await promisifyEvent(role, 'initialized');

        if (role.initErr)
            throw role.initErr;

        this.phase = prevPhase;

        return role.stateSnapshot;
    }

    private async _useRole (role: Role, callsite: CallsiteRecord): Promise<void> {
        if (this.phase === TestRunPhase.inRoleInitializer)
            throw new RoleSwitchInRoleInitializerError(callsite);

        const bookmark = new TestRunBookmark(this, role);

        await bookmark.init();

        if (this.currentRoleId)
            this.usedRoleStates[this.currentRoleId] = await this.getStateSnapshot();

        const stateSnapshot = this.usedRoleStates[role.id] || await this._getStateSnapshotFromRole(role);

        await this._roleProvider.useStateSnapshot(stateSnapshot);

        this.currentRoleId = role.id;

        await bookmark.restore(callsite, stateSnapshot);
    }

    public async getCurrentUrl (): Promise<string> {
        const builder = new ClientFunctionBuilder(() => {
            return window.location.href; // eslint-disable-line no-undef
        }, { boundTestRun: this });

        const getLocation = builder.getFunction();

        return await getLocation();
    }

    private async _switchToWindowByPredicate (command: SwitchToWindowByPredicateCommand): Promise<void> {
        const currentWindows = await this._internalExecuteCommand(new GetCurrentWindowsCommand({}, this) as CommandBase) as OpenedWindowInformation[];

        const windows = await asyncFilter<OpenedWindowInformation>(currentWindows, async wnd => {
            try {
                const predicateData = {
                    url:   new URL(wnd.url),
                    title: wnd.title,
                };

                return command.checkWindow(predicateData);
            }
            catch (e: any) {
                throw new SwitchToWindowPredicateError(e.message);
            }
        });

        if (!windows.length)
            throw new WindowNotFoundError();

        if (windows.length > 1)
            this.warningLog.addWarning({ message: WARNING_MESSAGE.multipleWindowsFoundByPredicate, actionId: command.actionId });

        await this._internalExecuteCommand(new SwitchToWindowCommand({ windowId: windows[0].id }, this) as CommandBase);
    }

    private _disconnect (err: Error): void {
        this.disconnected = true;

        if (this.currentDriverTask)
            this._rejectCurrentDriverTask(err);

        this.emit('disconnected', err);

        testRunTracker.removeActiveTestRun(this.session.id);
    }

    private _handleFileDownloadingInNewWindowRequest (): CommandBase | null {
        if (this.attachmentDownloadingHandled) {
            this.attachmentDownloadingHandled = false;

            return this._sendCloseChildWindowOnFileDownloadingCommand();
        }

        return null;
    }

    public async emitActionEvent (eventName: string, args: unknown): Promise<void> {
        // @ts-ignore
        if (!this.preventEmitActionEvents)
            await this.emit(eventName, args);
    }

    public static isMultipleWindowsAllowed (testRun: TestRun): boolean {
        const { disableMultipleWindows, test } = testRun;

        return !disableMultipleWindows && !(test as LegacyTestRun).isLegacy && !!testRun.activeWindowId;
    }

    public async initialize (): Promise<void> {
        if (!this.test.skip) {
            await this._clearCookiesAndStorages();
            await this._initRequestHooks();
        }
    }

    private async _clearCookiesAndStorages (): Promise<void> {
        if (this.disablePageReloads)
            return;

        await this.cookieProvider.initialize();
        await this._storagesProvider.initialize();
    }

    public get activeWindowId (): null | string {
        return this.browserConnection.activeWindowId;
    }

    // NOTE: this function is time-critical and must return ASAP to avoid client disconnection
    private async [CLIENT_MESSAGES.ready] (msg: DriverMessage): Promise<unknown> {
        if (msg.status.isObservingFileDownloadingInNewWindow)
            return this._handleFileDownloadingInNewWindowRequest();

        this.debugLog.driverMessage(msg);

        if (this.disconnected)
            return Promise.reject(new GeneralError(RUNTIME_ERRORS.testRunRequestInDisconnectedBrowser, this.browserConnection.browserInfo.alias));

        this.emit('connected');

        this._clearPendingRequest();

        // NOTE: the driver sends the status for the second time if it didn't get a response at the
        // first try. This is possible when the page was unloaded after the driver sent the status.
        if (msg.status.id === this.lastDriverStatusId)
            return this.lastDriverStatusResponse;

        this.lastDriverStatusId       = msg.status.id;
        this.lastDriverStatusResponse = await this._handleDriverRequest(msg.status);

        if (this.lastDriverStatusResponse || msg.status.isPendingWindowSwitching)
            return this.lastDriverStatusResponse;

        // NOTE: we send an empty response after the MAX_RESPONSE_DELAY timeout is exceeded to keep connection
        // with the client and prevent the response timeout exception on the client side
        const responseTimeout = setTimeout(() => this._resolvePendingRequest(null), MAX_RESPONSE_DELAY);

        return new Promise((resolve, reject) => {
            this.pendingRequest = { resolve, reject, responseTimeout };
        });
    }

    private async [CLIENT_MESSAGES.readyForBrowserManipulation] (msg: DriverMessage): Promise<BrowserManipulationResult> {
        this.debugLog.driverMessage(msg);

        let result = null;
        let error  = null;

        try {
            result = await this.browserManipulationQueue.executePendingManipulation(msg, this._messageBus);
        }
        catch (err: unknown) {
            if (err instanceof Error) {
                error = {
                    name:            err.name,
                    message:         err.message,
                    stack:           err.stack,
                    isInternalError: true,
                };
            }
            else
                error = err;
        }

        return { result, error };
    }

    private async [CLIENT_MESSAGES.waitForFileDownload] (msg: DriverMessage): Promise<boolean> {
        this.debugLog.driverMessage(msg);

        return new Promise(resolve => {
            if (this.fileDownloadingHandled) {
                this.fileDownloadingHandled = false;
                resolve(true);
            }
            else
                this.resolveWaitForFileDownloadingPromise = resolve;
        });
    }
}
