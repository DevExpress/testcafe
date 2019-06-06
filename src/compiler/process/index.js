import { spawn } from 'child_process';
import { join } from 'path';
import testRunTracker from '../../api/test-run-tracker';
import RequestHookProxy from './request-hook-proxy';
import Transmitter from './transmitter';
import EE from '../../utils/async-event-emitter';


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

    async write (data) {
        return new Promise((resolve, reject) => {
            this.cp.stdio[3].write(data, error => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
}

export default class CompilerProcess {
    constructor (sources) {
        this.sources   = sources;
        this.cpPromise = null;

        global.compiler = this;
    }

    _getCP () {
        if (!this.cpPromise) {
            const cp = spawn(process.argv0, ['--inspect-brk', join(__dirname, 'child.js'), JSON.stringify(this.sources)], {stdio: [0, 1, 2, 'pipe', 'pipe']});

            const transmitter = new Transmitter(new ParentTransport(cp));


            this.cpPromise = Promise
                .resolve()
                .then(cp => {
                    transmitter.on('execute-command', data => {
                        if (!testRunTracker.activeTestRuns[data.id])
                            return;

                        return testRunTracker
                            .activeTestRuns[data.id]
                            .executeCommand(data.command)
                    })
                    transmitter.on('switch-to-clean-run', data => {
                        if (!testRunTracker.activeTestRuns[data.id])
                            return;

                        return testRunTracker
                            .activeTestRuns[data.id]
                            .switchToCleanRun()
                    })
                    transmitter.on('get-current-url', data => {
                        if (!testRunTracker.activeTestRuns[data.id])
                            return;

                        return testRunTracker
                            .activeTestRuns[data.id]
                            .getCurrentUrl()
                    })
                    transmitter.on('add-request-hooks', data => {
                        if (!testRunTracker.activeTestRuns[data.id])
                            return;

                        const testRun = testRunTracker
                            .activeTestRuns[data.id];

                        data.hooks.forEach(hook => testRun.addRequestHook(new RequestHookProxy(this.transmitter, hook)));
                    })
                    
                    transmitter.on('remove-request-hooks', data => {
                        if (!testRunTracker.activeTestRuns[data.id])
                            return;

                        const testRun = testRunTracker
                            .activeTestRuns[data.id];

                        data.hooks.forEach(hook => {
                            testRun.removeRequestHook(testRun.requestHooks[hook.id]);
                        });
                    })

                    return proc;
                });
        }

        return this.cpPromise;
    }

    async _sendMessage (name, args) {
        const cp = await this._getCP();


        return await cp.send(name, args);
    }

    static getSupportedTestFileExtensions () {
        return ['.js'];
    }

    async getTests () {
        const tests = await this._sendMessage('get-tests');

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

            test.requestHooks = test.requestHooks.map(hook => new RequestHookProxy(hook));
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
        return await this._sendMessage('run-test', { idx, actor, func, testRunId });
    }

    static cleanUp () {
        //
    }
}
