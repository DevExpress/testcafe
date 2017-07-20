import Promise from 'pinkie';
import { EventEmitter } from 'events';
import { remove } from 'lodash';
import TestRunController from './test-run-controller';
import RESULT from './browser-job-result';


// Browser job
export default class BrowserJob extends EventEmitter {
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

        this.connectionErrorListener = error => this._setResult(RESULT.errored, error);

        this.browserConnections.map(bc => bc.once('error', this.connectionErrorListener));
    }

    _createTestRunController (test, index) {
        var testRunController = new TestRunController(test, index + 1, this.proxy, this.screenshots, this.warningLog,
            this.fixtureHookController, this.opts);

        testRunController.on('test-run-start', () => this.emit('test-run-start', testRunController.testRun));
        testRunController.on('test-run-restart', () => this._onTestRunRestart(testRunController));
        testRunController.on('test-run-done', () => this._onTestRunDone(testRunController));

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

            this.emit('test-run-done', testRunController.testRun);
        }

        if (!this.completionQueue.length && !this.hasQueuedTestRuns) {
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
            if (this.testRunControllerQueue[0].blocked)
                break;

            var testRunController = this.testRunControllerQueue.shift();

            this._addToCompletionQueue(testRunController);

            if (!this.started) {
                this.started = true;
                this.emit('start');
            }

            var testRunUrl = await testRunController.start(connection);

            if (testRunUrl)
                return testRunUrl;
        }

        return null;
    }

    abort () {
        this.removeAllListeners();
        this._setResult(RESULT.aborted);
        this.browserConnections.map(bc => bc.removeJob(this));
    }
}
