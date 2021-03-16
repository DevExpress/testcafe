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


class TestRunProxy {
    public readonly id: string;
    public readonly controller: TestController;
    public readonly observedCallsites: ObservedCallsitesStorage;
    public readonly warningLog: WarningLog;

    private readonly dispatcher: TestRunDispatcherProtocol;
    private readonly fixtureCtx: unknown;
    private readonly ctx: unknown;
    private readonly _options: Dictionary<OptionValue>;

    public constructor (dispatcher: TestRunDispatcherProtocol, id: string, fixtureCtx: unknown, options: Dictionary<OptionValue>) {
        this.dispatcher = dispatcher;

        this.id = id;

        this.ctx        = Object.create(null);
        this.fixtureCtx = fixtureCtx;
        this._options   = options;

        // TODO: Synchronize these properties with their real counterparts in the main process.
        // Postponed until (GH-3244). See details in (GH-5250).
        this.controller =        new TestController(this);
        this.observedCallsites = new ObservedCallsitesStorage();
        this.warningLog =        new WarningLog();

        testRunTracker.activeTestRuns[id] = this;
    }

    private _getAssertionTimeout (command: AssertionCommand): number {
        // @ts-ignore
        const { timeout: commandTimeout } = command.options;

        return commandTimeout === void 0
            ? this._options.assertionTimeout
            : commandTimeout;
    }

    private async _executeAssertion (command: AssertionCommand, callsite: unknown): Promise<unknown> {
        const assertionTimeout = this._getAssertionTimeout(command);

        const executor = new AssertionExecutor(command, assertionTimeout, callsite);

        executor.once('start-assertion-retries', timeout => this.executeCommand(new serviceCommands.ShowAssertionRetriesStatusCommand(timeout)));
        executor.once('end-assertion-retries', success => this.executeCommand(new serviceCommands.HideAssertionRetriesStatusCommand(success)));

        return executor.run();
    }

    public async executeAction (apiMethodName: string, command: unknown, callsite: unknown): Promise<unknown> {
        if (callsite)
            callsite = prerenderCallsite(callsite);

        if ((command as CommandBase).type === COMMAND_TYPE.assertion)
            return this._executeAssertion(command as AssertionCommand, callsite);

        return this.dispatcher.executeAction({ apiMethodName, command, callsite, id: this.id });
    }

    public async executeCommand (command: unknown): Promise<unknown> {
        return this.dispatcher.executeCommand({ command, id: this.id });
    }
}

export default TestRunProxy;


