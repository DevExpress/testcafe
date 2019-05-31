import { spawnSync } from 'child_process';
import { join } from 'path';
import testRunTracker from '../../api/test-run-tracker';

class TestRunMock {
    constructor (id) {
        this.id = id;
        testRunTracker.activeTestRuns[id] = this;
    }

    executeCommandSync (command) {
        spawnSync(process.argv0, [join(__dirname, 'broker.js'), JSON.stringify(command)], { stdio: [0, 1, 2] });
    }

    switchToCleanRun () {

    }

    getCurrentUrl () {

    }

    executeCommand (command) {
        return new Promise(resolve => {
            process.send({ type: 'execute-command', command });
            process.once('message', ({ result }) => resolve(result));
        });

    }
}

export default TestRunMock;


