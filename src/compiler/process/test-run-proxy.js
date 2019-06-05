import { spawnSync } from 'child_process';
import { join } from 'path';
import testRunTracker from '../../api/test-run-tracker';
import COMMAND_TYPE from "../../test-run/commands/type";
const serviceCommands             = require('../../test-run/commands/service');
const AssertionExecutor           = require('../../assertions/executor');


class TestRunMock {
    constructor (id, fixtureCtx) {
        this.id = id;

        this.testCtx    = Object.create(null);
        this.fixtureCtx = fixtureCtx;

        testRunTracker.activeTestRuns[id] = this;

        this.opts = {
            assertionTimeout: 10000
        };
    }

    addRequestHooks (hooks) {
        proc.emit('message', { type: 'add-request-hooks', id: this.id, hooks });
    }

    async _executeAssertion (command, callsite) {
        const assertionTimeout = command.options.timeout === void 0 ? this.opts.assertionTimeout : command.options.timeout;
        const executor         = new AssertionExecutor(command, assertionTimeout, callsite);

        executor.once('start-assertion-retries', timeout => this.executeCommand(new serviceCommands.ShowAssertionRetriesStatusCommand(timeout)));
        executor.once('end-assertion-retries', success => this.executeCommand(new serviceCommands.HideAssertionRetriesStatusCommand(success)));

        return executor.run();
    }

    executeCommandSync (command) {
    }

    switchToCleanRun () {
        return new Promise(resolve => {
            proc.send({ type: 'switch-to-clean-run', id: this.id });
            proc.once('message', ({ result }) => resolve(result));
        });
    }

    getCurrentUrl () {
        return new Promise(resolve => {
            proc.send({ type: 'get-current-url', id: this.id });
            proc.once('message', ({ result }) => resolve(result));
        });
    }

    addRequestHook () {

    }

    executeCommand (command, callsite) {
        if (command.type === COMMAND_TYPE.assertion)
            return this._executeAssertion(command, callsite);

        return new Promise(resolve => {
            proc.send({ type: 'execute-command', command, id: this.id });
            proc.once('message', ({ result }) => resolve(result));
        });

    }
}

export default TestRunMock;


