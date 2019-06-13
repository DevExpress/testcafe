import { spawn } from 'child_process';
import { join } from 'path';
import testRunTracker from '../../api/test-run-tracker';
import RequestHookProxy from './request-hook-proxy';
import Transmitter from './transmitter';
import EE from '../../utils/async-event-emitter';
import { UseRoleCommand } from "../../test-run/commands/actions";
import { createRole } from '../../role';


process.on('uncaughtException', e => console.log(e));

process.on('unhandledRejection', e => console.log(e));

class ParentTransport extends EE {
    constructor (cp) {
        super();

        this.cp = cp;
    }
    read () {
        this.cp.stdio[4].on('data', data => {
            console.log('parent', data.toString())
            this.emit('data', data)
        });
    }

    async write (data, { syncChannel } = {}) {
        const channel = syncChannel ? 5 : 3;

        return new Promise((resolve, reject) => {
            this.cp.stdio[channel].write(data, error => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
}

export default class CompilerProcess {
    constructor () {
        this.cp = spawn(process.argv0, [join(__dirname, 'child.js')], {stdio: [0, 1, 2, 'pipe', 'pipe', 'pipe']});

        global.cp = this.cp;

        this.transmitter = new Transmitter(new ParentTransport(this.cp));

        this.transmitter.on('execute-command', data => {
            if (!testRunTracker.activeTestRuns[data.id])
                return;

            return testRunTracker
                .activeTestRuns[data.id]
                .executeCommand(data.command)
        });

        this.transmitter.on('use-role', data => {
            debugger;

            if (!testRunTracker.activeTestRuns[data.id])
                return;

            const testRun = testRunTracker
                .activeTestRuns[data.id];

            const command = new UseRoleCommand({
                role: createRole(
                    data.role.id,
                    data.role.loginPage,
                    data.role.initFn && (testRun => this.runTest(data.role.id, 'roles', testRun.id, 'initFn') ),
                    data.role.options
                )
            });

            debugger;

            return testRun
                .executeCommand(command)
        });

        this.transmitter.on('add-request-hooks', data => {
            if (!testRunTracker.activeTestRuns[data.id])
                return;

            const testRun = testRunTracker
                .activeTestRuns[data.id];

            data.hooks.forEach(hook => testRun.addRequestHook(new RequestHookProxy(this.transmitter, hook)));
        })

        this.transmitter.on('remove-request-hooks', data => {
            if (!testRunTracker.activeTestRuns[data.id])
                return;

            const testRun = testRunTracker
                .activeTestRuns[data.id];

            data.hooks.forEach(hook => {
                testRun.removeRequestHook(testRun.requestHooks[hook.id]);
            });
        })

    }

    async getTests (sources) {
        const tests = await this.transmitter.send('get-tests', sources);

        const fixtures = [];

        tests.forEach((test) => {
            if (!fixtures.some(fixture => fixture.id === test.fixture.id))
                fixtures.push(test.fixture);

            test.fn = (testRun) => this
                .runTest(test.id, 'tests', testRun.id, 'fn')

            if (test.beforeFn) {
                test.beforeFn = (testRun) => this
                    .runTest(test.id, 'tests', testRun.id, 'beforeFn')
            }

            if (test.afterFn) {
                test.afterFn = (testRun) => this
                    .runTest(test.id, 'tests', testRun.id, 'afterFn')
            }

            test.requestHooks = test.requestHooks.map(hook => new RequestHookProxy(this.transmitter, hook));
        });

        fixtures.forEach(fixture => {
            if (fixture.afterEachFn) {
                test.beforeEachFn = (testRun) => this
                    .runTest(fixture.id, 'fixtures', testRun.id, 'beforeEachFn')
            }

            if (fixture.beforeEachFn) {
                test.afterEachFn = (testRun) => this
                    .runTest(fixture.id, 'fixtures', testRun.id, 'afterEachFn')
            }

            if (fixture.afterFn) {
                test.beforeFn = () => this
                    .runTest(fixture.id, 'fixtures', null, 'beforeFn')
            }

            if (fixture.beforeFn) {
                test.afterFn = () => this
                    .runTest(fixture.id, 'fixtures', null, 'afterFn')
            }
        });

        return tests;
    }

    async runTest(idx, actor, testRunId, func) {
        return await this.transmitter.send('run-test', { idx, actor, func, testRunId });
    }

    async cleanUp () {
        await this.transmitter.send('clean-up');
    }

    async stop () {
        return await this.transmitter.send('exit');
    }
}
