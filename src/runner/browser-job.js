import { EventEmitter } from 'events';
import { TestRun as LegacyTestRun } from 'testcafe-legacy-api';
import TestRun from '../test-run';

// Const
const QUARANTINE_THRESHOLD = 3;


// Browser job
export default class BrowserJob extends EventEmitter {
    constructor (tests, browserConnection, proxy, screenshots, warningLog, opts) {
        super();

        this.started    = false;
        this.quarantine = null;

        this.opts              = opts;
        this.proxy             = proxy;
        this.browserConnection = browserConnection;
        this.screenshots       = screenshots;
        this.warningLog        = warningLog;

        this.testRunQueue = tests.map((test, index) => this._createTestRun(test, index + 1, 0));
    }

    _shouldStartQuarantine (testRun) {
        return !this.quarantine && testRun.errs.length;
    }

    _startQuarantine (testRun, testIndex) {
        this.quarantine = { passed: 0, failed: 1 };
        this._keepInQuarantine(testRun, testIndex);
    }

    _endQuarantine (testRun) {
        testRun.unstable = this.quarantine.passed > 0;
        this.quarantine  = null;

        this._reportTestRunDone(testRun);
    }

    _shouldKeepInQuarantine (testRun) {
        if (testRun.errs.length)
            this.quarantine.failed++;
        else
            this.quarantine.passed++;

        return this.quarantine.failed < QUARANTINE_THRESHOLD && this.quarantine.passed < QUARANTINE_THRESHOLD;
    }

    _keepInQuarantine (testRun, testIndex) {
        var nextAttempt = this._createTestRun(testRun.test, testIndex, this.quarantine.failed + this.quarantine.passed);

        this.testRunQueue.splice(0, 0, nextAttempt);
    }

    _testRunDoneInQuarantineMode (testRun, testIndex) {
        this.proxy.closeSession(testRun);

        if (this._shouldStartQuarantine(testRun))
            this._startQuarantine(testRun, testIndex);

        else if (this.quarantine) {
            if (this._shouldKeepInQuarantine(testRun))
                this._keepInQuarantine(testRun, testIndex);
            else
                this._endQuarantine(testRun);
        }

        else
            this._reportTestRunDone(testRun);
    }

    _testRunDone (testRun) {
        this.proxy.closeSession(testRun);
        this._reportTestRunDone(testRun);
    }

    _reportTestRunDone (testRun) {
        this.emit('test-run-done', testRun);

        if (!this.hasQueuedTestRuns)
            this.emit('done');
    }

    _createTestRun (test, testIndex, quarantineAttemptNum) {
        var TestRunCtor        = test.isLegacy ? LegacyTestRun : TestRun;
        var screenshotCapturer = this.screenshots.createCapturerFor(test, testIndex, quarantineAttemptNum, this.browserConnection);
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

    popNextTestRunUrl () {
        var testRun = this.testRunQueue.shift();

        if (!this.started) {
            this.started = true;
            this.emit('start');
        }

        if (testRun) {
            testRun.start();
            return this.proxy.openSession(testRun.test.fixture.pageUrl, testRun);
        }

        return null;
    }
}
