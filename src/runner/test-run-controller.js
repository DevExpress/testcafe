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

    isThresholdReached (extraErrors) {
        const { failedTimes, passedTimes } = this._getAttemptsResult(extraErrors);

        const failedThresholdReached = failedTimes >= QUARANTINE_THRESHOLD;
        const passedThresholdReached = passedTimes >= QUARANTINE_THRESHOLD;

        return failedThresholdReached || passedThresholdReached;
    }

    _getAttemptsResult (extraErrors) {
        let failedTimes = this.getFailedAttempts().length;
        let passedTimes = this.getPassedAttempts().length;

        if (extraErrors) {
            if (extraErrors.length)
                failedTimes += extraErrors.length;
            else
                passedTimes += 1;
        }

        return { failedTimes, passedTimes };
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

    async _createTestRun (connection) {
        const screenshotCapturer = this.screenshots.createCapturerFor(this.test, this.index, this.quarantine, connection, this.warningLog);
        const TestRunCtor        = this.TestRunCtor;

        this.testRun = new TestRunCtor(this.test, connection, screenshotCapturer, this.warningLog, this.opts);

        if (this.testRun.addQuarantineInfo)
            this.testRun.addQuarantineInfo(this.quarantine);

        if (!this.quarantine || this._isFirstQuarantineAttempt()) {
            await this.emit('test-run-create', {
                testRun:    this.testRun,
                legacy:     TestRunCtor === LegacyTestRun,
                test:       this.test,
                index:      this.index,
                quarantine: this.quarantine,
            });
        }

        return this.testRun;
    }

    async _endQuarantine () {
        if (this.quarantine.attempts.length > 1)
            this.testRun.unstable = this.quarantine.getPassedAttempts().length > 0;

        await this._emitTestRunDone();
    }

    _shouldKeepInQuarantine () {
        const errors         = this.testRun.errs;
        const hasErrors      = !!errors.length;
        const attempts       = this.quarantine.attempts;
        const isFirstAttempt = this._isFirstQuarantineAttempt();

        attempts.push(errors);

        return isFirstAttempt ? hasErrors : !this.quarantine.isThresholdReached();
    }

    _isFirstQuarantineAttempt () {
        return this.quarantine && !this.quarantine.attempts.length;
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

    async _testRunBeforeDone () {
        let raiseEvent = !this.quarantine;

        if (!raiseEvent) {
            const isSuccessfulQuarantineFirstAttempt = this._isFirstQuarantineAttempt() && !this.testRun.errs.length;
            const isAttemptsThresholdReached         = this.quarantine.isThresholdReached(this.testRun.errs);

            raiseEvent = isSuccessfulQuarantineFirstAttempt || isAttemptsThresholdReached;
        }

        if (raiseEvent)
            await this.emit('test-run-before-done');
    }

    _testRunDisconnected (connection) {
        this.disconnectionCount++;

        const disconnectionThresholdExceedeed = this.disconnectionCount >= DISCONNECT_THRESHOLD;

        return connection
            .processDisconnection(disconnectionThresholdExceedeed)
            .then(() => {
                return this._restartTest();
            });
    }

    get blocked () {
        return this.fixtureHookController.isTestBlocked(this.test);
    }

    async start (connection) {
        const testRun = await this._createTestRun(connection);

        const hookOk = await this.fixtureHookController.runFixtureBeforeHookIfNecessary(testRun);

        if (this.test.skip || !hookOk) {
            await this.emit('test-run-start');
            await this._emitTestRunDone();
            return null;
        }

        testRun.once('start', async () => {
            await this.emit('test-run-start');
        });
        testRun.once('ready', async () => {
            if (!this.quarantine || this._isFirstQuarantineAttempt())
                await this.emit('test-run-ready');
        });
        testRun.once('before-done', () => this._testRunBeforeDone());
        testRun.once('done', () => this._testRunDone());
        testRun.once('disconnected', () => this._testRunDisconnected(connection));

        testRun.start();

        return SessionController.getSessionUrl(testRun, this.proxy);
    }
}
