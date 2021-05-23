import { pull } from 'lodash';
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

import {
    ConfigureResponseEvent,
    RequestEvent,
    RequestFilterRule,
    ResponseEvent
} from 'testcafe-hammerhead';

import { CallsiteRecord } from 'callsite-record';

class TestRunProxy {
    public readonly id: string;
    public readonly test: Test;
    public readonly controller: TestController;
    public readonly observedCallsites: ObservedCallsitesStorage;
    public readonly warningLog: WarningLog;
    public fixtureCtx?: object;
    private readonly dispatcher: TestRunDispatcherProtocol;
    private readonly ctx: unknown;
    private readonly _options: Dictionary<OptionValue>;

    public constructor ({ dispatcher, id, test, options }: TestRunProxyInit) {
        this.dispatcher = dispatcher;

        this.id       = id;
        this.test     = test;
        this.ctx      = Object.create(null);
        this._options = options;

        // TODO: Synchronize these properties with their real counterparts in the main process.
        // Postponed until (GH-3244). See details in (GH-5250).
        this.controller        = new TestController(this);
        this.observedCallsites = new ObservedCallsitesStorage();
        this.warningLog        = new WarningLog();

        testRunTracker.activeTestRuns[id] = this;

        this._initializeRequestHooks();
    }

    private _initializeRequestHooks (): void {
        this.test.requestHooks.forEach(this._attachWarningLog, this);
    }

    private _restoreRequestFilterRule (event: RequestEvent | ConfigureResponseEvent | ResponseEvent): void {
        event.requestFilterRule = RequestFilterRule.from(event.requestFilterRule as object);
    }

    private async _executeAssertion (command: AssertionCommand, callsite: unknown): Promise<unknown> {
        const assertionTimeout = getAssertionTimeout(command, this._options);

        const executor = new AssertionExecutor(command, assertionTimeout, callsite);

        executor.once('start-assertion-retries', timeout => this.executeCommand(new serviceCommands.ShowAssertionRetriesStatusCommand(timeout) as unknown as CommandBase));
        executor.once('end-assertion-retries', success => this.executeCommand(new serviceCommands.HideAssertionRetriesStatusCommand(success) as unknown as CommandBase));

        return executor.run();
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
}

export default TestRunProxy;


