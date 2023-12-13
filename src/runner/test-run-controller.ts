import AsyncEventEmitter from '../utils/async-event-emitter';
//@ts-ignore
import { TestRun as LegacyTestRun } from 'testcafe-legacy-api';
import TestRun from '../test-run';
import SessionController from '../test-run/session-controller';
import BrowserConnection from '../browser/connection';
import { Proxy, generateUniqueId } from 'testcafe-hammerhead';
import Test from '../api/structure/test';
import Screenshots from '../screenshots';
import WarningLog from '../notifications/warning-log';
import FixtureHookController from './fixture-hook-controller';
import { Dictionary } from '../configuration/interfaces';
import { ActionEventArg, TestRunControllerInit } from './interfaces';
import { Quarantine } from '../utils/get-options/quarantine';
import MessageBus from '../utils/message-bus';
import TestRunHookController from './test-run-hook-controller';
import * as clientScriptsRouting from '../custom-client-scripts/routing';
import { RUNTIME_ERRORS } from '../errors/types';
import { GeneralError } from '../errors/runtime';
import { testRunControllerLogger } from '../utils/debug-loggers';

const DISCONNECT_THRESHOLD = 3;

export default class TestRunController extends AsyncEventEmitter {
    private readonly _quarantine: null | Quarantine;
    private _disconnectionCount: number;
    private readonly _proxy: Proxy;
    public readonly index: number;
    public test: Test;
    private readonly _opts: Dictionary<OptionValue>;
    private _screenshots: Screenshots;
    private readonly _warningLog: WarningLog;
    private readonly _fixtureHookController: FixtureHookController;
    private readonly _testRunCtor: LegacyTestRun['constructor'] | TestRun['constructor'];
    public testRun: null | LegacyTestRun | TestRun;
    public done: boolean;
    private readonly _messageBus: MessageBus;
    private readonly _testRunHook: TestRunHookController;
    private clientScriptRoutes: string[] = [];
    private isNativeAutomation = false;
    public readonly id: string;

    public constructor ({
        test,
        index,
        proxy,
        screenshots,
        warningLog,
        fixtureHookController,
        opts,
        testRunHook,
        messageBus,
    }: TestRunControllerInit) {
        super();

        this.test  = test;
        this.index = index;
        this._opts = opts;
        this.id    = generateUniqueId();

        this._proxy                 = proxy;
        this._screenshots           = screenshots;
        this._warningLog            = warningLog;
        this._fixtureHookController = fixtureHookController;
        this._testRunHook           = testRunHook;

        this._testRunCtor = TestRunController._getTestRunCtor(test, opts);

        this.testRun             = null;
        this.done                = false;
        this._quarantine         = this._opts.quarantineMode ? new Quarantine() : null;
        this._disconnectionCount = 0;
        this._messageBus         = messageBus;
    }

    private static _getTestRunCtor (test: Test, opts: Dictionary<OptionValue>): LegacyTestRun | TestRun {
        if (opts.TestRunCtor)
            return opts.TestRunCtor;

        return (test as LegacyTestRun).isLegacy ? LegacyTestRun : TestRun;
    }

    private async _createTestRun (connection: BrowserConnection, startRunExecutionTime?: Date): Promise<TestRun | LegacyTestRun> {
        const screenshotCapturer = this._screenshots.createCapturerFor(this.test, this.index, this._quarantine, connection, this._warningLog);
        const TestRunCtor        = this._testRunCtor;

        this.testRun = new TestRunCtor({
            test:              this.test,
            browserConnection: connection,
            globalWarningLog:  this._warningLog,
            opts:              this._opts,
            messageBus:        this._messageBus,
            nativeAutomation:  this.isNativeAutomation,
            screenshotCapturer,
            startRunExecutionTime,
        });

        this.clientScriptRoutes = clientScriptsRouting.register({
            proxy:            this._proxy,
            test:             this.test,
            nativeAutomation: this.isNativeAutomation,
            folderName:       this.testRun.id,
        });

        await this.testRun.initialize();

        this._screenshots.addTestRun(this.test, this.testRun);

        if (this.testRun.addQuarantineInfo)
            this.testRun.addQuarantineInfo(this._quarantine);

        if (this._quarantine) {
            const { successThreshold, attemptLimit } = this._opts.quarantineMode as QuarantineOptionValue;

            this._quarantine.setCustomParameters(attemptLimit, successThreshold);
        }

        if (!this._quarantine || this._isFirstQuarantineAttempt()) {
            await this.emit('test-run-create', {
                testRun:    this.testRun,
                legacy:     TestRunCtor === LegacyTestRun,
                test:       this.test,
                index:      this.index,
                quarantine: this._quarantine,
            });
        }

        return this.testRun;
    }

    private async _endQuarantine (): Promise<void> {
        if ((this._quarantine as Quarantine).attempts.length > 1)
            this.testRun.unstable = (this._quarantine as Quarantine).getPassedAttempts().length > 0;

        await this._emitTestRunDone();
    }

    private _shouldKeepInQuarantine (): boolean {
        const errors         = this.testRun.errs;
        const hasErrors      = !!errors.length;
        const attempts       = (this._quarantine as Quarantine).attempts;
        const isFirstAttempt = this._isFirstQuarantineAttempt();

        attempts.push({ testRunId: this.testRun.id, errors });

        return isFirstAttempt ? hasErrors : !(this._quarantine as Quarantine).isThresholdReached();
    }

    private _isFirstQuarantineAttempt (): boolean {
        return !!this._quarantine && !this._quarantine.attempts.length;
    }

    private async _keepInQuarantine (): Promise<void> {
        await this._restartTest();
    }

    private async _restartTest (): Promise<void> {
        await this.emit('test-run-restart');
    }

    private async _testRunDoneInQuarantineMode (): Promise<void> {
        if (this._shouldKeepInQuarantine())
            await this._keepInQuarantine();
        else
            await this._endQuarantine();
    }

    private async _testRunDone (): Promise<void> {
        if (this._quarantine)
            await this._testRunDoneInQuarantineMode();
        else
            await this._emitTestRunDone();
    }

    private async _emitActionStart (args: ActionEventArg): Promise<void> {
        await this._messageBus.emit('test-action-start', args);
    }

    private async _emitActionDone (args: ActionEventArg): Promise<void> {
        await this.emit('test-action-done', args);
    }

    private async _emitTestRunDone (): Promise<void> {
        // NOTE: we should report test run completion in order they were completed in browser.
        // To keep a sequence after fixture hook execution we use completion queue.
        await this._fixtureHookController.runFixtureAfterHookIfNecessary(this.testRun);
        await this._testRunHook.runTestRunAfterHookIfNecessary(this.testRun);

        clientScriptsRouting.unRegister(this._proxy, this.clientScriptRoutes);

        this.done = true;

        await this.emit('test-run-done');

        testRunControllerLogger('done %s', this.id);
    }

    private async _emitTestRunStart (): Promise<void> {
        await this._messageBus.emit('test-run-start', this.testRun);
    }

    private async _testRunBeforeDone (): Promise<void> {
        let raiseEvent = !this._quarantine;

        if (!raiseEvent) {
            const isSuccessfulQuarantineFirstAttempt = this._isFirstQuarantineAttempt() && !this.testRun.errs.length;
            const isAttemptsThresholdReached         = (this._quarantine as Quarantine).isThresholdReached(this.testRun.errs);

            raiseEvent = isSuccessfulQuarantineFirstAttempt || isAttemptsThresholdReached;
        }

        if (raiseEvent)
            await this.emit('test-run-before-done');
    }

    private _testRunDisconnected (connection: BrowserConnection): Promise<void> {
        this._disconnectionCount++;

        const disconnectionThresholdExceeded = this._disconnectionCount >= DISCONNECT_THRESHOLD;

        return connection
            .processDisconnection(disconnectionThresholdExceeded)
            .then(() => {
                return this._restartTest();
            });
    }

    private _assignTestRunEvents (testRun: TestRun | LegacyTestRun, connection: BrowserConnection): void {
        testRun.on('action-start', async (args: ActionEventArg) => this._emitActionStart(Object.assign(args, { testRun })));
        testRun.on('action-done', async (args: ActionEventArg) => this._emitActionDone(Object.assign(args, { testRun })));

        testRun.once('start', async () => this._emitTestRunStart());
        testRun.once('ready', async () => {
            if (!this._quarantine || this._isFirstQuarantineAttempt())
                await this.emit('test-run-ready');
        });
        testRun.once('before-done', () => this._testRunBeforeDone());
        testRun.once('done', () => this._testRunDone());
        testRun.once('disconnected', () => this._testRunDisconnected(connection));
    }

    public get blocked (): boolean {
        return this._fixtureHookController.isTestBlocked(this.test);
    }

    private async _handleNativeAutomationMode (connection: BrowserConnection): Promise<void> {
        this.isNativeAutomation = !this._opts.disableNativeAutomation;

        const supportNativeAutomation = connection.supportNativeAutomation();

        if (!this.isNativeAutomation || supportNativeAutomation)
            return;

        await this._messageBus.emit('before-test-run-created-error');

        throw new GeneralError(RUNTIME_ERRORS.setNativeAutomationForUnsupportedBrowsers, connection.browserInfo.providerName);
    }

    public async start (connection: BrowserConnection, startRunExecutionTime?: Date): Promise<string | null> {
        testRunControllerLogger('start %s %O %O', this.id, {
            test: {
                name: this.test.name,
                id:   this.test.id,
            },
            connection: {
                userAgent: connection.userAgent,
                id:        connection.id,
            },
        });

        await this._handleNativeAutomationMode(connection);

        this._fixtureHookController.blockTestIfNecessary(this.test);

        const testRun = await this._createTestRun(connection, startRunExecutionTime);

        const hookOk = await this._testRunHook.runTestRunBeforeHookIfNecessary(testRun)
                       && await this._fixtureHookController.runFixtureBeforeHookIfNecessary(testRun);

        this._fixtureHookController.unblockTest(this.test);

        if (this.test.skip || !hookOk) {
            await this._emitTestRunStart();
            await this.emit('test-run-before-done');
            await this._emitTestRunDone();

            return null;
        }

        this._assignTestRunEvents(testRun, connection);

        testRun.start();

        return SessionController.getSessionUrl(testRun, this._proxy);
    }
}
