import { EventEmitter } from 'events';
import { TestRun as LegacyTestRun } from 'testcafe-legacy-api';
import { find, remove } from 'lodash';
import TestRun from '../test-run';

// Const
const QUARANTINE_THRESHOLD = 3;


// Browser job
export default class BrowserJob extends EventEmitter {
    constructor (tests, browserConnection, proxy, screenshots, warningLog, fixtureHookController, opts) {
        super();

        this.started    = false;
        this.quarantine = null;

        this.opts                  = opts;
        this.proxy                 = proxy;
        this.browserConnection     = browserConnection;
        this.screenshots           = screenshots;
        this.warningLog            = warningLog;
        this.fixtureHookController = fixtureHookController;

        this.testRunQueue    = tests.map((test, index) => this._createTestRun(test, index + 1, 1));
        this.completionQueue = [];
    }

    _shouldStartQuarantine (testRun) {
        return !this.quarantine && testRun.errs.length;
    }

    _startQuarantine (testRun, testIndex) {
        this.quarantine = { passed: 0, failed: 1 };
        this._keepInQuarantine(testRun, testIndex);
    }

    async _endQuarantine (testRun) {
        testRun.unstable = this.quarantine.passed > 0;
        this.quarantine  = null;

        await this._reportTestRunDone(testRun);
    }

    _shouldKeepInQuarantine (testRun) {
        if (testRun.errs.length)
            this.quarantine.failed++;
        else
            this.quarantine.passed++;

        return this.quarantine.failed < QUARANTINE_THRESHOLD && this.quarantine.passed < QUARANTINE_THRESHOLD;
    }

    _keepInQuarantine (testRun, testIndex) {
        var quarantineAttemptNum = this.quarantine.failed + this.quarantine.passed + 1;
        var nextAttempt          = this._createTestRun(testRun.test, testIndex, quarantineAttemptNum);

        this._removeFromCompletionQueue(testRun);
        this.testRunQueue.splice(0, 0, nextAttempt);
    }

    async _testRunDoneInQuarantineMode (testRun, testIndex) {
        this.proxy.closeSession(testRun);

        if (this._shouldStartQuarantine(testRun))
            this._startQuarantine(testRun, testIndex);

        else if (this.quarantine) {
            if (this._shouldKeepInQuarantine(testRun))
                this._keepInQuarantine(testRun, testIndex);
            else
                await this._endQuarantine(testRun);
        }

        else
            await this._reportTestRunDone(testRun);
    }

    async _testRunDone (testRun) {
        this.proxy.closeSession(testRun);
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

        completionQueueItem.done = true;

        var allDone = this.completionQueue.every(item => item.done);

        if (allDone) {
            this.completionQueue.forEach(item => this.emit('test-run-done', item.testRun));

            this.completionQueue = [];

            if (!this.hasQueuedTestRuns)
                this.emit('done');
        }
    }

    _getTestRunCtor (test, opts) {
        if (opts.TestRunCtor)
            return opts.TestRunCtor;

        return test.isLegacy ? LegacyTestRun : TestRun;
    }

    _createTestRun (test, testIndex, quarantineAttemptNum) {
        quarantineAttemptNum = this.opts.quarantineMode ? quarantineAttemptNum : null;

        var screenshotCapturer = this.screenshots.createCapturerFor(test, testIndex, quarantineAttemptNum, this.browserConnection);
        var TestRunCtor        = this._getTestRunCtor(test, this.opts);
        var testRun            = new TestRunCtor(test, this.browserConnection, screenshotCapturer, this.warningLog, this.opts);
        var done               = this.opts.quarantineMode ?
                                 () => this._testRunDoneInQuarantineMode(testRun, testIndex) :
                                 () => this._testRunDone(testRun);

        testRun.once('start', () => this.emit('test-run-start', testRun));
        testRun.once('done', done);

        return testRun;
    }


    // API
    get hasQueuedTestRuns () {
        return !!this.testRunQueue.length;
    }

    async popNextTestRunUrl () {
        while (this.testRunQueue.length) {
            // NOTE: before hook for test run fixture is currently
            // executing, so test run is temporary blocked
            if (this.fixtureHookController.isTestRunBlocked(this.testRunQueue[0]))
                break;

            var testRun = this.testRunQueue.shift();

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

                return this.proxy.openSession(testRun.test.pageUrl, testRun);
            }
        }

        return null;
    }
}
