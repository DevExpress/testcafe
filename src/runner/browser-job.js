import { pull as remove } from 'lodash';
import AsyncEventEmitter from '../utils/async-event-emitter';
import TestRunController from './test-run-controller';
import SessionController from '../test-run/session-controller';
import RESULT from './browser-job-result';

export default class BrowserJob extends AsyncEventEmitter {
    constructor (tests, browserConnections, proxy, screenshots, warningLog, fixtureHookController, opts) {
        super();

        this.started = false;

        this.total                 = 0;
        this.passed                = 0;
        this.opts                  = opts;
        this.proxy                 = proxy;
        this.browserConnections    = browserConnections;
        this.screenshots           = screenshots;
        this.warningLog            = warningLog;
        this.fixtureHookController = fixtureHookController;
        this.result                = null;

        this.testRunControllerQueue = tests.map((test, index) => this._createTestRunController(test, index));

        this.completionQueue = [];
        this.reportsPending  = [];

        this.connectionErrorListener = error => this._setResult(RESULT.errored, error);

        this.browserConnections.map(bc => bc.once('error', this.connectionErrorListener));
    }

    _createTestRunController (test, index) {
        const testRunController = new TestRunController(test, index + 1, this.proxy, this.screenshots, this.warningLog,
            this.fixtureHookController, this.opts);

        testRunController.on('test-run-create', async testRunInfo => {
            await this.emit('test-run-create', testRunInfo);
        });
        testRunController.on('test-run-start', async () => {
            await this.emit('test-run-start', testRunController.testRun);
        });
        testRunController.on('test-run-ready', async () => {
            await this.emit('test-run-ready', testRunController);
        });
        testRunController.on('test-run-restart', async () => this._onTestRunRestart(testRunController));
        testRunController.on('test-run-before-done', async () => {
            await this.emit('test-run-before-done', testRunController);
        });
        testRunController.on('test-run-done', async () => this._onTestRunDone(testRunController));

        testRunController.on('test-action-start', async args => {
            await this.emit('test-action-start', args);
        });

        testRunController.on('test-action-done', async args => {
            await this.emit('test-action-done', args);
        });

        return testRunController;
    }

    async _setResult (status, data) {
        if (this.result)
            return;

        this.result = { status, data };

        this.browserConnections.forEach(bc => bc.removeListener('error', this.connectionErrorListener));

        await Promise.all(this.browserConnections.map(bc => bc.reportJobResult(this.result.status, this.result.data)));
    }

    _addToCompletionQueue (testRunInfo) {
        this.completionQueue.push(testRunInfo);
    }

    _removeFromCompletionQueue (testRunInfo) {
        remove(this.completionQueue, testRunInfo);
    }

    _onTestRunRestart (testRunController) {
        this._removeFromCompletionQueue(testRunController);
        this.testRunControllerQueue.unshift(testRunController);
    }

    async _onTestRunDone (testRunController) {
        this.total++;

        if (!testRunController.testRun.errs.length)
            this.passed++;

        while (this.completionQueue.length && this.completionQueue[0].done) {
            testRunController = this.completionQueue.shift();

            await this.emit('test-run-done', testRunController.testRun);

            remove(this.reportsPending, testRunController);
        }

        if (!this.completionQueue.length && !this.hasQueuedTestRuns) {
            if (!this.opts.live)
                SessionController.closeSession(testRunController.testRun);

            this
                ._setResult(RESULT.done, { total: this.total, passed: this.passed })
                .then(() => this.emit('done'));
        }
    }

    // API
    get hasQueuedTestRuns () {
        return !!this.testRunControllerQueue.length;
    }

    async popNextTestRunUrl (connection) {
        while (this.testRunControllerQueue.length) {
            // NOTE: before hook for test run fixture is currently
            // executing, so test run is temporary blocked
            const testRunController         = this.testRunControllerQueue[0];
            const isBlocked                 = testRunController.blocked;
            const isConcurrency             = this.opts.concurrency > 1;
            const hasIncompleteTestRuns     = this.completionQueue.some(controller => !controller.done);
            const needWaitLastTestInFixture = this.reportsPending.some(controller => controller.test.fixture !== testRunController.test.fixture);

            if (isBlocked || (hasIncompleteTestRuns || needWaitLastTestInFixture) && !isConcurrency)
                break;

            this.reportsPending.push(testRunController);
            this.testRunControllerQueue.shift();
            this._addToCompletionQueue(testRunController);

            if (!this.started) {
                this.started = true;
                await this.emit('start');
            }

            const testRunUrl = await testRunController.start(connection);

            if (testRunUrl)
                return testRunUrl;
        }

        return null;
    }

    abort () {
        this.clearListeners();
        this._setResult(RESULT.aborted);
        this.browserConnections.map(bc => bc.removeJob(this));
    }
}
