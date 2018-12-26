import AsyncEventEmitter from '../utils/async-event-emitter';
import { TestRun as LegacyTestRun } from 'testcafe-legacy-api';
import TestRun from '../test-run';
import SessionController from '../test-run/session-controller';

const QUARANTINE_THRESHOLD = 3;
const DISCONNECT_THRESHOLD = 3;

class Quarantine {
    constructor () {
        this.attempts = [];
    }

    getFailedAttempts () {
        return this.attempts.filter(errors => !!errors.length);
    }

    getPassedAttempts () {
        return this.attempts.filter(errors => errors.length === 0);
    }

    getNextAttemptNumber () {
        return this.attempts.length + 1;
    }

    isThresholdReached () {
        const failedTimes            = this.getFailedAttempts().length;
        const passedTimes            = this.getPassedAttempts().length;
        const failedThresholdReached = failedTimes >= QUARANTINE_THRESHOLD;
        const passedThresholdReached = passedTimes >= QUARANTINE_THRESHOLD;

        return failedThresholdReached || passedThresholdReached;
    }
}

export default class TestRunController extends AsyncEventEmitter {
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

        this.testRun            = null;
        this.done               = false;
        this.quarantine         = null;
        this.disconnectionCount = 0;

        if (this.opts.quarantineMode)
            this.quarantine = new Quarantine();
    }

    static _getTestRunCtor (test, opts) {
        if (opts.TestRunCtor)
            return opts.TestRunCtor;

        return test.isLegacy ? LegacyTestRun : TestRun;
    }

    _createTestRun (connection) {
        const screenshotCapturer = this.screenshots.createCapturerFor(this.test, this.index, this.quarantine, connection, this.warningLog);
        const TestRunCtor        = this.TestRunCtor;

        this.testRun = new TestRunCtor(this.test, connection, screenshotCapturer, this.warningLog, this.opts);

        if (this.testRun.addQuarantineInfo)
            this.testRun.addQuarantineInfo(this.quarantine);

        return this.testRun;
    }

    async _endQuarantine () {
        if (this.quarantine.attempts.length > 1)
            this.testRun.unstable = this.quarantine.getPassedAttempts().length > 0;

        await this._emitTestRunDone();
    }

    _shouldKeepInQuarantine () {
        const errors    = this.testRun.errs;
        const hasErrors = !!errors.length;
        const attempts  = this.quarantine.attempts;

        attempts.push(errors);

        const isFirstAttempt = attempts.length === 1;

        return isFirstAttempt ? hasErrors : !this.quarantine.isThresholdReached();
    }

    async _keepInQuarantine () {
        await this._restartTest();
    }

    async _restartTest () {
        await this.emit('test-run-restart');
    }

    async _testRunDoneInQuarantineMode () {
        if (this._shouldKeepInQuarantine())
            await this._keepInQuarantine();
        else
            await this._endQuarantine();
    }

    async _testRunDone () {
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

        await this.emit('test-run-done');
    }

    async _testRunDisconnected (connection) {
        this.disconnectionCount++;

        if (this.disconnectionCount < DISCONNECT_THRESHOLD) {
            connection.suppressError();

            await connection.restartBrowser();

            await this._restartTest();
        }
    }

    get blocked () {
        return this.fixtureHookController.isTestBlocked(this.test);
    }

    async start (connection) {
        const testRun = this._createTestRun(connection);

        const hookOk = await this.fixtureHookController.runFixtureBeforeHookIfNecessary(testRun);

        if (this.test.skip || !hookOk) {
            await this.emit('test-run-start');
            await this._emitTestRunDone();
            return null;
        }

        testRun.once('start', () => this.emit('test-run-start'));
        testRun.once('done', () => this._testRunDone());
        testRun.once('disconnected', () => this._testRunDisconnected(connection));

        testRun.start();

        return SessionController.getSessionUrl(testRun, this.proxy);
    }
}
