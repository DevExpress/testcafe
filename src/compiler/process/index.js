import { spawn } from 'child_process';
import { join } from 'path';
import testRunTracker from '../../api/test-run-tracker';


export default class CompilerProcess {
    constructor (sources) {
        this.sources   = sources;
        this.cpPromise = null;
    }

    _getCP () {
        if (!this.cpPromise) {
            this.cpPromise = Promise
                .resolve(spawn(process.argv0, ['--inspect-brk', '-r', join(__dirname, 'child.js'), '-e', 'console.log(123)', '--', JSON.stringify(this.sources)], {stdio: ['inherit', 'inherit', 'inherit', 'ipc']}))
                .then(cp => {
                    cp.on('message', data => {
                        if (data.type !== 'execute-command')
                            return;

                        Object.values(testRunTracker.activeTestRuns)[0].executeCommand(data.command)
                            .then(result => cp.send({ result }));
                    });

                    return cp;
                });
        }

        return this.cpPromise;
    }

    async _sendMessage (msg) {
        const cp = await this._getCP();

        cp.send(msg);

        return await new Promise(r => {
            cp.on('message', data => { debugger; r(data)});
        });
    }

    static getSupportedTestFileExtensions () {
        return ['.js'];
    }

    async getTests () {
        const tests = await this._sendMessage({ name: 'getTests' });

        tests.forEach((test, idx) => test.fn = () => this.runTest(idx).then(({ result, error }) => {
            if (error)
                throw error;

            return result;
        }));

        return tests;
    }

    async runTest(idx) {
        return await this._sendMessage({ name: 'runTest', idx });
    }

    static cleanUp () {
        //
    }
}
