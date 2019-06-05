import { spawn } from 'child_process';
import { join } from 'path';
import testRunTracker from '../../api/test-run-tracker';
import RequestHookProxy from './request-hook-proxy';
import EE from '../../utils/async-event-emitter';


process.on('uncaughtException', e => console.log(e));

process.on('unhandledRejection', e => console.log(e));

export default class CompilerProcess {
    constructor (sources) {
        this.sources   = sources;
        this.cpPromise = null;

        global.compiler = this;
    }

    _getCP () {
        if (!this.cpPromise) {
            const cp = spawn(process.argv0, ['--inspect-brk', join(__dirname, 'child.js'), JSON.stringify(this.sources)], {stdio: [0, 1, 2, 'pipe', 'pipe']});

            const proc = new EE();

            this.cp = cp;

            cp.stdio[4].on('data', data => {
                try {
                    console.log('serv recv', data.toString());
                    proc.emit('message', JSON.parse(data.toString()))
                } catch (e) {

                }
            });

            proc.send = message => {
                console.log('serv sent', message);
                cp.stdio[3].write(JSON.stringify(message));
            }

            this.cpPromise = Promise
                .resolve()
                .then(cp => {
                    proc.on('message', data => {
                        if (!testRunTracker.activeTestRuns[data.id])
                            return;

                        switch (data.type) {
                            case 'execute-command':
                                return testRunTracker
                                .activeTestRuns[data.id]
                                .executeCommand(data.command)
                                .then(result => {
                                    console.log(data.command);
                                    console.log(result);
                                    proc.send({result})
                                });
                            case 'switch-to-clean-run':
                                return testRunTracker
                                .activeTestRuns[data.id]
                                .switchToCleanRun()
                                .then(result => proc.send({result}));
                            case 'get-current-url':
                                return testRunTracker
                                .activeTestRuns[data.id]
                                .getCurrentUrl()
                                .then(result => proc.send({result}));
                            case 'add-request-hooks':
                                const testRun = testRunTracker
                                    .activeTestRuns[data.id];

                                data.hooks.forEach(hook => testRun.addRequestHook(new RequestHookProxy(hook)));

                                return;
                            default:
                                return;
                        }
                    });

                    return proc;
                });
        }

        return this.cpPromise;
    }

    async _sendMessage (msg) {
        const cp = await this._getCP();

        cp.send(msg);

        return await new Promise(r => {
            cp.on('message', data => {
                if (data.name === msg.name)
                    r(data)
            });
        });
    }

    static getSupportedTestFileExtensions () {
        return ['.js'];
    }

    async getTests () {
        const { tests } = await this._sendMessage({ name: 'getTests' });

        const fixtures = [];

        tests.forEach((test, idx) => {
            if (!fixtures.some(fixture => fixture.id === test.fixture.id))
                fixtures.push(test.fixture);

            test.fn = (testRun) => this
                .runTest(idx, 'test', testRun.id, 'fn')
                .then(({ result, error }) => {
                    if (error)
                        throw error;

                    return result;
                });

            if (test.beforeFn) {
                test.beforeFn = (testRun) => this
                    .runTest(idx, 'test', testRun.id, 'beforeFn')
                    .then(({ result, error }) => {
                        if (error)
                            throw error;

                        return result;
                    });
            }

            if (test.afterFn) {
                test.afterFn = (testRun) => this
                    .runTest(idx, 'test', testRun.id, 'afterFn')
                    .then(({ result, error }) => {
                        if (error)
                            throw error;

                        return result;
                    });
            }

            test.requestHooks = test.requestHooks.map(hook => new RequestHookProxy(hook));
        });

        fixtures.forEach(fixture => {
            if (fixture.afterEachFn) {
                test.beforeEachFn = (testRun) => this
                    .runTest(fixture.id, 'fixture', testRun.id, 'beforeEachFn')
                    .then(({ result, error }) => {
                        if (error)
                            throw error;

                        return result;
                    });
            }

            if (fixture.beforeEachFn) {
                test.afterEachFn = (testRun) => this
                    .runTest(fixture.id, 'fixture', testRun.id, 'afterEachFn')
                    .then(({ result, error }) => {
                        if (error)
                            throw error;

                        return result;
                    });
            }

            if (fixture.afterFn) {
                test.beforeFn = () => this
                    .runTest(fixture.id, 'fixture', null, 'beforeFn')
                    .then(({ result, error }) => {
                        if (error)
                            throw error;

                        return result;
                    });
            }

            if (fixture.beforeFn) {
                test.afterFn = () => this
                    .runTest(fixture.id, 'fixture', null, 'afterFn')
                    .then(({ result, error }) => {
                        if (error)
                            throw error;

                        return result;
                    });
            }
        });

        return tests;
    }

    async runTest(idx, actor, testRunId, func) {
        return await this._sendMessage({ name: 'runTest', idx, actor, func, testRunId });
    }

    static cleanUp () {
        //
    }
}
