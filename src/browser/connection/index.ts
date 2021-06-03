import debug from 'debug';
import timeLimit from 'time-limit-promise';
import { EventEmitter } from 'events';
import Mustache from 'mustache';
import { pull as remove } from 'lodash';
import parseUserAgent, { ParsedUserAgent } from '../../utils/parse-user-agent';
import { readSync as read } from 'read-file-relative';
import promisifyEvent from 'promisify-event';
import nanoid from 'nanoid';
import COMMAND from './command';
import BrowserConnectionStatus from './status';
import HeartbeatStatus from './heartbeat-status';
import { GeneralError, TimeoutError } from '../../errors/runtime';
import { RUNTIME_ERRORS } from '../../errors/types';
import { Dictionary } from '../../configuration/interfaces';
import BrowserConnectionGateway from './gateway';
import BrowserJob from '../../runner/browser-job';
import WarningLog from '../../notifications/warning-log';
import BrowserProvider from '../provider';

import {
    BROWSER_RESTART_TIMEOUT,
    BROWSER_CLOSE_TIMEOUT,
    HEARTBEAT_TIMEOUT,
    LOCAL_BROWSER_INIT_TIMEOUT,
    REMOTE_BROWSER_INIT_TIMEOUT
} from '../../utils/browser-connection-timeouts';

const getBrowserConnectionDebugScope = (id: string): string => `testcafe:browser:connection:${id}`;

const IDLE_PAGE_TEMPLATE                         = read('../../client/browser/idle-page/index.html.mustache');
const connections: Dictionary<BrowserConnection> = {};

interface DisconnectionPromise<T> extends Promise<T> {
    resolve: Function;
    reject: Function;
}

interface BrowserConnectionStatusResult {
    cmd: string;
    url: string;
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

export interface BrowserInfo {
    alias: string;
    browserName: string;
    browserOption: unknown;
    providerName: string;
    provider: BrowserProvider;
    userAgentProviderMetaInfo: string;
    parsedUserAgent: ParsedUserAgent;
}

export default class BrowserConnection extends EventEmitter {
    public permanent: boolean;
    public previousActiveWindowId: string | null;
    private readonly disableMultipleWindows: boolean;
    private readonly isProxyless: boolean;
    private readonly HEARTBEAT_TIMEOUT: number;
    private readonly BROWSER_CLOSE_TIMEOUT: number;
    private readonly BROWSER_RESTART_TIMEOUT: number;
    public readonly id: string;
    private readonly jobQueue: BrowserJob[];
    private readonly initScriptsQueue: InitScriptTask[];
    private browserConnectionGateway: BrowserConnectionGateway;
    private disconnectionPromise: DisconnectionPromise<void> | null;
    private testRunAborted: boolean;
    public status: BrowserConnectionStatus;
    private heartbeatTimeout: NodeJS.Timeout | null;
    private pendingTestRunUrl: string | null;
    public readonly url: string;
    public readonly idleUrl: string;
    private forcedIdleUrl: string;
    private readonly initScriptUrl: string;
    public readonly heartbeatRelativeUrl: string;
    public readonly statusRelativeUrl: string;
    public readonly statusDoneRelativeUrl: string;
    private readonly heartbeatUrl: string;
    private readonly statusUrl: string;
    public readonly activeWindowIdUrl: string;
    private statusDoneUrl: string;
    private readonly debugLogger: debug.Debugger;

    public readonly warningLog: WarningLog;

    public idle: boolean;

    public browserInfo: BrowserInfo;
    public provider: any;

    public constructor (
        gateway: BrowserConnectionGateway,
        browserInfo: BrowserInfo,
        permanent: boolean,
        disableMultipleWindows = false,
        isProxyless = false) {
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
        this.warningLog               = new WarningLog();
        this.debugLogger              = debug(getBrowserConnectionDebugScope(this.id));

        this.browserInfo                           = browserInfo;
        this.browserInfo.userAgentProviderMetaInfo = '';

        this.provider = browserInfo.provider;

        this.permanent              = permanent;
        this.status                 = BrowserConnectionStatus.uninitialized;
        this.idle                   = true;
        this.heartbeatTimeout       = null;
        this.pendingTestRunUrl      = null;
        this.disableMultipleWindows = disableMultipleWindows;
        this.isProxyless            = isProxyless;

        this.url           = `${gateway.domain}/browser/connect/${this.id}`;
        this.idleUrl       = `${gateway.domain}/browser/idle/${this.id}`;
        this.forcedIdleUrl = `${gateway.domain}/browser/idle-forced/${this.id}`;
        this.initScriptUrl = `${gateway.domain}/browser/init-script/${this.id}`;

        this.heartbeatRelativeUrl  = `/browser/heartbeat/${this.id}`;
        this.statusRelativeUrl     = `/browser/status/${this.id}`;
        this.statusDoneRelativeUrl = `/browser/status-done/${this.id}`;
        this.activeWindowIdUrl     = `/browser/active-window-id/${this.id}`;

        this.heartbeatUrl  = `${gateway.domain}${this.heartbeatRelativeUrl}`;
        this.statusUrl     = `${gateway.domain}${this.statusRelativeUrl}`;
        this.statusDoneUrl = `${gateway.domain}${this.statusDoneRelativeUrl}`;

        this._setEventHandlers();

        connections[this.id] = this;

        this.previousActiveWindowId = null;

        this.browserConnectionGateway.startServingConnection(this);

        // NOTE: Give a caller time to assign event listeners
        process.nextTick(() => this._runBrowser());
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

    private async _runBrowser (): Promise<void> {
        try {
            await this.provider.openBrowser(this.id, this.url, this.browserInfo.browserOption, this.disableMultipleWindows, this.isProxyless);

            if (this.status !== BrowserConnectionStatus.ready)
                await promisifyEvent(this, 'ready');

            this.status = BrowserConnectionStatus.opened;
            this.emit('opened');
        }
        catch (err) {
            this.emit('error', new GeneralError(
                RUNTIME_ERRORS.unableToOpenBrowser,
                this.browserInfo.providerName + ':' + this.browserInfo.browserName,
                err.stack
            ));
        }
    }

    private async _closeBrowser (): Promise<void> {
        if (!this.idle)
            await promisifyEvent(this, 'idle');

        try {
            await this.provider.closeBrowser(this.id);
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
        this.heartbeatTimeout = setTimeout(() => {
            const err = this._createBrowserDisconnectedError();

            this.status         = BrowserConnectionStatus.disconnected;
            this.testRunAborted = true;

            this.emit('disconnected', err);

            this._restartBrowserOnDisconnect(err);
        }, this.HEARTBEAT_TIMEOUT);
    }

    private async _getTestRunUrl (needPopNext: boolean): Promise<string> {
        if (needPopNext || !this.pendingTestRunUrl)
            this.pendingTestRunUrl = await this._popNextTestRunUrl();

        return this.pendingTestRunUrl as string;
    }

    private async _popNextTestRunUrl (): Promise<string | null> {
        while (this.hasQueuedJobs && !this.currentJob.hasQueuedTestRuns)
            this.jobQueue.shift();

        return this.hasQueuedJobs ? await this.currentJob.popNextTestRunUrl(this) : null;
    }

    public static getById (id: string): BrowserConnection | null {
        return connections[id] || null;
    }

    private async _restartBrowser (): Promise<void> {
        this.status = BrowserConnectionStatus.uninitialized;

        this._forceIdle();

        let resolveTimeout: Function | null = null;
        let isTimeoutExpired                = false;
        let timeout: NodeJS.Timeout | null  = null;

        const restartPromise = timeLimit(this._closeBrowser(), this.BROWSER_CLOSE_TIMEOUT, { rejectWith: new TimeoutError() })
            .catch(err => this.debugLogger(err))
            .then(() => this._runBrowser());

        const timeoutPromise = new Promise(resolve => {
            resolveTimeout = resolve;

            timeout = setTimeout(() => {
                isTimeoutExpired = true;

                resolve();
            }, this.BROWSER_RESTART_TIMEOUT);
        });

        return Promise.race([ restartPromise, timeoutPromise ])
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

    public addWarning (...args: any[]): void {
        if (this.currentJob)
            this.currentJob.warningLog.addWarning(...args);
        else
            this.warningLog.addWarning(...args);
    }

    private _appendToPrettyUserAgent (str: string): void {
        this.browserInfo.parsedUserAgent.prettyUserAgent += ` (${str})`;
    }

    private _moveWarningLogToJob (job: BrowserJob): void {
        this.warningLog.copyTo(job.warningLog);
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

        delete connections[this.id];

        this.status = BrowserConnectionStatus.closed;
        this.emit(BrowserConnectionStatus.closed);
    }

    public establish (userAgent: string): void {
        this.status                      = BrowserConnectionStatus.ready;
        this.browserInfo.parsedUserAgent = parseUserAgent(userAgent);

        this._waitForHeartbeat();
        this.emit('ready');
    }

    public heartbeat (): HeartbeatStatusResult {
        if (this.heartbeatTimeout)
            clearTimeout(this.heartbeatTimeout);

        this._waitForHeartbeat();

        return {
            code: this.status === BrowserConnectionStatus.closing ? HeartbeatStatus.closing : HeartbeatStatus.ok,
            url:  this.status === BrowserConnectionStatus.closing ? this.idleUrl : ''
        };
    }

    public renderIdlePage (): string {
        return Mustache.render(IDLE_PAGE_TEMPLATE as string, {
            userAgent:      this.userAgent,
            statusUrl:      this.statusUrl,
            heartbeatUrl:   this.heartbeatUrl,
            initScriptUrl:  this.initScriptUrl,
            retryTestPages: !!this.browserConnectionGateway.retryTestPages
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
            const testRunUrl = await this._getTestRunUrl(isTestDone || this.testRunAborted);

            this.testRunAborted = false;

            if (testRunUrl) {
                this.idle = false;

                return { cmd: COMMAND.run, url: testRunUrl };
            }
        }

        return { cmd: COMMAND.idle, url: this.idleUrl };
    }

    public get activeWindowId (): null | string {
        return this.provider.getActiveWindowId(this.id);
    }

    public set activeWindowId (val) {
        this.previousActiveWindowId = this.activeWindowId;

        this.provider.setActiveWindowId(this.id, val);
    }

    public async canUseDefaultWindowActions (): Promise<boolean> {
        return this.provider.canUseDefaultWindowActions(this.id);
    }

    public isReady (): boolean {
        return this.status === BrowserConnectionStatus.ready ||
            this.status === BrowserConnectionStatus.opened ||
            this.status === BrowserConnectionStatus.closing;
    }
}
