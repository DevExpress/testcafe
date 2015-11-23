import { EventEmitter } from 'events';
import TestRun from './test-run';

// Const
const QUARANTINE_THRESHOLD = 3;


// Browser job
export default class BrowserJob extends EventEmitter {
    constructor (tests, browserConnection, proxy, screenshots, opts) {
        super();

        this.started    = false;
        this.quarantine = null;

        this.opts              = opts;
        this.proxy             = proxy;
        this.browserConnection = browserConnection;

        this.testRunQueue = tests.map(test => this._createTestRun(test, screenshots));
    }

    _shouldStartQuarantine (testRun) {
        return !this.quarantine && testRun.errs.length;
    }

    _startQuarantine (testRun) {
        this.quarantine = { passed: 0, failed: 1 };
        this._keepInQuarantine(testRun);
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

    _keepInQuarantine (testRun) {
        var nextAttempt = this._createTestRun(testRun.test, this.browserConnection);

        this.testRunQueue.splice(0, 0, nextAttempt);
    }

    _testRunDoneInQuarantineMode (testRun) {
        this.proxy.closeSession(testRun);

        if (this._shouldStartQuarantine(testRun))
            this._startQuarantine(testRun);

        else if (this.quarantine) {
            if (this._shouldKeepInQuarantine(testRun))
                this._keepInQuarantine(testRun);
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

    _createTestRun (test, screenshots) {
        var screenshotCapturer = screenshots.createCapturerFor(test, this.browserConnection.userAgent);
        var testRun            = new TestRun(test, this.browserConnection, screenshotCapturer, this.opts);
        var done               = this.opts.quarantineMode ?
                                 () => this._testRunDoneInQuarantineMode(testRun) :
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

        if (testRun)
            return this.proxy.openSession(testRun.test.fixture.page, testRun);

        return null;
    }
}
