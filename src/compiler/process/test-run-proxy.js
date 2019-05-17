import { spawnSync } from 'child_process';
import { join } from 'path';
import testRunTracker from '../../api/test-run-tracker';

const testRunMock = {
    id: 'AAAAAA',

    executeCommand (command) {
        spawnSync(process.argv0, [join(__dirname, 'broker.js'), JSON.stringify(command)], { stdio: [0, 1, 2] });
    }
};

testRunTracker.activeTestRuns['AAAAAA'] = testRunMock;

export default testRunMock;


