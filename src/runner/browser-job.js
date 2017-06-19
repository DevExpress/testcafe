import { EventEmitter } from 'events';
import { TestRun as LegacyTestRun } from 'testcafe-legacy-api';
import { find, remove } from 'lodash';
import TestRun from '../test-run';
import RESULT from './browser-job-result';

// Const
const QUARANTINE_THRESHOLD = 3;


// Browser job
export default class BrowserJob extends EventEmitter {
    constructor (tests, browserConnections, proxy, screenshots, warningLog, fixtureHookController, opts) {
        super();

        this.started    = false;

        this.total                 = 0;
        this.passed                = 0;
        this.opts                  = opts;
        this.proxy                 = proxy;
        this.browserConnections    = browserConnections;
        this.screenshots           = screenshots;
        this.warningLog            = warningLog;
        this.fixtureHookController = fixtureHookController;
        this.result                = null;

        this.testsQueue      = tests.map((test, index) => ({ test, index, attempt: 1, passed: 0, failed: 0, done: false }));
        this.completionQueue = [];

        this.connectionErrorListener = error => this._setResult(RESULT.errored, error);

        this.browserConnections.map(bc => bc.once('error', this.connectionErrorListener));
    }

    async _setResult (status, data) {
        if (this.result)
            return;

        this.result = { status, data };

        this.browserConnections.map(bc => bc.removeListener('error', this.connectionErrorListener));

        await this.browserConnections.map(bc => bc.reportJobResult(this.result.status, this.result.data));
    }

    _shouldStartQuarantine (testRun) {
        return !this.quarantine && testRun.errs.length;
    }

    _startQuarantine (testRun, testIndex) {
        this.quarantine = { passed: 0, failed: 1 };
        this._keepInQuarantine(testRun, testIndex);
    }

    async _endQuarantine (testRun, testInfo) {
        testRun.unstable = testInfo.passed > 0;

        await this._reportTestRunDone(testRun);
    }

    _shouldKeepInQuarantine (testRun, testInfo) {
        if (testRun.errs.length)
            testInfo.failed++;
        else
            testInfo.passed++;

        return this.quarantine.failed < QUARANTINE_THRESHOLD && this.quarantine.passed < QUARANTINE_THRESHOLD;
    }

    _keepInQuarantine (testRun, testInfo) {
        testInfo.attempt = testInfo.failed + testInfo.passed + 1;

        this._removeFromCompletionQueue(testRun);
        this.testsQueue.unshift(testInfo);
    }

    async _testRunDoneInQuarantineMode (testRun, testInfo) {
        if (this._shouldKeepInQuarantine(testRun, testInfo))
            this._keepInQuarantine(testRun, testInfo);
        else
            await this._endQuarantine(testRun, testInfo);
    }

    async _testRunDone (testRun, testInfo) {
        this.proxy.closeSession(testRun);

        if (this.opts.quarantineMode && !testInfo.done)
            await this._testRunDoneInQuarantineMode(testRun, testInfo);
        else
            await this._reportTestRunDone(testRun);
    }

    _addToCompletionQueue (testRun) {
        this.completionQueue.push({ testRun, done: false });
    }

    _removeFromCompletionQueue (testRun) {
        remove(this.completionQueue, item => item.testRun === testRun);
    }

    async _reportTestRunDone (testRun) {
        // NOTE: we should report test run completion in order they were completed in browser.
        // To keep a sequence after fixture hook execution we use completion queue.
        await this.fixtureHookController.runFixtureAfterHookIfNecessary(testRun);

        var completionQueueItem = find(this.completionQueue, item => item.testRun === testRun);

        if (!completionQueueItem.done) {
            completionQueueItem.done = true;

            this.total++;

            if (!testRun.errs.length)
                this.passed++;
        }

        while (this.completionQueue.length && this.completionQueue[0].done) {
            completionQueueItem = this.completionQueue.shift();

            this.emit('test-run-done', completionQueueItem.testRun);
        }

        if (!this.completionQueue.length && !this.hasQueuedTestRuns) {
            this
                ._setResult(RESULT.done, { total: this.total, passed: this.passed })
                .then(() => this.emit('done'));
        }
    }

    _getTestRunCtor (test, opts) {
        if (opts.TestRunCtor)
            return opts.TestRunCtor;

        return test.isLegacy ? LegacyTestRun : TestRun;
    }

    _createTestRun (testInfo, connection) {
        var quarantineAttemptNum = this.opts.quarantineMode ? testInfo.attempt : null;
        var screenshotCapturer   = this.screenshots.createCapturerFor(testInfo.test, testInfo.index, quarantineAttemptNum, connection);
        var TestRunCtor          = this._getTestRunCtor(testInfo.test, this.opts);
        var testRun              = new TestRunCtor(testInfo.test, connection, screenshotCapturer, this.warningLog, this.opts);

        testRun.once('start', () => this.emit('test-run-start', testRun));
        testRun.once('done', () => this._testRunDone(testRun, testInfo));

        return testRun;
    }


    // API
    get hasQueuedTestRuns () {
        return !!this.testsQueue.length;
    }

    async popNextTestRunUrl (connection) {
        while (this.testsQueue.length) {
            // NOTE: before hook for test run fixture is currently
            // executing, so test run is temporary blocked
            if (this.fixtureHookController.isTestBlocked(this.testsQueue[0].test))
                break;

            var testInfo = this.testsQueue.shift(connection);
            var testRun  = this._createTestRun(testInfo, connection);

            if (!this.started) {
                this.started = true;
                this.emit('start');
            }

            this._addToCompletionQueue(testRun);

            var hookOk = await this.fixtureHookController.runFixtureBeforeHookIfNecessary(testRun);

            if (testRun.test.skip || !hookOk) {
                this.emit('test-run-start', testRun);
                await this._reportTestRunDone(testRun);
            }

            else {
                testRun.start();

                return this.proxy.openSession(testRun.test.pageUrl, testRun, this.opts.externalProxyHost);
            }
        }

        return null;
    }

    abort () {
        this.removeAllListeners();
        this._setResult(RESULT.aborted);
        this.browserConnections.map(bc => bc.removeJob(this));
    }
}
