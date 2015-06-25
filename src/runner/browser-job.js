import { EventEmitter } from 'events';
import TestRun from './test-run';

// Const
const QUARANTINE_THRESHOLD = 3;


// Browser job
export default class BrowserJob extends EventEmitter {
    constructor (tests, worker, proxy, opts) {
        super();

        this.started      = false;
        this.quarantine   = null;
        this.opts         = opts;
        this.proxy        = proxy;
        this.testRunQueue = tests.map(test => this._createTestRun(test, worker));
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

        this.emit('test-run-done', testRun);
    }

    _shouldKeepInQuarantine (testRun) {
        if (testRun.errs.length)
            this.quarantine.failed++;
        else
            this.quarantine.passed++;

        return this.quarantine.failed < QUARANTINE_THRESHOLD && this.quarantine.passed < QUARANTINE_THRESHOLD;
    }

    _keepInQuarantine (testRun) {
        var nextAttempt = this._createTestRun(testRun.test, testRun.browserConnection);
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
            this.emit('test-run-done', testRun);
    }

    _testRunDone (testRun) {
        this.proxy.closeSession(testRun);
        this.emit('test-run-done', testRun)
    }

    _createTestRun (test, worker) {
        var testRun = new TestRun(test, worker, this.opts);
        var done    = this.opts.quarantineMode ?
                      () => this._testRunDoneInQuarantineMode(testRun) :
                      () => this._testRunDone(testRun);

        testRun.once('done', done);

        return testRun;
    }


    // API
    getNextTestRunUrl () {
        var testRun = this.testRunQueue.shift();

        if (!this.started) {
            this.started = true;
            this.emit('start');
        }

        if (testRun)
            return this.proxy.openSession(testRun.fixture.page, testRun);

        this.emit('done');

        return null;
    }

    terminate () {
        this.testRunQueue = [];
    }
}