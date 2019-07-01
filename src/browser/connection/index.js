import { EventEmitter } from 'events';
import Promise from 'pinkie';
import Mustache from 'mustache';
import { pull as remove } from 'lodash';
import { parse as parseUserAgent } from 'useragent';
import { readSync as read } from 'read-file-relative';
import promisifyEvent from 'promisify-event';
import nanoid from 'nanoid';
import COMMAND from './command';
import STATUS from './status';
import { GeneralError } from '../../errors/runtime';
import { RUNTIME_ERRORS } from '../../errors/types';
import { HEARTBEAT_TIMEOUT, BROWSER_RESTART_TIMEOUT } from '../../utils/browser-connection-timeouts';

const IDLE_PAGE_TEMPLATE = read('../../client/browser/idle-page/index.html.mustache');
const connections        = {};


export default class BrowserConnection extends EventEmitter {
    constructor (gateway, browserInfo, permanent) {
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
        this.browserInfo.userAgent                 = '';
        this.browserInfo.userAgentProviderMetaInfo = '';

        this.provider = browserInfo.provider;

        this.permanent         = permanent;
        this.closing           = false;
        this.closed            = false;
        this.ready             = false;
        this.opened            = false;
        this.idle              = true;
        this.heartbeatTimeout  = null;
        this.pendingTestRunUrl = null;

        this.url           = `${gateway.domain}/browser/connect/${this.id}`;
        this.idleUrl       = `${gateway.domain}/browser/idle/${this.id}`;
        this.forcedIdleUrl = `${gateway.domain}/browser/idle-forced/${this.id}`;
        this.initScriptUrl = `${gateway.domain}/browser/init-script/${this.id}`;

        this.heartbeatRelativeUrl  = `/browser/heartbeat/${this.id}`;
        this.statusRelativeUrl     = `/browser/status/${this.id}`;
        this.statusDoneRelativeUrl = `/browser/status-done/${this.id}`;

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

    static _generateId () {
        return nanoid(7);
    }

    async _runBrowser () {
        try {
            await this.provider.openBrowser(this.id, this.url, this.browserInfo.browserName);

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

    async _closeBrowser () {
        if (!this.idle)
            await promisifyEvent(this, 'idle');

        try {
            await this.provider.closeBrowser(this.id);
        }
        catch (err) {
            // NOTE: A warning would be really nice here, but it can't be done while log is stored in a task.
        }
    }

    _forceIdle () {
        if (!this.idle) {
            this.switchingToIdle = false;
            this.idle            = true;
            this.emit('idle');
        }
    }

    _createBrowserDisconnectedError () {
        return new GeneralError(RUNTIME_ERRORS.browserDisconnected, this.userAgent);
    }

    _waitForHeartbeat () {
        this.heartbeatTimeout = setTimeout(() => {
            const err = this._createBrowserDisconnectedError();

            this.opened         = false;
            this.testRunAborted = true;

            this.emit('disconnected', err);

            this._restartBrowserOnDisconnect(err);
        }, this.HEARTBEAT_TIMEOUT);
    }

    async _getTestRunUrl (needPopNext) {
        if (needPopNext || !this.pendingTestRunUrl)
            this.pendingTestRunUrl = await this._popNextTestRunUrl();

        return this.pendingTestRunUrl;
    }

    async _popNextTestRunUrl () {
        while (this.hasQueuedJobs && !this.currentJob.hasQueuedTestRuns)
            this.jobQueue.shift();

        return this.hasQueuedJobs ? await this.currentJob.popNextTestRunUrl(this) : null;
    }

    static getById (id) {
        return connections[id] || null;
    }

    async _restartBrowser () {
        this.ready = false;

        this._forceIdle();

        let resolveTimeout   = null;
        let isTimeoutExpired = false;
        let timeout          = null;

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
                clearTimeout(timeout);

                if (isTimeoutExpired)
                    this.emit('error', this._createBrowserDisconnectedError());
                else
                    resolveTimeout();
            });
    }

    _restartBrowserOnDisconnect (err) {
        let resolveFn = null;
        let rejectFn  = null;

        this.disconnectionPromise = new Promise((resolve, reject) => {
            resolveFn = resolve;

            rejectFn = () => {
                reject(err);
            };

            setTimeout(() => {
                rejectFn();
            });
        })
            .then(() => {
                return this._restartBrowser();
            })
            .catch(e => {
                this.emit('error', e);
            });

        this.disconnectionPromise.resolve = resolveFn;
        this.disconnectionPromise.reject  = rejectFn;
    }

    async processDisconnection (disconnectionThresholdExceedeed) {
        const { resolve, reject } = this.disconnectionPromise;

        if (disconnectionThresholdExceedeed)
            reject();
        else
            resolve();
    }

    addWarning (...args) {
        if (this.currentJob)
            this.currentJob.warningLog.addWarning(...args);
    }

    setProviderMetaInfo (str) {
        this.browserInfo.userAgentProviderMetaInfo = str;
    }

    get userAgent () {
        let userAgent = this.browserInfo.userAgent;

        if (this.browserInfo.userAgentProviderMetaInfo)
            userAgent += ` (${this.browserInfo.userAgentProviderMetaInfo})`;

        return userAgent;
    }

    get hasQueuedJobs () {
        return !!this.jobQueue.length;
    }

    get currentJob () {
        return this.jobQueue[0];
    }

    // API
    runInitScript (code) {
        return new Promise(resolve => this.initScriptsQueue.push({ code, resolve }));
    }

    addJob (job) {
        this.jobQueue.push(job);
    }

    removeJob (job) {
        remove(this.jobQueue, job);
    }

    close () {
        if (this.closed || this.closing)
            return;

        this.closing = true;

        this._closeBrowser()
            .then(() => {
                this.browserConnectionGateway.stopServingConnection(this);
                clearTimeout(this.heartbeatTimeout);

                delete connections[this.id];

                this.ready  = false;
                this.closed = true;

                this.emit('closed');
            });
    }

    establish (userAgent) {
        this.ready = true;

        const parsedUserAgent = parseUserAgent(userAgent);

        this.browserInfo.userAgent       = parsedUserAgent.toString();
        this.browserInfo.fullUserAgent   = userAgent;
        this.browserInfo.parsedUserAgent = parsedUserAgent;

        this._waitForHeartbeat();
        this.emit('ready');
    }

    heartbeat () {
        clearTimeout(this.heartbeatTimeout);
        this._waitForHeartbeat();

        return {
            code: this.closing ? STATUS.closing : STATUS.ok,
            url:  this.closing ? this.idleUrl : ''
        };
    }

    renderIdlePage () {
        return Mustache.render(IDLE_PAGE_TEMPLATE, {
            userAgent:      this.userAgent,
            statusUrl:      this.statusUrl,
            heartbeatUrl:   this.heartbeatUrl,
            initScriptUrl:  this.initScriptUrl,
            retryTestPages: !!this.browserConnectionGateway.retryTestPages
        });
    }

    getInitScript () {
        const initScriptPromise = this.initScriptsQueue[0];

        return { code: initScriptPromise ? initScriptPromise.code : null };
    }

    handleInitScriptResult (data) {
        const initScriptPromise = this.initScriptsQueue.shift();

        if (initScriptPromise)
            initScriptPromise.resolve(JSON.parse(data));
    }

    isHeadlessBrowser () {
        return this.provider.isHeadlessBrowser(this.id);
    }

    async reportJobResult (status, data) {
        await this.provider.reportJobResult(this.id, status, data);
    }

    async getStatus (isTestDone) {
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
}
