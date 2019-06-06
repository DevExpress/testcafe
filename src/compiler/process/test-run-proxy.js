import testRunTracker from '../../api/test-run-tracker';
import COMMAND_TYPE from "../../test-run/commands/type";
const serviceCommands             = require('../../test-run/commands/service');
const AssertionExecutor           = require('../../assertions/executor');


class TestRunMock {
    constructor (dispatcher, id, fixtureCtx) {
        this.dispatcher = dispatcher;

        this.id = id;

        this.testCtx    = Object.create(null);
        this.fixtureCtx = fixtureCtx;

        testRunTracker.activeTestRuns[id] = this;

        this.opts = {
            assertionTimeout: 10000
        };
    }

    async addRequestHooks (hooks) {
        return await this.dispatcher.addRequestHooks({ id: this.id, hooks });
    }

    async removeRequestHooks (hooks) {
        return await this.dispatcher.removeRequestHooks({ id: this.id, hooks });
    }

    async _executeAssertion (command, callsite) {
        const assertionTimeout = command.options.timeout === void 0 ? this.opts.assertionTimeout : command.options.timeout;
        const executor         = new AssertionExecutor(command, assertionTimeout, callsite);

        executor.once('start-assertion-retries', timeout => this.executeCommand(new serviceCommands.ShowAssertionRetriesStatusCommand(timeout)));
        executor.once('end-assertion-retries', success => this.executeCommand(new serviceCommands.HideAssertionRetriesStatusCommand(success)));

        return executor.run();
    }

    async useRole (role) {
        await this.dispatcher.useRole({ id: this.id, role });
    }

    async switchToCleanRun () {
        await this.dispatcher.transmitter.send('switch-to-clean-run', { id: this.id });
    }

    async getCurrentUrl () {
        return await this.dispatcher.transmitter.send('get-current-url', { id: this.id });
    }

    executeCommandSync (command) {
        return this.dispatcher.transmitter.sendSync('execute-command', { command, id: this.id });
    }

    async executeCommand (command, callsite) {
        console.log(command, this.id);

        if (command.type === COMMAND_TYPE.assertion)
            return this._executeAssertion(command, callsite);

        return await this.dispatcher.transmitter.send('execute-command', { command, id: this.id });
    }
}

export default TestRunMock;


