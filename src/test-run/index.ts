import {
    pull,
    remove,
    chain
} from 'lodash';

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
    RequestHookBaseError
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
    RequestEvent,
    ConfigureResponseEvent,
    ResponseEvent,
    RequestHookMethodError,
    StoragesSnapshot
} from 'testcafe-hammerhead';
import * as INJECTABLES from '../assets/injectables';
import { findProblematicScripts } from '../custom-client-scripts/utils';
import getCustomClientScriptUrl from '../custom-client-scripts/get-url';
import { getPluralSuffix, getConcatenatedValuesString } from '../utils/string';

import {
    isCommandRejectableByPageError,
    isBrowserManipulationCommand,
    isScreenshotCommand,
    isServiceCommand,
    canSetDebuggerBreakpointBeforeCommand,
    isExecutableOnClientCommand,
    isResizeWindowCommand
} from './commands/utils';

import {
    GetCurrentWindowsCommand,
    SwitchToWindowByPredicateCommand,
    SwitchToWindowCommand
} from './commands/actions';

import { RUNTIME_ERRORS, TEST_RUN_ERRORS } from '../errors/types';
import processTestFnError from '../errors/process-test-fn-error';
import RequestHookMethodNames from '../api/request-hooks/hook-method-names';
import { createReplicator, SelectorNodeTransform } from '../client-functions/replicator';
import Test from '../api/structure/test';
import Capturer from '../screenshots/capturer';
import { Dictionary } from '../configuration/interfaces';
import CompilerService from '../services/compiler/host';
import SessionController from './session-controller';
import TestController from '../api/test-controller';
import BrowserManipulationQueue from './browser-manipulation-queue';
import ObservedCallsitesStorage from './observed-callsites-storage';
import ClientScript from '../custom-client-scripts/client-script';
import BrowserConnection from '../browser/connection';
import { Quarantine } from '../utils/get-options/quarantine';
import RequestHook from '../api/request-hooks/hook';
import DriverStatus from '../client/driver/status';
import CommandBase from './commands/base.js';
import Role from '../role/role';
import { TestRunErrorBase } from '../shared/errors';
import { CallsiteRecord } from 'callsite-record';
import EventEmitter from 'events';
import getAssertionTimeout from '../utils/get-options/get-assertion-timeout';
import AssertionCommand from './commands/assertion';
import { TakeScreenshotBaseCommand } from './commands/browser-manipulation';
//@ts-ignore
import { TestRun as LegacyTestRun } from 'testcafe-legacy-api';
import { AuthCredentials } from '../api/structure/interfaces';
import TestRunPhase from './phase';
import { ExecuteClientFunctionCommand, ExecuteSelectorCommand } from './commands/observation';

const lazyRequire                 = require('import-lazy')(require);
const ClientFunctionBuilder       = lazyRequire('../client-functions/client-function-builder');
const TestRunBookmark             = lazyRequire('./bookmark');
const AssertionExecutor           = lazyRequire('../assertions/executor');
const actionCommands              = lazyRequire('./commands/actions');
const browserManipulationCommands = lazyRequire('./commands/browser-manipulation');
const serviceCommands             = lazyRequire('./commands/service');
const observationCommands         = lazyRequire('./commands/observation');

const { executeJsExpression, executeAsyncJsExpression } = lazyRequire('./execute-js-expression');

const TEST_RUN_TEMPLATE               = read('../client/test-run/index.js.mustache') as string;
const IFRAME_TEST_RUN_TEMPLATE        = read('../client/test-run/iframe.js.mustache') as string;
const TEST_DONE_CONFIRMATION_RESPONSE = 'test-done-confirmation';
const MAX_RESPONSE_DELAY              = 3000;
const CHILD_WINDOW_READY_TIMEOUT      = 30 * 1000;

const ALL_DRIVER_TASKS_ADDED_TO_QUEUE_EVENT = 'all-driver-tasks-added-to-queue';

const COMPILER_SERVICE_EVENTS = [
    'setMock',
    'setConfigureResponseEventOptions',
    'setHeaderOnConfigureResponseEvent',
    'removeHeaderOnConfigureResponseEvent'
];

const PROXYLESS_COMMANDS = new Map<string, string>();

PROXYLESS_COMMANDS.set(COMMAND_TYPE.executeClientFunction, 'hasExecuteClientFunction');
PROXYLESS_COMMANDS.set(COMMAND_TYPE.switchToIframe, 'hasSwitchToIframe');
PROXYLESS_COMMANDS.set(COMMAND_TYPE.switchToMainWindow, 'hasSwitchToMainWindow');

interface TestRunInit {
    test: Test;
    browserConnection: BrowserConnection;
    screenshotCapturer: Capturer;
    globalWarningLog: WarningLog;
    opts: Dictionary<OptionValue>;
    compilerService?: CompilerService;
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

interface RequestTimeout {
    page?: number;
    ajax?: number;
}

interface PendingRequest {
    responseTimeout: NodeJS.Timeout;
    resolve: Function;
    reject: Function;
}

interface BrowserManipulationResult {
    result: unknown;
    error: Error;
}

interface OpenedWindowInformation {
    id: string;
    url: string;
    title: string;
}

export default class TestRun extends AsyncEventEmitter {
    private [testRunMarker]: boolean;
    public readonly warningLog: WarningLog;
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
    private disablePageReloads: boolean;
    private disablePageCaching: boolean;
    private disableMultipleWindows: boolean;
    private requestTimeout: RequestTimeout;
    public readonly session: SessionController;
    public consoleMessages: BrowserConsoleMessages;
    private pendingRequest: PendingRequest | null;
    private pendingPageError: PageLoadError | Error | null;
    public controller: TestController | null;
    public ctx: object;
    public fixtureCtx: object | null;
    private currentRoleId: string | null;
    private readonly usedRoleStates: Record<string, any>;
    public errs: TestRunErrorFormattableAdapter[];
    private lastDriverStatusId: string | null;
    private lastDriverStatusResponse: CommandBase | null | string;
    private fileDownloadingHandled: boolean;
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
    private readonly compilerService?: CompilerService;
    private readonly replicator: any;
    private disconnected: boolean;
    private errScreenshotPath: string | null;

    public constructor ({ test, browserConnection, screenshotCapturer, globalWarningLog, opts, compilerService }: TestRunInit) {
        super();

        this[testRunMarker]    = true;
        this.warningLog        = new WarningLog(globalWarningLog);
        this.opts              = opts;
        this.test              = test;
        this.browserConnection = browserConnection;
        this.unstable          = false;

        this.phase = TestRunPhase.initial;

        this.driverTaskQueue       = [];
        this.testDoneCommandQueued = false;

        this.activeDialogHandler  = null;
        this.activeIframeSelector = null;
        this.speed                = this.opts.speed as number;
        this.pageLoadTimeout      = this._getPageLoadTimeout(test, opts);

        this.disablePageReloads   = test.disablePageReloads || opts.disablePageReloads as boolean && test.disablePageReloads !== false;
        this.disablePageCaching   = test.disablePageCaching || opts.disablePageCaching as boolean;

        this.disableMultipleWindows = opts.disableMultipleWindows as boolean;

        this.requestTimeout = this._getRequestTimeout(test, opts);

        this.session = SessionController.getSession(this);

        this.consoleMessages = new BrowserConsoleMessages();

        this.pendingRequest   = null;
        this.pendingPageError = null;

        this.controller = null;
        this.ctx        = Object.create(null);
        this.fixtureCtx = null;

        this.currentRoleId  = null;
        this.usedRoleStates = Object.create(null);

        this.errs = [];

        this.lastDriverStatusId       = null;
        this.lastDriverStatusResponse = null;

        this.fileDownloadingHandled               = false;
        this.resolveWaitForFileDownloadingPromise = null;

        this.addingDriverTasksCount = 0;

        this.debugging               = this.opts.debugMode as boolean;
        this.debugOnFail             = this.opts.debugOnFail as boolean;
        this.disableDebugBreakpoints = false;
        this.debugReporterPluginHost = new ReporterPluginHost({ noColors: false });

        this.browserManipulationQueue = new BrowserManipulationQueue(browserConnection, screenshotCapturer, this.warningLog);

        this.debugLog = new TestRunDebugLog(this.browserConnection.userAgent);

        this.quarantine  = null;

        this.debugLogger = this.opts.debugLogger;

        this.observedCallsites = new ObservedCallsitesStorage();
        this.compilerService   = compilerService;

        this.replicator = createReplicator([ new SelectorNodeTransform() ]);

        this.disconnected      = false;
        this.errScreenshotPath = null;

        this._addInjectables();
        this._initRequestHooks();
    }

    private _getPageLoadTimeout (test: Test, opts: Dictionary<OptionValue>): number {
        if (test.timeouts?.pageLoadTimeout !== void 0)
            return test.timeouts.pageLoadTimeout;

        return opts.pageLoadTimeout as number;
    }

    private _getRequestTimeout (test: Test, opts: Dictionary<OptionValue>): RequestTimeout {
        return {
            page: test.timeouts?.pageRequestTimeout || opts.pageRequestTimeout as number,
            ajax: test.timeouts?.ajaxRequestTimeout || opts.ajaxRequestTimeout as number
        };
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
        this.injectable.scripts.push(...INJECTABLES.SCRIPTS);
        this.injectable.userScripts.push(...this.test.clientScripts.map(script => {
            return {
                url:  getCustomClientScriptUrl(script as ClientScript),
                page: script.page as RequestFilterRule
            };
        }));
        this.injectable.styles.push(INJECTABLES.TESTCAFE_UI_STYLES);
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

    public addRequestHook (hook: RequestHook): void {
        if (this.test.requestHooks.includes(hook))
            return;

        this.test.requestHooks.push(hook);
        this._initRequestHook(hook);
    }

    public removeRequestHook (hook: RequestHook): void {
        if (!this.test.requestHooks.includes(hook))
            return;

        pull(this.test.requestHooks, hook);
        this._disposeRequestHook(hook);
    }

    private _initRequestHook (hook: RequestHook): void {
        hook._warningLog = this.warningLog;

        hook._requestFilterRules.forEach(rule => {
            this.session.addRequestEventListeners(rule, {
                onRequest:           hook.onRequest.bind(hook),
                onConfigureResponse: hook._onConfigureResponse.bind(hook),
                onResponse:          hook.onResponse.bind(hook)
            }, (err: RequestHookMethodError) => this._onRequestHookMethodError(err, hook._className));
        });
    }

    private _initRequestHookForCompilerService (hookId: string, hookClassName: string, rules: RequestFilterRule[]): void {
        const testId = this.test.id;

        rules.forEach(rule => {
            this.session.addRequestEventListeners(rule, {
                onRequest:           (event: RequestEvent) => this.compilerService?.onRequestHookEvent({ testId, hookId, name: RequestHookMethodNames.onRequest, eventData: event }),
                onConfigureResponse: (event: ConfigureResponseEvent) => this.compilerService?.onRequestHookEvent({ testId, hookId, name: RequestHookMethodNames._onConfigureResponse, eventData: event }),
                onResponse:          (event: ResponseEvent) => this.compilerService?.onRequestHookEvent({ testId, hookId, name: RequestHookMethodNames.onResponse, eventData: event })
            }, err => this._onRequestHookMethodError(err, hookClassName));
        });
    }

    private _onRequestHookMethodError (event: RequestHookMethodError, hookClassName: string): void {
        let err: Error | TestRunErrorBase            = event.error;
        const isRequestHookNotImplementedMethodError = (err as unknown as TestRunErrorBase)?.code === TEST_RUN_ERRORS.requestHookNotImplementedError;

        if (!isRequestHookNotImplementedMethodError)
            err = new RequestHookUnhandledError(err, hookClassName, event.methodName);

        this.addError(err);
    }

    private _disposeRequestHook (hook: RequestHook): void {
        hook._warningLog = null;

        hook._requestFilterRules.forEach(rule => {
            this.session.removeRequestEventListeners(rule);
        });
    }

    private _detachRequestEventListeners (rules: RequestFilterRule[]): void {
        rules.forEach(rule => {
            this.session.removeRequestEventListeners(rule);
        });
    }

    private _subscribeOnCompilerServiceEvents (): void {
        COMPILER_SERVICE_EVENTS.forEach(eventName => {
            this.compilerService?.on(eventName, async args => {
                // @ts-ignore
                await this.session[eventName](...args);
            });
        });

        this.compilerService?.on('addRequestEventListeners', async ({ hookId, hookClassName, rules }) => {
            this._initRequestHookForCompilerService(hookId, hookClassName, rules);
        });

        this.compilerService?.on('removeRequestEventListeners', async ({ rules }) => {
            this._detachRequestEventListeners(rules);
        });
    }

    private _initRequestHooks (): void {
        if (this.compilerService) {
            this._subscribeOnCompilerServiceEvents();
            this.test.requestHooks.forEach(hook => {
                this._initRequestHookForCompilerService(hook.id, hook._className, hook._requestFilterRules);
            });
        }
        else
            this.test.requestHooks.forEach(hook => this._initRequestHook(hook));
    }

    // Hammerhead payload
    public async getPayloadScript (): Promise<string> {
        this.fileDownloadingHandled               = false;
        this.resolveWaitForFileDownloadingPromise = null;

        return Mustache.render(TEST_RUN_TEMPLATE, {
            testRunId:                    JSON.stringify(this.session.id),
            browserId:                    JSON.stringify(this.browserConnection.id),
            browserHeartbeatRelativeUrl:  JSON.stringify(this.browserConnection.heartbeatRelativeUrl),
            browserStatusRelativeUrl:     JSON.stringify(this.browserConnection.statusRelativeUrl),
            browserStatusDoneRelativeUrl: JSON.stringify(this.browserConnection.statusDoneRelativeUrl),
            browserActiveWindowIdUrl:     JSON.stringify(this.browserConnection.activeWindowIdUrl),
            userAgent:                    JSON.stringify(this.browserConnection.userAgent),
            testName:                     JSON.stringify(this.test.name),
            fixtureName:                  JSON.stringify(this.test.fixture.name),
            selectorTimeout:              this.opts.selectorTimeout,
            pageLoadTimeout:              this.pageLoadTimeout,
            childWindowReadyTimeout:      CHILD_WINDOW_READY_TIMEOUT,
            skipJsErrors:                 this.opts.skipJsErrors,
            retryTestPages:               this.opts.retryTestPages,
            speed:                        this.speed,
            dialogHandler:                JSON.stringify(this.activeDialogHandler),
            canUseDefaultWindowActions:   JSON.stringify(await this.browserConnection.canUseDefaultWindowActions())
        });
    }

    public async getIframePayloadScript (): Promise<string> {
        return Mustache.render(IFRAME_TEST_RUN_TEMPLATE, {
            testRunId:       JSON.stringify(this.session.id),
            selectorTimeout: this.opts.selectorTimeout,
            pageLoadTimeout: this.pageLoadTimeout,
            retryTestPages:  !!this.opts.retryTestPages,
            speed:           this.speed,
            dialogHandler:   JSON.stringify(this.activeDialogHandler)
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

    public handlePageError (ctx: any, err: Error): void {
        this.pendingPageError = new PageLoadError(err, ctx.reqOpts.url);

        ctx.redirect(ctx.toProxyUrl(SPECIAL_ERROR_PAGE));
    }

    // Test function execution
    private async _executeTestFn (phase: TestRunPhase, fn: Function): Promise<boolean> {
        this.phase = phase;

        try {
            await fn(this);
        }
        catch (err) {
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
        if (this.test.beforeFn)
            return await this._executeTestFn(TestRunPhase.inTestBeforeHook, this.test.beforeFn);

        if (this.test.fixture.beforeEachFn)
            return await this._executeTestFn(TestRunPhase.inFixtureBeforeEachHook, this.test.fixture.beforeEachFn);

        return true;
    }

    private async _runAfterHook (): Promise<boolean> {
        if (this.test.afterFn)
            return await this._executeTestFn(TestRunPhase.inTestAfterHook, this.test.afterFn);

        if (this.test.fixture.afterEachFn)
            return await this._executeTestFn(TestRunPhase.inFixtureAfterEachHook, this.test.fixture.afterEachFn);

        return true;
    }

    public async start (): Promise<void> {
        testRunTracker.addActiveTestRun(this);

        await this.emit('start');

        const onDisconnected = (err: Error): void => this._disconnect(err);

        this.browserConnection.once('disconnected', onDisconnected);

        await this.once('connected');

        await this.emit('ready');

        if (await this._runBeforeHook()) {
            await this._executeTestFn(TestRunPhase.inTest, this.test.fn as Function);
            await this._runAfterHook();
        }

        if (this.disconnected)
            return;

        this.browserConnection.removeListener('disconnected', onDisconnected);

        if (this.errs.length && this.debugOnFail) {
            const errStr = this.debugReporterPluginHost.formatError(this.errs[0]);

            await this._enqueueSetBreakpointCommand(void 0, errStr);
        }

        await this.emit('before-done');

        await this.executeCommand(new serviceCommands.TestDoneCommand());

        this._addPendingPageErrorIfAny();
        this.session.clearRequestEventListeners();
        this.normalizeRequestHookErrors();

        delete testRunTracker.activeTestRuns[this.session.id];

        await this.emit('done');
    }

    // Errors
    private _addPendingPageErrorIfAny (): boolean {
        if (this.pendingPageError) {
            this.addError(this.pendingPageError);
            this.pendingPageError = null;

            return true;
        }

        return false;
    }

    private _createErrorAdapter (err: Error): TestRunErrorFormattableAdapter {
        return new TestRunErrorFormattableAdapter(err, {
            userAgent:      this.browserConnection.userAgent,
            screenshotPath: this.errScreenshotPath || '',
            testRunId:      this.id,
            testRunPhase:   this.phase
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
            (e as unknown as TestRunErrorBase).code === TEST_RUN_ERRORS.requestHookUnhandledError);

        if (!requestHookErrors.length)
            return;

        const uniqRequestHookErrors = chain(requestHookErrors)
            .uniqBy(e => {
                const err = e as unknown as RequestHookBaseError;

                return err.hookClassName + err.methodName;
            })
            .sortBy(['hookClassName', 'methodName'])
            .value();

        this.errs = this.errs.concat(uniqRequestHookErrors);
    }

    // Task queue
    private _enqueueCommand (command: CommandBase, callsite: CallsiteRecord): Promise<unknown> {
        if (this.pendingRequest)
            this._resolvePendingRequest(command);

        return new Promise(async (resolve, reject) => {
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
        return consoleMessageCopy[String(this.browserConnection.activeWindowId)];
    }

    private async _enqueueSetBreakpointCommand (callsite: CallsiteRecord | undefined, error?: string): Promise<void> {
        if (this.browserConnection.isHeadlessBrowser()) {
            this.warningLog.addWarning(WARNING_MESSAGE.debugInHeadlessError);
            return;
        }

        if (this.debugLogger)
            this.debugLogger.showBreakpoint(this.session.id, this.browserConnection.userAgent, callsite, error);

        this.debugging = await this.executeCommand(new serviceCommands.SetBreakpointCommand(!!error, !!this.compilerService), callsite) as boolean;
    }

    private _removeAllNonServiceTasks (): void {
        this.driverTaskQueue = this.driverTaskQueue.filter(driverTask => isServiceCommand(driverTask.command));

        this.browserManipulationQueue.removeAllNonServiceManipulations();
    }

    private _handleDebugState (driverStatus: DriverStatus): void {
        if (driverStatus.debug)
            this.emit(driverStatus.debug);
    }

    // Current driver task
    public get currentDriverTask (): DriverTask {
        return this.driverTaskQueue[0];
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
        this.pendingRequest?.resolve(command);
        this._clearPendingRequest();
    }

    // Handle driver request
    private _shouldResolveCurrentDriverTask (driverStatus: DriverStatus): boolean {
        const currentCommand = this.currentDriverTask.command;

        const isExecutingObservationCommand = currentCommand instanceof observationCommands.ExecuteSelectorCommand ||
            currentCommand instanceof ExecuteClientFunctionCommand;

        const isDebugActive = currentCommand instanceof serviceCommands.SetBreakpointCommand;

        const shouldExecuteCurrentCommand =
            driverStatus.isFirstRequestAfterWindowSwitching && (isExecutingObservationCommand || isDebugActive);

        return !shouldExecuteCurrentCommand;
    }

    private _fulfillCurrentDriverTask (driverStatus: DriverStatus): void {
        if (!this.currentDriverTask)
            return;

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

    private _handleDriverRequest (driverStatus: DriverStatus): CommandBase | null | string {
        const isTestDone                 = this.currentDriverTask && this.currentDriverTask.command.type ===
                                           COMMAND_TYPE.testDone;
        const pageError                  = this.pendingPageError || driverStatus.pageError;
        const currentTaskRejectedByError = pageError && this._handlePageErrorStatus(pageError);

        this.consoleMessages.concat(driverStatus.consoleMessages);

        this._handleDebugState(driverStatus);

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

    private _getCurrentDriverTaskCommand (): CommandBase | null {
        if (!this.currentDriverTask)
            return null;

        const command = this.currentDriverTask.command;

        if (command.type === COMMAND_TYPE.navigateTo && (command as any).stateSnapshot)
            this.session.useStateSnapshot(JSON.parse((command as any).stateSnapshot));

        return command;
    }

    // Execute command
    private _executeJsExpression (command: CommandBase): unknown {
        const resultVariableName = (command as any).resultVariableName;
        let expression           = (command as any).expression;

        if (resultVariableName)
            expression = `${resultVariableName} = ${expression}, ${resultVariableName}`;

        return executeJsExpression(expression, this, { skipVisibilityCheck: false });
    }

    private async _executeAssertion (command: AssertionCommand, callsite: CallsiteRecord): Promise<void> {
        const assertionTimeout = getAssertionTimeout(command, this.opts);
        const executor         = new AssertionExecutor(command, assertionTimeout, callsite);

        executor.once('start-assertion-retries', (timeout: number) => this.executeCommand(new serviceCommands.ShowAssertionRetriesStatusCommand(timeout)));
        executor.once('end-assertion-retries', (success: boolean) => this.executeCommand(new serviceCommands.HideAssertionRetriesStatusCommand(success)));

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

        else if (command.type === COMMAND_TYPE.disableDebug) {
            this.debugLogger.hideBreakpoint(this.session.id);

            this.debugging = false;
        }

    }

    private async _adjustScreenshotCommand (command: TakeScreenshotBaseCommand): Promise<void> {
        const browserId                    = this.browserConnection.id;
        const { hasChromelessScreenshots } = await this.browserConnection.provider.hasCustomActionForBrowser(browserId);

        if (!hasChromelessScreenshots)
            command.generateScreenshotMark();
    }

    public async _adjustCommandOptions (command: CommandBase): Promise<void> {
        if ((command as any).options?.confidential !== void 0)
            return;

        if (command.type === COMMAND_TYPE.typeText) {
            const result = await this.executeCommand((command as any).selector);

            if (!result)
                return;

            const node = this.replicator.decode(result);

            (command as any).options.confidential = isPasswordInput(node);
        }

        else if (command.type === COMMAND_TYPE.pressKey) {
            const result = await this.executeCommand(new serviceCommands.GetActiveElementCommand());

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

    public async executeAction (apiActionName: string, command: CommandBase, callsite: CallsiteRecord): Promise<unknown> {
        const actionArgs = { apiActionName, command };

        let errorAdapter = null;
        let error        = null;
        let result       = null;

        await this._adjustCommandOptions(command);

        await this.emitActionEvent('action-start', actionArgs);

        const start = new Date().getTime();

        try {
            result = await this.executeCommand(command, callsite);
        }
        catch (err) {
            error = err;
        }

        const duration = new Date().getTime() - start;

        if (error) {
            // NOTE: check if error is TestCafeErrorList is specific for the `useRole` action
            // if error is TestCafeErrorList we do not need to create an adapter,
            // since error is already was processed in role initializer
            if (!(error instanceof TestCafeErrorList)) {
                await this._makeScreenshotOnFail();

                errorAdapter = this._createErrorAdapter(processTestFnError(error));
            }
        }

        Object.assign(actionArgs, {
            result,
            duration,
            err: errorAdapter
        });

        await this.emitActionEvent('action-done', actionArgs);

        if (error)
            throw error;

        return result;
    }

    private async _canExecuteCommandThroughCDP (command: CommandBase): Promise<boolean> {
        if (!this.opts.isProxyless || !PROXYLESS_COMMANDS.has(command.type))
            return false;

        const browserId         = this.browserConnection.id;
        const customActionsInfo = await this.browserConnection.provider.hasCustomActionForBrowser(browserId);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return customActionsInfo[PROXYLESS_COMMANDS.get(command.type)!];
    }

    public async executeCommand (command: CommandBase, callsite?: CallsiteRecord): Promise<unknown> {
        this.debugLog.command(command);

        let postAction = null as (() => Promise<unknown>) | null;

        if (this.pendingPageError && isCommandRejectableByPageError(command))
            return this._rejectCommandWithPageError(callsite);

        if (isExecutableOnClientCommand(command))
            this.addingDriverTasksCount++;

        this._adjustConfigurationWithCommand(command);

        await this._setBreakpointIfNecessary(command, callsite);

        if (await this._canExecuteCommandThroughCDP(command)) {
            const browserId = this.browserConnection.id;

            if (command.type === COMMAND_TYPE.executeClientFunction)
                return this.browserConnection.provider.executeClientFunction(browserId, command, callsite);
            else if (command.type === COMMAND_TYPE.switchToIframe)
                postAction = async () => this.browserConnection.provider.switchToIframe(browserId);
            else if (command.type === COMMAND_TYPE.switchToMainWindow)
                postAction = async () => this.browserConnection.provider.switchToMainWindow(browserId);
        }

        if (isScreenshotCommand(command)) {
            if (this.opts.disableScreenshots) {
                this.warningLog.addWarning(WARNING_MESSAGE.screenshotsDisabled);

                return null;
            }

            await this._adjustScreenshotCommand(command as TakeScreenshotBaseCommand);
        }

        if (isBrowserManipulationCommand(command)) {
            this.browserManipulationQueue.push(command);

            if (isResizeWindowCommand(command) && this.opts.videoPath)
                this.warningLog.addWarning(WARNING_MESSAGE.videoBrowserResizing, this.test.name);
        }

        if (command.type === COMMAND_TYPE.wait)
            return delay((command as any).timeout);

        if (command.type === COMMAND_TYPE.setPageLoadTimeout)
            return null;

        if (command.type === COMMAND_TYPE.debug)
            return await this._enqueueSetBreakpointCommand(callsite);

        if (command.type === COMMAND_TYPE.useRole) {
            let fn = (): Promise<void> => this._useRole((command as any).role, callsite as CallsiteRecord);

            fn = this.decoratePreventEmitActionEvents(fn, { prevent: true });
            fn = this.decorateDisableDebugBreakpoints(fn, { disable: true });

            return await fn();
        }

        if (command.type === COMMAND_TYPE.assertion)
            return this._executeAssertion(command as AssertionCommand, callsite as CallsiteRecord);

        if (command.type === COMMAND_TYPE.executeExpression)
            return await this._executeJsExpression(command);

        if (command.type === COMMAND_TYPE.executeAsyncExpression)
            return await executeAsyncJsExpression((command as any).expression, this, callsite);

        if (command.type === COMMAND_TYPE.getBrowserConsoleMessages)
            return await this._enqueueBrowserConsoleMessagesCommand(command, callsite as CallsiteRecord);

        if (command.type === COMMAND_TYPE.switchToPreviousWindow)
            (command as any).windowId = this.browserConnection.previousActiveWindowId;

        if (command.type === COMMAND_TYPE.switchToWindowByPredicate)
            return this._switchToWindowByPredicate(command as SwitchToWindowByPredicateCommand);

        const result = await this._enqueueCommand(command, callsite as CallsiteRecord);

        if (postAction)
            await postAction();

        return result;
    }

    private _rejectCommandWithPageError (callsite?: CallsiteRecord): Promise<Error> {
        const err = this.pendingPageError;

        // @ts-ignore
        err.callsite          = callsite;
        this.pendingPageError = null;

        return Promise.reject(err);
    }

    public async _makeScreenshotOnFail (): Promise<void> {
        const { screenshots } = this.opts;

        if (!this.errScreenshotPath && (screenshots as ScreenshotOptionValue)?.takeOnFails)
            this.errScreenshotPath = await this.executeCommand(new browserManipulationCommands.TakeScreenshotOnFailCommand()) as string;
    }

    private _decorateWithFlag (fn: Function, flagName: string, value: boolean): () => Promise<void> {
        return async () => {
            // @ts-ignore
            this[flagName] = value;

            try {
                return await fn();
            }
            catch (err) {
                throw err;
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
        const state = this.session.getStateSnapshot();

        state.storages = await this.executeCommand(new serviceCommands.BackupStoragesCommand()) as StoragesSnapshot;

        return state;
    }

    public async switchToCleanRun (url: string): Promise<void> {
        this.ctx             = Object.create(null);
        this.fixtureCtx      = Object.create(null);
        this.consoleMessages = new BrowserConsoleMessages();

        this.session.useStateSnapshot(StateSnapshot.empty());

        if (this.speed !== this.opts.speed) {
            const setSpeedCommand = new actionCommands.SetTestSpeedCommand({ speed: this.opts.speed });

            await this.executeCommand(setSpeedCommand);
        }

        if (this.pageLoadTimeout !== this.opts.pageLoadTimeout) {
            const setPageLoadTimeoutCommand = new actionCommands.SetPageLoadTimeoutCommand({ duration: this.opts.pageLoadTimeout });

            await this.executeCommand(setPageLoadTimeoutCommand);
        }

        await this.navigateToUrl(url, true);

        if (this.activeDialogHandler) {
            const removeDialogHandlerCommand = new actionCommands.SetNativeDialogHandlerCommand({ dialogHandler: { fn: null } });

            await this.executeCommand(removeDialogHandlerCommand);
        }
    }

    public async navigateToUrl (url: string, forceReload: boolean, stateSnapshot?: string): Promise<void> {
        const navigateCommand = new actionCommands.NavigateToCommand({ url, forceReload, stateSnapshot });

        await this.executeCommand(navigateCommand);
    }

    private async _getStateSnapshotFromRole (role: Role): Promise<StateSnapshot> {
        const prevPhase = this.phase;

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

        this.session.useStateSnapshot(stateSnapshot);

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
        const currentWindows = await this.executeCommand(new GetCurrentWindowsCommand({}, this) as CommandBase) as OpenedWindowInformation[];

        const windows = currentWindows.filter(wnd => {
            try {
                const url = new URL(wnd.url);

                return (command as any).findWindow({ url, title: wnd.title });
            }
            catch (e) {
                throw new SwitchToWindowPredicateError(e.message);
            }
        });

        if (!windows.length)
            throw new WindowNotFoundError();

        if (windows.length > 1)
            this.warningLog.addWarning(WARNING_MESSAGE.multipleWindowsFoundByPredicate);

        await this.executeCommand(new SwitchToWindowCommand({ windowId: windows[0].id }, this) as CommandBase);
    }

    private _disconnect (err: Error): void {
        this.disconnected = true;

        if (this.currentDriverTask)
            this._rejectCurrentDriverTask(err);

        this.emit('disconnected', err);

        delete testRunTracker.activeTestRuns[this.session.id];
    }

    public async emitActionEvent (eventName: string, args: unknown): Promise<void> {
        // @ts-ignore
        if (!this.preventEmitActionEvents)
            await this.emit(eventName, args);
    }

    public static isMultipleWindowsAllowed (testRun: TestRun): boolean {
        const { disableMultipleWindows, test, browserConnection } = testRun;

        return !disableMultipleWindows && !(test as LegacyTestRun).isLegacy && !!browserConnection.activeWindowId;
    }

    public async initialize (): Promise<void> {
        if (!this.compilerService)
            return;

        await this.compilerService.initializeTestRunData({
            testRunId: this.id,
            testId:    this.test.id
        });
    }

    // NOTE: this function is time-critical and must return ASAP to avoid client disconnection
    private async [CLIENT_MESSAGES.ready] (msg: DriverMessage): Promise<unknown> {
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
        this.lastDriverStatusResponse = this._handleDriverRequest(msg.status);

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
            result = await this.browserManipulationQueue.executePendingManipulation(msg);
        }
        catch (err) {
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
