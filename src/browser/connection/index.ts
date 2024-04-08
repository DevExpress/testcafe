import debug from 'debug';
import timeLimit from 'time-limit-promise';
import { EventEmitter } from 'events';
import Mustache from 'mustache';
import { pull as remove } from 'lodash';
import {
    ParsedUserAgent,
    parseUserAgent,
} from '../../utils/parse-user-agent';
import { readSync as read } from 'read-file-relative';
import promisifyEvent from 'promisify-event';
import { nanoid } from 'nanoid';
import COMMAND from './command';
import BrowserConnectionStatus from './status';
import HeartbeatStatus from './heartbeat-status';
import { GeneralError, TimeoutError } from '../../errors/runtime';
import { RUNTIME_ERRORS } from '../../errors/types';
import BrowserConnectionGateway from './gateway';
import BrowserJob from '../../runner/browser-job';
import WarningLog from '../../notifications/warning-log';
import BrowserProvider from '../provider';
import SERVICE_ROUTES from './service-routes';
import {
    BROWSER_RESTART_TIMEOUT,
    BROWSER_CLOSE_TIMEOUT,
    HEARTBEAT_TIMEOUT,
    LOCAL_BROWSER_INIT_TIMEOUT,
    REMOTE_BROWSER_INIT_TIMEOUT,
} from '../../utils/browser-connection-timeouts';
import MessageBus from '../../utils/message-bus';
import BrowserConnectionTracker from './tracker';
import TestRun from '../../test-run';
// @ts-ignore
import { TestRun as LegacyTestRun } from 'testcafe-legacy-api';
import { Proxy } from 'testcafe-hammerhead';
import { NextTestRunInfo, OpenBrowserAdditionalOptions } from '../../shared/types';
import { EventType } from '../../native-automation/types';
import { NativeAutomationBase } from '../../native-automation';
import remoteChrome from 'chrome-remote-interface';

const getBrowserConnectionDebugScope = (id: string): string => `testcafe:browser:connection:${id}`;

const IDLE_PAGE_TEMPLATE = read('../../client/browser/idle-page/index.html.mustache');


interface DisconnectionPromise<T> extends Promise<T> {
    resolve: Function;
    reject: Function;
}

interface BrowserConnectionStatusResult {
    cmd: string;
    url: string;
    testRunId: string | null;
}

interface HeartbeatStatusResult {
    code: HeartbeatStatus;
    url: string;
}

interface InitScript {
    code: string | null;
}

interface InitScriptTask extends InitScript {
    resolve: Function;
}

interface ProviderMetaInfoOptions {
    appendToUserAgent?: boolean;
}

export interface BrowserClosingInfo {
    isRestarting?: boolean;
}

export interface BrowserInfo {
    alias: string;
    browserName: string;
    browserOption: unknown;
    providerName: string;
    provider: BrowserProvider;
    userAgentProviderMetaInfo: string;
    parsedUserAgent: ParsedUserAgent;
}

export interface BrowserConnectionOptions {
    disableMultipleWindows: boolean;
    developmentMode: boolean;
    nativeAutomation: boolean;
}

const DEFAULT_BROWSER_CONNECTION_OPTIONS = {
    disableMultipleWindows: false,
    developmentMode:        false,
    nativeAutomation:       false,
};

export default class BrowserConnection extends EventEmitter {
    public permanent: boolean;
    public previousActiveWindowId: string | null;
    private readonly HEARTBEAT_TIMEOUT: number;
    private readonly BROWSER_CLOSE_TIMEOUT: number;
    private readonly BROWSER_RESTART_TIMEOUT: number;
    public readonly id: string;
    private _currentTestRun: TestRun | null = null;
    private readonly jobQueue: BrowserJob[];
    private readonly initScriptsQueue: InitScriptTask[];
    public browserConnectionGateway: BrowserConnectionGateway;
    private disconnectionPromise: DisconnectionPromise<void> | null;
    private testRunAborted: boolean;
    public status: BrowserConnectionStatus;
    private heartbeatTimeout: NodeJS.Timeout | null;
    private pendingTestRunInfo: NextTestRunInfo | null;
    public url = '';
    public idleUrl = '';
    private forcedIdleUrl = '';
    private initScriptUrl = '';
    public heartbeatUrl = '';
    public statusUrl = '';
    public activeWindowIdUrl = '';
    public ensureWindowInNativeAutomationUrl = '';
    public closeWindowUrl = '';
    public statusDoneUrl = '';
    public heartbeatRelativeUrl = '';
    public statusRelativeUrl = '';
    public statusDoneRelativeUrl = '';
    public idleRelativeUrl = '';
    public openFileProtocolRelativeUrl = '';
    public openFileProtocolUrl = '';
    public dispatchNativeAutomationEventRelativeUrl = '';
    public dispatchNativeAutomationEventSequenceRelativeUrl = '';
    public parseSelectorRelativeUrl = '';
    private readonly debugLogger: debug.Debugger;
    public readonly warningLog: WarningLog;
    private _messageBus?: MessageBus;
    private readonly _options: BrowserConnectionOptions;

    public idle: boolean;

    public browserInfo: BrowserInfo;
    public provider: any;

    public constructor (
        gateway: BrowserConnectionGateway,
        browserInfo: BrowserInfo,
        permanent: boolean,
        options: Partial<BrowserConnectionOptions> = {},
        messageBus?: MessageBus) {
        super();

        this.HEARTBEAT_TIMEOUT       = HEARTBEAT_TIMEOUT;
        this.BROWSER_CLOSE_TIMEOUT   = BROWSER_CLOSE_TIMEOUT;
        this.BROWSER_RESTART_TIMEOUT = BROWSER_RESTART_TIMEOUT;

        this.id                       = BrowserConnection._generateId();
        this.jobQueue                 = [];
        this.initScriptsQueue         = [];
        this.browserConnectionGateway = gateway;
        this.disconnectionPromise     = null;
        this.testRunAborted           = false;
        this.warningLog               = new WarningLog(null, WarningLog.createAddWarningCallback(messageBus));
        this.debugLogger              = debug(getBrowserConnectionDebugScope(this.id));

        if (messageBus) {
            this.messageBus = messageBus;

            this.initMessageBus();
        }

        this.browserInfo                           = browserInfo;
        this.browserInfo.userAgentProviderMetaInfo = '';

        this.provider = browserInfo.provider;

        this.permanent              = permanent;
        this.status                 = BrowserConnectionStatus.uninitialized;
        this.idle                   = true;
        this.heartbeatTimeout       = null;
        this.pendingTestRunInfo     = null;
        this._options               = this._calculateResultOptions(options);

        this._setEventHandlers();

        BrowserConnectionTracker.add(this);

        this.previousActiveWindowId = null;

        this.browserConnectionGateway.startServingConnection(this);
    }

    private _calculateResultOptions (options: Partial<BrowserConnectionOptions>): BrowserConnectionOptions {
        return Object.assign({}, DEFAULT_BROWSER_CONNECTION_OPTIONS, options);
    }

    private _buildCommunicationUrls (proxy: Proxy): void {
        this.url           = proxy.resolveRelativeServiceUrl(`${SERVICE_ROUTES.connect}/${this.id}`);
        this.forcedIdleUrl = proxy.resolveRelativeServiceUrl(`${SERVICE_ROUTES.idleForced}/${this.id}`);
        this.initScriptUrl = proxy.resolveRelativeServiceUrl(`${SERVICE_ROUTES.initScript}/${this.id}`);

        this.heartbeatRelativeUrl                      = `${SERVICE_ROUTES.heartbeat}/${this.id}`;
        this.statusRelativeUrl                         = `${SERVICE_ROUTES.status}/${this.id}`;
        this.statusDoneRelativeUrl                     = `${SERVICE_ROUTES.statusDone}/${this.id}`;
        this.idleRelativeUrl                           = `${SERVICE_ROUTES.idle}/${this.id}`;
        this.activeWindowIdUrl                         = `${SERVICE_ROUTES.activeWindowId}/${this.id}`;
        this.ensureWindowInNativeAutomationUrl         = `${SERVICE_ROUTES.ensureWindowInNativeAutomation}/${this.id}`;
        this.closeWindowUrl                            = `${SERVICE_ROUTES.closeWindow}/${this.id}`;
        this.openFileProtocolRelativeUrl               = `${SERVICE_ROUTES.openFileProtocol}/${this.id}`;
        this.dispatchNativeAutomationEventRelativeUrl         = `${SERVICE_ROUTES.dispatchNativeAutomationEvent}/${this.id}`;
        this.dispatchNativeAutomationEventSequenceRelativeUrl = `${SERVICE_ROUTES.dispatchNativeAutomationEventSequence}/${this.id}`;
        this.parseSelectorRelativeUrl                         = `${SERVICE_ROUTES.parseSelector}/${this.id}`;

        this.idleUrl             = proxy.resolveRelativeServiceUrl(this.idleRelativeUrl);
        this.heartbeatUrl        = proxy.resolveRelativeServiceUrl(this.heartbeatRelativeUrl);
        this.statusUrl           = proxy.resolveRelativeServiceUrl(this.statusRelativeUrl);
        this.statusDoneUrl       = proxy.resolveRelativeServiceUrl(this.statusDoneRelativeUrl);
        this.openFileProtocolUrl = proxy.resolveRelativeServiceUrl(this.openFileProtocolRelativeUrl);
    }

    public initMessageBus (): void {
        this.warningLog.callback = WarningLog.createAddWarningCallback(this._messageBus);

        this.assignTestRunStartEventListener();
        this.emit('message-bus-initialized', this._messageBus);
    }

    public assignTestRunStartEventListener (): void {
        if (!this._messageBus)
            return;

        this._messageBus.on('test-run-start', testRun => {
            if (testRun.browserConnection.id === this.id)
                this._currentTestRun = testRun;
        });
    }

    public set messageBus (messageBus: MessageBus | undefined) {
        this._messageBus = messageBus;
    }

    public get messageBus (): MessageBus | undefined {
        return this._messageBus;
    }

    private _setEventHandlers (): void {
        this.on('error', e => {
            this.debugLogger(e);
            this._forceIdle();
            this.close();
        });

        for (const name in BrowserConnectionStatus) {
            const status = BrowserConnectionStatus[name as keyof typeof BrowserConnectionStatus];

            this.on(status, () => {
                this.debugLogger(`status changed to '${status}'`);
            });
        }
    }

    private static _generateId (): string {
        return nanoid(7);
    }

    private _getAdditionalBrowserOptions (): OpenBrowserAdditionalOptions {
        return {
            disableMultipleWindows: this._options.disableMultipleWindows,
            nativeAutomation:       this._options.nativeAutomation,
            developmentMode:        this._options.developmentMode,
            serviceDomains:         [
                this.browserConnectionGateway.proxy.server1Info.domain,
                this.browserConnectionGateway.proxy.server2Info.domain,
            ],
        };
    }

    private async _runBrowser (): Promise<void> {
        try {
            const additionalOptions = this._getAdditionalBrowserOptions();

            await this.provider.openBrowser(this.id, this.url, this.browserInfo.browserOption, additionalOptions);

            if (this.status !== BrowserConnectionStatus.ready)
                await promisifyEvent(this, 'ready');

            this.status = BrowserConnectionStatus.opened;
            this.emit('opened');
        }
        catch (err: any) {
            this.emit('error', new GeneralError(
                RUNTIME_ERRORS.unableToOpenBrowser,
                this.browserInfo.providerName + ':' + this.browserInfo.browserName,
                err.stack
            ));
        }
    }

    private async _closeBrowser (data: BrowserClosingInfo = {}): Promise<void> {
        if (!this.idle)
            await promisifyEvent(this, 'idle');

        try {
            await this.provider.closeBrowser(this.id, data);
        }
        catch (err) {
            // NOTE: A warning would be really nice here, but it can't be done while log is stored in a task.
            this.debugLogger(err);
        }
    }

    private _forceIdle (): void {
        if (!this.idle) {
            this.idle = true;

            this.emit('idle');
        }
    }

    private _createBrowserDisconnectedError (): GeneralError {
        return new GeneralError(RUNTIME_ERRORS.browserDisconnected, this.userAgent);
    }

    private _waitForHeartbeat (): void {
        if (this._options.developmentMode)
            return;

        this.heartbeatTimeout = setTimeout(() => {
            const err = this._createBrowserDisconnectedError();

            this.status         = BrowserConnectionStatus.disconnected;
            this.testRunAborted = true;

            this.emit('disconnected', err);

            this._restartBrowserOnDisconnect(err);
        }, this.HEARTBEAT_TIMEOUT);
    }

    private async _getTestRunInfo (needPopNext: boolean): Promise<NextTestRunInfo> {
        if (needPopNext || !this.pendingTestRunInfo)
            this.pendingTestRunInfo = await this._popNextTestRunInfo();

        return this.pendingTestRunInfo as NextTestRunInfo;
    }

    private async _popNextTestRunInfo (): Promise<NextTestRunInfo | null> {
        while (this.hasQueuedJobs && !this.currentJob.hasQueuedTestRuns)
            this.jobQueue.shift();

        return this.hasQueuedJobs ? await this.currentJob.popNextTestRunInfo(this) : null;
    }

    public getCurrentTestRun (): LegacyTestRun | TestRun | null {
        return this._currentTestRun;
    }

    public static getById (id: string): BrowserConnection | null {
        return BrowserConnectionTracker.activeBrowserConnections[id] || null;
    }

    private async _restartBrowser (): Promise<void> {
        this.status = BrowserConnectionStatus.uninitialized;

        this._forceIdle();

        let resolveTimeout: Function | null = null;
        let isTimeoutExpired                = false;
        let timeout: NodeJS.Timeout | null  = null;

        const restartPromise = timeLimit(this._closeBrowser({ isRestarting: true }), this.BROWSER_CLOSE_TIMEOUT, { rejectWith: new TimeoutError() })
            .catch(err => this.debugLogger(err))
            .then(() => this._runBrowser());

        const timeoutPromise = new Promise<void>(resolve => {
            resolveTimeout = resolve;

            timeout = setTimeout(() => {
                isTimeoutExpired = true;

                resolve();
            }, this.BROWSER_RESTART_TIMEOUT);
        });

        return Promise.race([restartPromise, timeoutPromise])
            .then(() => {
                clearTimeout(timeout as NodeJS.Timeout);

                if (isTimeoutExpired)
                    this.emit('error', this._createBrowserDisconnectedError());
                else
                    (resolveTimeout as Function)();
            });
    }

    private _restartBrowserOnDisconnect (err: Error): void {
        let resolveFn: Function | null = null;
        let rejectFn: Function | null  = null;

        this.disconnectionPromise = new Promise((resolve, reject) => {
            resolveFn = resolve;

            rejectFn = () => {
                reject(err);
            };

            setTimeout(() => {
                (rejectFn as Function)();
            });
        })
            .then(() => {
                return this._restartBrowser();
            })
            .catch(e => {
                this.emit('error', e);
            }) as DisconnectionPromise<void>;

        this.disconnectionPromise.resolve = resolveFn as unknown as Function;
        this.disconnectionPromise.reject  = rejectFn as unknown as Function;
    }

    public async getDefaultBrowserInitTimeout (): Promise<number> {
        const isLocalBrowser = await this.provider.isLocalBrowser(this.id, this.browserInfo.browserName);

        return isLocalBrowser ? LOCAL_BROWSER_INIT_TIMEOUT : REMOTE_BROWSER_INIT_TIMEOUT;
    }

    public async processDisconnection (disconnectionThresholdExceeded: boolean): Promise<void> {
        const { resolve, reject } = this.disconnectionPromise as DisconnectionPromise<void>;

        if (disconnectionThresholdExceeded)
            reject();
        else
            resolve();
    }

    public addWarning (message: string, ...args: any[]): void {
        if (this.currentJob)
            this.currentJob.warningLog.addWarning(message, ...args);
        else
            this.warningLog.addWarning(message, ...args);
    }

    private _appendToPrettyUserAgent (str: string): void {
        this.browserInfo.parsedUserAgent.prettyUserAgent += ` (${str})`;
    }

    private _moveWarningLogToJob (job: BrowserJob): void {
        job.warningLog.copyFrom(this.warningLog);
        this.warningLog.clear();
    }

    public setProviderMetaInfo (str: string, options?: ProviderMetaInfoOptions): void {
        const appendToUserAgent = options?.appendToUserAgent as boolean;

        if (appendToUserAgent) {
            // NOTE:
            // change prettyUserAgent only when connection already was established
            if (this.isReady())
                this._appendToPrettyUserAgent(str);
            else
                this.on('ready', () => this._appendToPrettyUserAgent(str));

            return;
        }

        this.browserInfo.userAgentProviderMetaInfo = str;
    }

    public get userAgent (): string {
        let userAgent = this.browserInfo.parsedUserAgent.prettyUserAgent;

        if (this.browserInfo.userAgentProviderMetaInfo)
            userAgent += ` (${this.browserInfo.userAgentProviderMetaInfo})`;

        return userAgent;
    }

    public get retryTestPages (): boolean {
        return this.browserConnectionGateway.retryTestPages;
    }

    public get hasQueuedJobs (): boolean {
        return !!this.jobQueue.length;
    }

    public get currentJob (): BrowserJob {
        return this.jobQueue[0];
    }

    // API
    public runInitScript (code: string): Promise<string | unknown> {
        return new Promise(resolve => this.initScriptsQueue.push({ code, resolve }));
    }

    public addJob (job: BrowserJob): void {
        this.jobQueue.push(job);

        this._moveWarningLogToJob(job);
    }

    public removeJob (job: BrowserJob): void {
        remove(this.jobQueue, job);
    }

    public async close (): Promise<void> {
        if (this.status === BrowserConnectionStatus.closing || this.status === BrowserConnectionStatus.closed)
            return;

        this.status = BrowserConnectionStatus.closing;
        this.emit(BrowserConnectionStatus.closing);

        await this._closeBrowser();

        this.browserConnectionGateway.stopServingConnection(this);

        if (this.heartbeatTimeout)
            clearTimeout(this.heartbeatTimeout);

        BrowserConnectionTracker.remove(this);

        this.status = BrowserConnectionStatus.closed;
        this.emit(BrowserConnectionStatus.closed);
    }

    public async establish (userAgent: string): Promise<void> {
        const osInfo = await this.provider.getOSInfo(this.id);

        this.status                      = BrowserConnectionStatus.ready;
        this.browserInfo.parsedUserAgent = parseUserAgent(userAgent, osInfo);

        this._waitForHeartbeat();
        this.emit('ready');
    }

    public heartbeat (): HeartbeatStatusResult {
        if (this.heartbeatTimeout)
            clearTimeout(this.heartbeatTimeout);

        this._waitForHeartbeat();

        return {
            code: this.status === BrowserConnectionStatus.closing ? HeartbeatStatus.closing : HeartbeatStatus.ok,
            url:  this.status === BrowserConnectionStatus.closing ? this.idleUrl : '',
        };
    }

    public renderIdlePage (): string {
        return Mustache.render(IDLE_PAGE_TEMPLATE as string, {
            userAgent:           this.userAgent,
            statusUrl:           this.statusUrl,
            heartbeatUrl:        this.heartbeatUrl,
            initScriptUrl:       this.initScriptUrl,
            openFileProtocolUrl: this.openFileProtocolUrl,
            retryTestPages:      !!this.browserConnectionGateway.retryTestPages,
            nativeAutomation:    this._options.nativeAutomation,
        });
    }

    public getInitScript (): InitScript {
        const initScriptPromise = this.initScriptsQueue[0];

        return { code: initScriptPromise ? initScriptPromise.code : null };
    }

    public handleInitScriptResult (data: string): void {
        const initScriptPromise = this.initScriptsQueue.shift();

        if (initScriptPromise)
            initScriptPromise.resolve(JSON.parse(data));
    }

    public isHeadlessBrowser (): boolean {
        return this.provider.isHeadlessBrowser(this.id);
    }

    public async reportJobResult (status: string, data: any): Promise<any> {
        await this.provider.reportJobResult(this.id, status, data);
    }

    public async getStatus (isTestDone: boolean): Promise<BrowserConnectionStatusResult> {
        if (!this.idle && !isTestDone) {
            this.idle = true;
            this.emit('idle');
        }

        if (this.status === BrowserConnectionStatus.opened) {
            const nextTestRunInfo = await this._getTestRunInfo(isTestDone || this.testRunAborted);

            this.testRunAborted = false;

            if (nextTestRunInfo) {
                this.idle = false;

                return {
                    cmd:       COMMAND.run,
                    testRunId: nextTestRunInfo.testRunId,
                    url:       nextTestRunInfo.url,
                };
            }
        }

        return {
            cmd:       COMMAND.idle,
            url:       this.idleUrl,
            testRunId: null,
        };
    }

    public get activeWindowId (): null | string {
        return this.provider.getActiveWindowId(this.id);
    }

    public set activeWindowId (val) {
        this.previousActiveWindowId = this.activeWindowId;

        this.provider.setActiveWindowId(this.id, val);
    }

    public async openFileProtocol (url: string): Promise<void> {
        return this.provider.openFileProtocol(this.id, url);
    }

    public async dispatchNativeAutomationEvent (type: EventType, options: any): Promise<void> {
        return this.provider.dispatchNativeAutomationEvent(this.id, type, options);
    }

    public async dispatchNativeAutomationEventSequence (eventSequence: []): Promise<void> {
        return this.provider.dispatchNativeAutomationEventSequence(this.id, eventSequence);
    }

    public async canUseDefaultWindowActions (): Promise<boolean> {
        return this.provider.canUseDefaultWindowActions(this.id);
    }

    public isReady (): boolean {
        return this.status === BrowserConnectionStatus.ready ||
            this.status === BrowserConnectionStatus.opened ||
            this.status === BrowserConnectionStatus.closing;
    }

    public initialize (): void {
        this._buildCommunicationUrls(this.browserConnectionGateway.proxy);

        process.nextTick(() => this._runBrowser());
    }

    public supportNativeAutomation (): boolean {
        return this.provider.supportNativeAutomation();
    }

    public getNativeAutomation (): NativeAutomationBase {
        return this.provider.getNativeAutomation(this.id);
    }

    public isNativeAutomationEnabled (): boolean {
        return this._options.nativeAutomation;
    }

    async getNewWindowIdInNativeAutomation (windowId: string): Promise<void> {
        return this.provider.getNewWindowIdInNativeAutomation(this.id, windowId);
    }

    public async getCurrentCDPSession (): Promise<remoteChrome.ProtocolApi | null> {
        return this.provider.getCurrentCDPSession(this.id);
    }

    public resetActiveWindowId (): void {
        this.provider.resetActiveWindowId(this.id);
    }
}
