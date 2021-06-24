import { pull } from 'lodash';
import testRunTracker from '../../api/test-run-tracker';
import prerenderCallsite from '../../utils/prerender-callsite';
import { TestRunDispatcherProtocol } from './protocol';
import TestController from '../../api/test-controller';
import ObservedCallsitesStorage from '../../test-run/observed-callsites-storage';
import WarningLog from '../../notifications/warning-log';
import AssertionCommand from '../../test-run/commands/assertion';
import { Dictionary } from '../../configuration/interfaces';
import COMMAND_TYPE from '../../test-run/commands/type';
import CommandBase from '../../test-run/commands/base';
import { TestRunProxyInit } from '../interfaces';
import Test from '../../api/structure/test';
import RequestHook from '../../api/request-hooks/hook';
import { generateUniqueId } from 'testcafe-hammerhead';
import { CallsiteRecord } from 'callsite-record';
import { UseRoleCommand } from '../../test-run/commands/actions';
import ReExecutablePromise from '../../utils/re-executable-promise';
import AsyncEventEmitter from '../../utils/async-event-emitter';

class TestRunProxy extends AsyncEventEmitter {
    public readonly id: string;
    public readonly test: Test;
    public readonly controller: TestController;
    public readonly observedCallsites: ObservedCallsitesStorage;
    public readonly warningLog: WarningLog;
    public fixtureCtx: object;
    public debugging: boolean = false;
    private readonly dispatcher: TestRunDispatcherProtocol;
    public ctx: object;
    private readonly _options: Dictionary<OptionValue>;
    private readonly assertionCommandActualValues: Map<string, ReExecutablePromise>;

    public constructor ({ dispatcher, id, test, options }: TestRunProxyInit) {
        super();

        this.dispatcher = dispatcher;

        this.id         = id;
        this.test       = test;
        this.ctx        = Object.create(null);
        this.fixtureCtx = Object.create(null);
        this._options   = options;

        this.assertionCommandActualValues = new Map<string, ReExecutablePromise>();

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

    private _attachWarningLog (hook: RequestHook): void {
        hook._warningLog = this.warningLog;
    }

    private _detachWarningLog (hook: RequestHook): void {
        hook._warningLog = null;
    }

    private _handleAssertionCommand (command: AssertionCommand): void {
        if (command.actual instanceof ReExecutablePromise === false)
            return;

        command.id = generateUniqueId();

        this.assertionCommandActualValues.set((command as AssertionCommand).id, command.actual as ReExecutablePromise);
    }

    public async executeAction (apiMethodName: string, command: CommandBase, callsite: CallsiteRecord): Promise<unknown> {
        const renderedCallsite = callsite ? prerenderCallsite(callsite) : null;

        if (command.type === COMMAND_TYPE.assertion)
            this._handleAssertionCommand(command as AssertionCommand);
        else if (command.type === COMMAND_TYPE.useRole)
            this.dispatcher.onRoleAppeared((command as UseRoleCommand).role);

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
            this._handleAssertionCommand(command as AssertionCommand);
        else if (command.type === COMMAND_TYPE.useRole)
            this.dispatcher.onRoleAppeared((command as UseRoleCommand).role);

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

    public async getAssertionActualValue (commandId: string): Promise<unknown> {
        const assertionReExecutablePromise = this.assertionCommandActualValues.get(commandId) as ReExecutablePromise;

        return assertionReExecutablePromise._reExecute();
    }
}

export default TestRunProxy;


