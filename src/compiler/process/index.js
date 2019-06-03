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
            const cp = spawn(process.argv0, [join(__dirname, 'child.js'), JSON.stringify(this.sources)], {stdio: [0, 1, 2, 'pipe']});

            const proc = new EE();

            this.cp = cp;

            cp.stdio[3].on('data', data => {
                console.log('hehe', JSON.parse(data.toString()));
                proc.emit('message', JSON.parse(data.toString()))
            });

            proc.send = message => console.log('send', message) || cp.stdio[3].write(JSON.stringify(message));

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
                                .then(result => proc.send({result}));
                            case 'switch-to-clean-run': testRunTracker
                                .activeTestRuns[data.id]
                                .switchToCleanRun()
                                .then(result => proc.send({result}));
                            case 'get-current-url': testRunTracker
                                .activeTestRuns[data.id]
                                .getCurrentUrl()
                                .then(result => proc.send({result}));
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

        await new Promise(r => setTimeout(() => console.log('timeout') || r(), 10000));

        //cp.send(msg);

        return await new Promise(r => {
            cp.on('message', data => { console.log('data'); r(data)});
        });
    }

    static getSupportedTestFileExtensions () {
        return ['.js'];
    }

    async getTests () {
        const tests = await this._sendMessage({ name: 'getTests' });

        tests.forEach((test, idx) => test.fn = (testRun) => this.runTest(idx, testRun.id).then(({ result, error }) => {
            if (error)
                throw error;

            return result;
        }));

        return tests;
    }

    async runTest(idx, testRunId) {

        return await this._sendMessage({ name: 'runTest', idx, testRunId });
    }

    static cleanUp () {
        //
    }
}
