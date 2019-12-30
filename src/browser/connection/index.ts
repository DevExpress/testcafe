import { EventEmitter } from 'events';
import Mustache from 'mustache';
import { pull as remove } from 'lodash';
import parseUserAgent from '../../utils/parse-user-agent';
import { readSync as read } from 'read-file-relative';
import promisifyEvent from 'promisify-event';
import nanoid from 'nanoid';
import COMMAND from './command';
import STATUS from './status';
import { GeneralError } from '../../errors/runtime';
import { RUNTIME_ERRORS } from '../../errors/types';
import { HEARTBEAT_TIMEOUT, BROWSER_RESTART_TIMEOUT } from '../../utils/browser-connection-timeouts';
import { Dictionary } from '../../configuration/interfaces';
import BrowserConnectionGateway from './gateway';

const IDLE_PAGE_TEMPLATE                         = read('../../client/browser/idle-page/index.html.mustache');
const connections: Dictionary<BrowserConnection> = {};

interface DisconnectionPromise<T> extends Promise<T> {
    resolve: Function;
    reject: Function;
}

interface BrowserConnectionStatus {
    cmd: string;
    url: string;
}

interface HeartbeatStatus {
    code: string;
    url: string;
}

interface InitScript {
    code: string | null;
}

interface InitScriptTask extends InitScript {
    resolve: Function;
}

export default class BrowserConnection extends EventEmitter {
    private permanent: boolean;
    private readonly allowMultipleWindows: boolean;
    private readonly HEARTBEAT_TIMEOUT: number;
    private readonly BROWSER_RESTART_TIMEOUT: number;
    public readonly id: string;
    private readonly jobQueue: any[];
    private readonly initScriptsQueue: InitScriptTask[];
    private browserConnectionGateway: BrowserConnectionGateway;
    private disconnectionPromise: DisconnectionPromise<void> | null;
    private testRunAborted: boolean;
    private closing: boolean;
    private closed: boolean;
    public ready: boolean;
    private opened: boolean;
    private heartbeatTimeout: NodeJS.Timeout | null;
    private pendingTestRunUrl: string | null;
    public readonly url: string;
    public readonly idleUrl: string;
    private forcedIdleUrl: string;
    private readonly initScriptUrl: string;
    private readonly heartbeatRelativeUrl: string;
    private readonly statusRelativeUrl: string;
    private readonly statusDoneRelativeUrl: string;
    private readonly heartbeatUrl: string;
    private readonly statusUrl: string;
    private readonly activeWindowIdUrl: string;
    private statusDoneUrl: string;
    private switchingToIdle: boolean;

    public idle: boolean;

    public browserInfo: any;
    public provider: any;

    public constructor (gateway: BrowserConnectionGateway, browserInfo: any, permanent: boolean, allowMultipleWindows = false) {
        super();

        this.HEARTBEAT_TIMEOUT       = HEARTBEAT_TIMEOUT;
        this.BROWSER_RESTART_TIMEOUT = BROWSER_RESTART_TIMEOUT;

        this.id                       = BrowserConnection._generateId();
        this.jobQueue                 = [];
        this.initScriptsQueue         = [];
        this.browserConnectionGateway = gateway;
        this.disconnectionPromise     = null;
        this.testRunAborted           = false;

        this.browserInfo                           = browserInfo;
        this.browserInfo.userAgentProviderMetaInfo = '';

        this.provider = browserInfo.provider;

        this.permanent            = permanent;
        this.closing              = false;
        this.closed               = false;
        this.ready                = false;
        this.opened               = false;
        this.idle                 = true;
        this.switchingToIdle      = false;
        this.heartbeatTimeout     = null;
        this.pendingTestRunUrl    = null;
        this.allowMultipleWindows = allowMultipleWindows;

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

        this.on('error', () => {
            this._forceIdle();
            this.close();
        });

        connections[this.id] = this;

        this.browserConnectionGateway.startServingConnection(this);

        process.nextTick(() => this._runBrowser());
    }

    private static _generateId (): string {
        return nanoid(7);
    }

    private async _runBrowser (): Promise<void> {
        try {
            await this.provider.openBrowser(this.id, this.url, this.browserInfo.browserName, this.allowMultipleWindows);

            if (!this.ready)
                await promisifyEvent(this, 'ready');

            this.opened = true;
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
        }
    }

    private _forceIdle (): void {
        if (!this.idle) {
            this.switchingToIdle = false;
            this.idle            = true;
            this.emit('idle');
        }
    }

    private _createBrowserDisconnectedError (): GeneralError {
        return new GeneralError(RUNTIME_ERRORS.browserDisconnected, this.userAgent);
    }

    private _waitForHeartbeat (): void {
        this.heartbeatTimeout = setTimeout(() => {
            const err = this._createBrowserDisconnectedError();

            this.opened         = false;
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
        this.ready = false;

        this._forceIdle();

        let resolveTimeout: Function | null = null;
        let isTimeoutExpired                = false;
        let timeout: NodeJS.Timeout | null  = null;

        const restartPromise = this._closeBrowser()
            .then(() => this._runBrowser());

        const timeoutPromise = new Promise(resolve => {
            resolveTimeout = resolve;

            timeout = setTimeout(() => {
                isTimeoutExpired = true;

                resolve();
            }, this.BROWSER_RESTART_TIMEOUT);
        });

        Promise.race([ restartPromise, timeoutPromise ])
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

    public async processDisconnection (disconnectionThresholdExceedeed: boolean): Promise<void> {
        const { resolve, reject } = this.disconnectionPromise as DisconnectionPromise<void>;

        if (disconnectionThresholdExceedeed)
            reject();
        else
            resolve();
    }

    public addWarning (...args: any[]): void {
        if (this.currentJob)
            this.currentJob.warningLog.addWarning(...args);
    }

    public setProviderMetaInfo (str: string): void {
        this.browserInfo.userAgentProviderMetaInfo = str;
    }

    public get userAgent (): string {
        let userAgent = this.browserInfo.parsedUserAgent.prettyUserAgent;

        if (this.browserInfo.userAgentProviderMetaInfo)
            userAgent += ` (${this.browserInfo.userAgentProviderMetaInfo})`;

        return userAgent;
    }

    public get hasQueuedJobs (): boolean {
        return !!this.jobQueue.length;
    }

    public get currentJob (): any {
        return this.jobQueue[0];
    }

    // API
    public runInitScript (code: string): Promise<void> {
        return new Promise(resolve => this.initScriptsQueue.push({ code, resolve }));
    }

    public addJob (job: any): void {
        this.jobQueue.push(job);
    }

    public removeJob (job: any): void {
        remove(this.jobQueue, job);
    }

    public close (): void {
        if (this.closed || this.closing)
            return;

        this.closing = true;

        this._closeBrowser()
            .then(() => {
                this.browserConnectionGateway.stopServingConnection(this);
                clearTimeout(this.heartbeatTimeout as NodeJS.Timeout);

                delete connections[this.id];

                this.ready  = false;
                this.closed = true;

                this.emit('closed');
            });
    }

    public establish (userAgent: string): void {
        this.ready                       = true;
        this.browserInfo.parsedUserAgent = parseUserAgent(userAgent);

        this._waitForHeartbeat();
        this.emit('ready');
    }

    public heartbeat (): HeartbeatStatus {
        clearTimeout(this.heartbeatTimeout as NodeJS.Timeout);
        this._waitForHeartbeat();

        return {
            code: this.closing ? STATUS.closing : STATUS.ok,
            url:  this.closing ? this.idleUrl : ''
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

    public async getStatus (isTestDone: boolean): Promise<BrowserConnectionStatus> {
        if (!this.idle && !isTestDone) {
            this.idle = true;
            this.emit('idle');
        }

        if (this.opened) {
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
        this.provider.setActiveWindowId(this.id, val);
    }
}
