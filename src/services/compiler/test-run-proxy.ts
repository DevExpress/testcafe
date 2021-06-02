import { pull, noop } from 'lodash';
import testRunTracker from '../../api/test-run-tracker';
import prerenderCallsite from '../../utils/prerender-callsite';
import { TestRunDispatcherProtocol } from './protocol';
import TestController from '../../api/test-controller';
import ObservedCallsitesStorage from '../../test-run/observed-callsites-storage';
import WarningLog from '../../notifications/warning-log';
import AssertionCommand from '../../test-run/commands/assertion';
import AssertionExecutor from '../../assertions/executor';
import { Dictionary } from '../../configuration/interfaces';
import COMMAND_TYPE from '../../test-run/commands/type';
import CommandBase from '../../test-run/commands/base';
import * as serviceCommands from '../../test-run/commands/service';
import { TestRunProxyInit } from '../interfaces';
import Test from '../../api/structure/test';
import RequestHook from '../../api/request-hooks/hook';
import getAssertionTimeout from '../../utils/get-options/get-assertion-timeout';
import { StateSnapshot } from 'testcafe-hammerhead';
import { CallsiteRecord } from 'callsite-record';
import TestRunPhase from '../../test-run/phase';
import { RoleSwitchInRoleInitializerError } from '../../errors/test-run';
import Role from '../../role/role';
import ROLE_PHASE from '../../role/phase';
import promisifyEvent from 'promisify-event';
import TestRunBookmark from '../../test-run/bookmark';

import {
    SetTestSpeedCommand,
    SetPageLoadTimeoutCommand,
    SetNativeDialogHandlerCommand,
    NavigateToCommand,
    UseRoleCommand
} from '../../test-run/commands/actions';

import BrowserConsoleMessages from '../../test-run/browser-console-messages';
import { ExecuteClientFunctionCommand, ExecuteSelectorCommand } from '../../test-run/commands/observation';

class TestRunProxy {
    public readonly id: string;
    public readonly test: Test;
    public readonly controller: TestController;
    public readonly observedCallsites: ObservedCallsitesStorage;
    public readonly warningLog: WarningLog;
    public fixtureCtx: object;
    public debugging: boolean = false;
    public onAny: Function = noop;
    private readonly dispatcher: TestRunDispatcherProtocol;
    public ctx: object;
    private readonly _options: Dictionary<OptionValue>;
    private currentRoleId: string | null;
    private readonly usedRoleStates: Record<string, any>;

    public constructor ({ dispatcher, id, test, options }: TestRunProxyInit) {
        this.dispatcher = dispatcher;

        this.id         = id;
        this.test       = test;
        this.ctx        = Object.create(null);
        this.fixtureCtx = Object.create(null);
        this._options   = options;

        this.currentRoleId  = null;
        this.usedRoleStates = Object.create(null);

        // TODO: Synchronize these properties with their real counterparts in the main process.
        // Postponed until (GH-3244). See details in (GH-5250).
        this.controller        = new TestController(this);
        this.observedCallsites = new ObservedCallsitesStorage();
        this.warningLog        = new WarningLog();

        testRunTracker.addActiveTestRun(this);

        this._initializeRequestHooks();
    }

    private _initializeRequestHooks (): void {
        this.test.requestHooks.forEach(this._attachWarningLog, this);
    }

    private async _executeAssertion (command: AssertionCommand, callsite: unknown): Promise<unknown> {
        const assertionTimeout = getAssertionTimeout(command, this._options);

        const executor = new AssertionExecutor(command, assertionTimeout, callsite);

        executor.once('start-assertion-retries', timeout => this.executeCommand(new serviceCommands.ShowAssertionRetriesStatusCommand(timeout) as unknown as CommandBase));
        executor.once('end-assertion-retries', success => this.executeCommand(new serviceCommands.HideAssertionRetriesStatusCommand(success) as unknown as CommandBase));

        return executor.run();
    }

    private async _getStateSnapshotFromRole (role: Role): Promise<StateSnapshot> {
        const prevPhase = await this.dispatcher.getTestRunPhase({ testRunId: this.id });

        await this.dispatcher.setTestRunPhase({
            testRunId: this.id,
            value:     TestRunPhase.inRoleInitializer
        });

        if (role.phase === ROLE_PHASE.uninitialized)
            await role.initialize(this);

        else if (role.phase === ROLE_PHASE.pendingInitialization)
            await promisifyEvent(role, 'initialized');

        if (role.initErr)
            throw role.initErr;

        await this.dispatcher.setTestRunPhase({
            testRunId: this.id,
            value:     prevPhase
        });

        return role.stateSnapshot;
    }

    private async _useRole (role: Role, callsite: unknown): Promise<void> {
        const currentPhase = await this.dispatcher.getTestRunPhase({ testRunId: this.id });

        if (currentPhase === TestRunPhase.inRoleInitializer)
            throw new RoleSwitchInRoleInitializerError(callsite);

        const bookmark = new TestRunBookmark(this, role);

        await bookmark.init();

        if (this.currentRoleId)
            this.usedRoleStates[this.currentRoleId] = await this.dispatcher.getStateSnapshot({ testRunId: this.id });

        const stateSnapshot = this.usedRoleStates[role.id] || await this._getStateSnapshotFromRole(role);

        await this.dispatcher.useStateSnapshot({
            testRunId: this.id,
            snapshot:  stateSnapshot
        });

        this.currentRoleId = role.id;

        await bookmark.restore(callsite as CallsiteRecord, stateSnapshot);
    }

    private _decorateWithFlag (fn: Function, flagName: string, value: boolean): () => Promise<void> {
        return async () => {
            // @ts-ignore
            this[flagName] = value;

            try {
                return await fn();
            }
            catch (err) {
                throw err;
            }
            finally {
                // @ts-ignore
                this[flagName] = !value;
            }
        };
    }

    public decoratePreventEmitActionEvents (fn: Function, { prevent }: { prevent: boolean }): () => Promise<void> {
        return this._decorateWithFlag(fn, 'preventEmitActionEvents', prevent);
    }

    public decorateDisableDebugBreakpoints (fn: Function, { disable }: { disable: boolean }): () => Promise<void> {
        return this._decorateWithFlag(fn, 'disableDebugBreakpoints', disable);
    }

    private _attachWarningLog (hook: RequestHook): void {
        hook._warningLog = this.warningLog;
    }

    private _detachWarningLog (hook: RequestHook): void {
        hook._warningLog = null;
    }

    public async executeAction (apiMethodName: string, command: CommandBase, callsite: CallsiteRecord): Promise<unknown> {
        const renderedCallsite = callsite ? prerenderCallsite(callsite) : null;

        if (command.type === COMMAND_TYPE.assertion)
            return this._executeAssertion(command as AssertionCommand, renderedCallsite);

        else if (command.type === COMMAND_TYPE.useRole)
            return this._useRole((command as UseRoleCommand).role, renderedCallsite);

        return this.dispatcher.executeAction({
            apiMethodName,
            command,
            callsite: renderedCallsite,
            id:       this.id
        });
    }

    public executeActionSync (apiMethodName: string, command: CommandBase, callsite: CallsiteRecord): unknown {
        const renderedCallsite = callsite ? prerenderCallsite(callsite) : null;

        if (command.type === COMMAND_TYPE.assertion)
            return this._executeAssertion(command as AssertionCommand, renderedCallsite);

        return this.dispatcher.executeActionSync({
            apiMethodName,
            command,
            callsite: renderedCallsite,
            id:       this.id
        });
    }

    public async executeCommand (command: CommandBase): Promise<unknown> {
        return this.dispatcher.executeCommand({ command, id: this.id });
    }

    public async addRequestHook (hook: RequestHook): Promise<void> {
        if (this.test.requestHooks.includes(hook))
            return;

        this.test.requestHooks.push(hook);
        this._attachWarningLog(hook);

        await this.dispatcher.addRequestEventListeners({
            hookId:        hook.id,
            hookClassName: hook._className,
            rules:         hook._requestFilterRules
        });
    }

    public async removeRequestHook (hook: RequestHook): Promise<void> {
        if (!this.test.requestHooks.includes(hook))
            return;

        pull(this.test.requestHooks, hook);
        this._detachWarningLog(hook);

        await this.dispatcher.removeRequestEventListeners({ rules: hook._requestFilterRules });
    }

    public async getCurrentUrl (): Promise<string> {
        return this.dispatcher.getCurrentUrl({ testRunId: this.id });
    }

    public async switchToCleanRun (url: string): Promise<void> {
        this.ctx        = Object.create(null);
        this.fixtureCtx = Object.create(null);

        await this.dispatcher.setBrowserConsoleMessages({
            testRunId: this.id,
            value:     new BrowserConsoleMessages()
        });

        await this.dispatcher.useStateSnapshot({
            testRunId: this.id,
            snapshot:  StateSnapshot.empty()
        });

        if (await this.speed !== this._options.speed) {
            const setSpeedCommand = new SetTestSpeedCommand({ speed: this._options.speed });

            await this.executeCommand(setSpeedCommand);
        }

        if (await this.pageLoadTimeout !== this._options.pageLoadTimeout) {
            const setPageLoadTimeoutCommand = new SetPageLoadTimeoutCommand({ duration: this._options.pageLoadTimeout });

            await this.executeCommand(setPageLoadTimeoutCommand);
        }

        await this.navigateToUrl(url, true);

        if (await this.activeDialogHandler) {
            const removeDialogHandlerCommand = new SetNativeDialogHandlerCommand({ dialogHandler: { fn: null } });

            await this.executeCommand(removeDialogHandlerCommand);
        }
    }

    public async getStateSnapshot (): Promise<StateSnapshot> {
        return this.dispatcher.getStateSnapshot({ testRunId: this.id });
    }

    public async navigateToUrl (url: string, forceReload: boolean, stateSnapshot?: string): Promise<void> {
        const navigateCommand = new NavigateToCommand({ url, forceReload, stateSnapshot });

        await this.executeCommand(navigateCommand);
    }

    public get activeDialogHandler (): Promise<ExecuteClientFunctionCommand | null> {
        return this.dispatcher.getActiveDialogHandler({ testRunId: this.id });
    }

    public get activeIframeSelector (): Promise<ExecuteSelectorCommand | null> {
        return this.dispatcher.getActiveIframeSelector({ testRunId: this.id });
    }

    public get speed (): Promise<number> {
        return this.dispatcher.getSpeed({ testRunId: this.id });
    }

    public get pageLoadTimeout (): Promise<number> {
        return this.dispatcher.getPageLoadTimeout({ testRunId: this.id });
    }

    public get consoleMessages (): Promise<BrowserConsoleMessages> {
        return this.dispatcher.getBrowserConsoleMessages({ testRunId: this.id });
    }

    public get phase (): Promise<TestRunPhase> {
        return this.dispatcher.getTestRunPhase({ testRunId: this.id });
    }

    public async setConsoleMessages (value: BrowserConsoleMessages): Promise<void> {
        await this.dispatcher.setBrowserConsoleMessages({
            testRunId: this.id,
            value
        });
    }

    public async setPhase (value: TestRunPhase): Promise<void> {
        await this.dispatcher.setTestRunPhase({
            testRunId: this.id,
            value
        });
    }
}

export default TestRunProxy;


