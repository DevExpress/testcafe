import EventEmitter from 'events';
import { TestRun as LegacyTestRun } from 'testcafe-legacy-api';
import TestRun from '../test-run';


// Const
const QUARANTINE_THRESHOLD = 3;

class Quarantine {
    constructor () {
        this.passedTimes   = [];
        this.failedTimes   = [];
        this.attemptNumber = 1;
    }

    isFailedAttempt (attemptIndex) {
        return this.failedTimes.indexOf(attemptIndex) > -1;
    }
}

export default class TestRunController extends EventEmitter {
    constructor (test, index, proxy, screenshots, warningLog, fixtureHookController, opts) {
        super();

        this.test  = test;
        this.index = index;
        this.opts  = opts;

        this.proxy                 = proxy;
        this.screenshots           = screenshots;
        this.warningLog            = warningLog;
        this.fixtureHookController = fixtureHookController;

        this.TestRunCtor = TestRunController._getTestRunCtor(test, opts);

        this.testRun    = null;
        this.done       = false;
        this.quarantine = null;

        if (this.opts.quarantineMode)
            this.quarantine = new Quarantine();
    }

    static _getTestRunCtor (test, opts) {
        if (opts.TestRunCtor)
            return opts.TestRunCtor;

        return test.isLegacy ? LegacyTestRun : TestRun;
    }

    _createTestRun (connection) {
        var screenshotCapturer = this.screenshots.createCapturerFor(this.test, this.index, this.quarantine, connection, this.warningLog);
        var TestRunCtor        = this.TestRunCtor;

        this.testRun = new TestRunCtor(this.test, connection, screenshotCapturer, this.warningLog, this.opts);

        return this.testRun;
    }

    async _endQuarantine () {
        if (this.quarantine.attemptNumber > 1)
            this.testRun.unstable = this.quarantine.passedTimes > 0;

        await this._emitTestRunDone();
    }

    _shouldKeepInQuarantine () {
        var hasErrors     = !!this.testRun.errs.length;
        var attemptNumber = this.quarantine.attemptNumber;

        if (hasErrors)
            this.quarantine.failedTimes.push(attemptNumber);
        else
            this.quarantine.passedTimes.push(attemptNumber);

        var isFirstAttempt         = attemptNumber === 1;
        var failedThresholdReached = this.quarantine.failedTimes.length >= QUARANTINE_THRESHOLD;
        var passedThresholdReached = this.quarantine.passedTimes.length >= QUARANTINE_THRESHOLD;

        return isFirstAttempt ? hasErrors : !failedThresholdReached && !passedThresholdReached;
    }

    _keepInQuarantine () {
        this.quarantine.attemptNumber = this.quarantine.failedTimes.length + this.quarantine.passedTimes.length + 1;

        this.emit('test-run-restart');
    }

    async _testRunDoneInQuarantineMode () {
        if (this._shouldKeepInQuarantine())
            this._keepInQuarantine();
        else
            await this._endQuarantine();
    }

    async _testRunDone () {
        this.proxy.closeSession(this.testRun);

        if (this.quarantine)
            await this._testRunDoneInQuarantineMode();
        else
            await this._emitTestRunDone();
    }

    async _emitTestRunDone () {
        // NOTE: we should report test run completion in order they were completed in browser.
        // To keep a sequence after fixture hook execution we use completion queue.
        await this.fixtureHookController.runFixtureAfterHookIfNecessary(this.testRun);

        this.done = true;

        this.emit('test-run-done');
    }

    get blocked () {
        return this.fixtureHookController.isTestBlocked(this.test);
    }

    async start (connection) {
        var testRun = this._createTestRun(connection);

        var hookOk = await this.fixtureHookController.runFixtureBeforeHookIfNecessary(testRun);

        if (this.test.skip || !hookOk) {
            this.emit('test-run-start');
            await this._emitTestRunDone();
            return null;
        }

        testRun.once('start', () => this.emit('test-run-start'));
        testRun.once('done', () => this._testRunDone());

        testRun.start();

        const pageUrl             = testRun.test.pageUrl;
        const externalProxyHost   = this.opts.externalProxyHost;
        let externalProxySettings = null;

        if (externalProxyHost) {
            externalProxySettings = {
                url:         externalProxyHost,
                bypassRules: this.opts.proxyBypass
            };
        }

        return this.proxy.openSession(pageUrl, testRun, externalProxySettings);
    }
}
