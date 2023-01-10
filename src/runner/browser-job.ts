import { pull as remove } from 'lodash';
import AsyncEventEmitter from '../utils/async-event-emitter';
import TestRunController from './test-run-controller';
import SessionController from '../test-run/session-controller';
import BrowserConnection from '../browser/connection';
import { Proxy } from 'testcafe-hammerhead';
import Test from '../api/structure/test';
import Screenshots from '../screenshots';
import WarningLog from '../notifications/warning-log';
import FixtureHookController from './fixture-hook-controller';
import { Dictionary } from '../configuration/interfaces';
import BrowserJobResult from './browser-job-result';
import CompilerService from '../services/compiler/host';
import { BrowserJobInit } from './interfaces';
import MessageBus from '../utils/message-bus';
import TestRunHookController from './test-run-hook-controller';
import TestRun from '../test-run';
// @ts-ignore
import { TestRun as LegacyTestRun } from 'testcafe-legacy-api';
import { NextTestRunInfo } from '../shared/types';

interface BrowserJobResultInfo {
    status: BrowserJobResult;
    data?: any;
}

enum BrowserJobStatus { initialized, starting, started }

export default class BrowserJob extends AsyncEventEmitter {
    private _status: BrowserJobStatus;
    private _startTime: Date;
    private _total: number;
    private _passed: number;
    private readonly _opts: Dictionary<OptionValue>;
    private readonly _proxy: Proxy;
    public readonly browserConnections: BrowserConnection[];
    private readonly _screenshots: Screenshots;
    public readonly warningLog: WarningLog;
    public readonly fixtureHookController: FixtureHookController;
    private _result: BrowserJobResultInfo | null;
    private readonly _testRunControllerQueue: TestRunController[];
    private readonly _reportsPending: TestRunController[];
    private readonly _connectionErrorListener: (error: Error) => void;
    private readonly _completionQueue: TestRunController[];
    private _resolveWaitingLastTestInFixture: Function | null;
    private readonly _messageBus: MessageBus;
    private readonly _testRunHook: TestRunHookController;

    public constructor ({
        tests,
        browserConnections,
        proxy,
        screenshots,
        warningLog,
        fixtureHookController,
        opts,
        compilerService,
        messageBus,
    }: BrowserJobInit) {
        super();

        this._status = BrowserJobStatus.initialized;
        this._startTime = new Date();

        this._total                = 0;
        this._passed               = 0;
        this._opts                 = opts;
        this._proxy                = proxy;
        this.browserConnections    = browserConnections;
        this._screenshots          = screenshots;
        this.warningLog            = warningLog;
        this.fixtureHookController = fixtureHookController;
        this._result               = null;
        this._messageBus           = messageBus;
        this._testRunHook          = new TestRunHookController(tests, (opts.hooks as GlobalHooks)?.testRun);

        this._testRunControllerQueue = tests.map((test, index) => this._createTestRunController(test, index, compilerService));

        this._completionQueue = [];
        this._reportsPending  = [];

        this._connectionErrorListener = (error: Error) => this._setResult(BrowserJobResult.errored, error);

        this._resolveWaitingLastTestInFixture = null;

        this.browserConnections.map(bc => bc.once('error', this._connectionErrorListener));
    }

    private _createTestRunController (test: Test, index: number, compilerService?: CompilerService): TestRunController {
        const testRunController = new TestRunController({
            test,
            index:                 index + 1,
            proxy:                 this._proxy,
            screenshots:           this._screenshots,
            warningLog:            this.warningLog,
            fixtureHookController: this.fixtureHookController,
            opts:                  this._opts,
            messageBus:            this._messageBus,
            compilerService,
            testRunHook:           this._testRunHook,
        });

        testRunController.on('test-run-create', async testRunInfo => {
            await this.emit('test-run-create', testRunInfo);
        });
        testRunController.on('test-run-ready', async () => {
            await this.emit('test-run-ready', testRunController);
        });
        testRunController.on('test-run-restart', async () => this._onTestRunRestart(testRunController));
        testRunController.on('test-run-before-done', async () => {
            await this.emit('test-run-before-done', testRunController);
        });
        testRunController.on('test-run-done', async () => this._onTestRunDone(testRunController));

        testRunController.on('test-action-done', async args => {
            await this.emit('test-action-done', args);
        });

        return testRunController;
    }

    private async _setResult (status: BrowserJobResult, data?: any): Promise<void> {
        if (this._result)
            return;

        this._result = { status, data };

        this.browserConnections.forEach(bc => bc.removeListener('error', this._connectionErrorListener));

        await Promise.all(this.browserConnections.map(bc => bc.reportJobResult((this._result as BrowserJobResultInfo).status, (this._result as BrowserJobResultInfo).data)));
    }

    private _addToCompletionQueue (testRunInfo: TestRunController): void {
        this._completionQueue.push(testRunInfo);
    }

    private _removeFromCompletionQueue (testRunInfo: TestRunController): void {
        remove(this._completionQueue, testRunInfo);
    }

    private async _onTestRunRestart (testRunController: TestRunController): Promise<void> {
        this._removeFromCompletionQueue(testRunController);
        this._testRunControllerQueue.unshift(testRunController);

        await this.emit('test-run-restart', testRunController);
    }

    private async _onTestRunDone (testRunController: TestRunController): Promise<void> {
        this._total++;

        if (!testRunController.testRun.errs.length)
            this._passed++;

        while (this._completionQueue.length && this._completionQueue[0].done) {
            testRunController = this._completionQueue.shift() as TestRunController;

            await this.emit('test-run-done', testRunController.testRun);

            remove(this._reportsPending, testRunController);

            if (!this._reportsPending.length && this._resolveWaitingLastTestInFixture) {
                this._resolveWaitingLastTestInFixture();

                this._resolveWaitingLastTestInFixture = null;
            }
        }

        if (!this._completionQueue.length && !this.hasQueuedTestRuns) {
            if (!this._opts.live)
                SessionController.closeSession(testRunController.testRun);

            this
                ._setResult(BrowserJobResult.done, { total: this._total, passed: this._passed })
                .then(() => this.emit('done'));
        }
    }

    private async _isNextTestRunAvailable (testRunController: TestRunController): Promise<boolean> {
        // NOTE: event task start is currently executing,
        // so test run is temporary blocked
        if (this._status === BrowserJobStatus.starting)
            return false;

        // NOTE: before hook for test run fixture is currently
        // executing, so test run is temporary blocked
        const isBlocked                 = testRunController.blocked;
        const isConcurrency             = this._opts.concurrency as number > 1;
        const hasIncompleteTestRuns     = this._completionQueue.some(controller => !controller.done);
        const needWaitLastTestInFixture = this._reportsPending.some(controller => controller.test.fixture !== testRunController.test.fixture);

        if (isBlocked || (hasIncompleteTestRuns || needWaitLastTestInFixture) && !isConcurrency) {
            const disablePageReloads = testRunController.test.disablePageReloads ||
                this._opts.disablePageReloads && testRunController.test.disablePageReloads !== false;

            if (!needWaitLastTestInFixture || !disablePageReloads)
                return false;

            // NOTE: if we have `disablePageReloads` enabled and the next test is from next
            // fixture, then we need to wait until all reporters finished to prevent
            // redirecting to the `idle` page
            await new Promise(resolve => {
                this._resolveWaitingLastTestInFixture = resolve;
            });
        }

        return true;
    }

    // API
    public get hasQueuedTestRuns (): boolean {
        return !!this._testRunControllerQueue.length;
    }

    public get currentTestRun (): LegacyTestRun | TestRun | null {
        return this._completionQueue.length ? this._completionQueue[0].testRun : null;
    }

    public async popNextTestRunInfo (connection: BrowserConnection): Promise<NextTestRunInfo | null> {
        while (this._testRunControllerQueue.length) {
            const testRunController = this._testRunControllerQueue[0];

            const isNextTestRunAvailable = await this._isNextTestRunAvailable(testRunController);

            if (!isNextTestRunAvailable)
                break;

            this._reportsPending.push(testRunController);
            this._testRunControllerQueue.shift();
            this._addToCompletionQueue(testRunController);

            if (this._status === BrowserJobStatus.initialized) {
                this._status = BrowserJobStatus.starting;
                this._startTime   = new Date();

                await this.emit('start', this._startTime);

                this._status = BrowserJobStatus.started;
            }

            const testRunUrl = await testRunController.start(connection, this._startTime);

            if (testRunUrl) {
                return {
                    testRunId: testRunController.testRun.id,
                    url:       testRunUrl,
                };
            }
        }

        return null;
    }

    public abort (): void {
        this.clearListeners();
        this._setResult(BrowserJobResult.aborted);
        this.browserConnections.map(bc => bc.removeJob(this));
    }
}
