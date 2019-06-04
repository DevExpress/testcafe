import { spawn } from 'child_process';
import { join } from 'path';
import testRunTracker from '../../api/test-run-tracker';
import EE from '../../utils/async-event-emitter';

process.on('uncaughtException', e => console.log(e));

process.on('unhandledRejection', e => console.log(e));

export default class CompilerProcess {
    constructor (sources) {
        this.sources   = sources;
        this.cpPromise = null;
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
                            case 'add-request-hook':
                                return testRunTracker
                                    .activeTestRuns[data.id]
                                    .addRequestHook
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

        tests.forEach((test, idx) => {
            test.fn = (testRun) => this
                .runTest(idx, testRun.id)
                .then(({ result, error }) => {
                    if (error)
                        throw error;

                    return result;
                });

            if (test.requestHooks.length) {
                test.requestHooks.forEach(hook => {
                    hook.onRequest = event => this._sendMessage({ name: 'on-request', id: hook.id, event });
                    hook.onResponse = event => this._sendMessage({ name: 'on-response', id: hook.id, event });
                    hook._onConfigureResponse = event => this._sendMessage({ name: 'on-configure-response', id: hook.id, event });
                });
            }
        });

        return tests;
    }

    async runTest(idx, testRunId) {
        return await this._sendMessage({ name: 'runTest', idx, testRunId });
    }

    static cleanUp () {
        //
    }
}
