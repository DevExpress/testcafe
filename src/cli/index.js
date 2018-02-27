import path from 'path';
import { spawn } from 'child_process';
import semver from 'semver';
import resolveCwd from 'resolve-cwd';
import log from './log';
import TerminationHandler from './termination-handler';


// NOTE: Older TestCafe versions will import stack-chain module in a process, even if a different locally installed
// TestCafe will be actually used. It can result in a stack-chain version conflict, because only the one version of
// stack-chain can be loaded in a process. So we need to start CLI in a new process, when an old globally installed
// TestCafe version is detected. See the stack-chain code for more information about the isssue:
// https://github.com/AndreasMadsen/stack-chain/blob/001f69e35ecd070c68209d13c4325fe5d23fc136/index.js#L10
const MINIMAL_TESTCAFE_VERSION_WITH_SAFE_STACK_CHAIN_IN_PROCESS_LOADING = '0.19.0-alpha2';

function getLocalInstallation () {
    const local = resolveCwd('testcafe/lib/cli');

    if (local && local !== __filename) {
        log.write('Using locally installed version of TestCafe.');
        return local;
    }

    return '';
}

function shouldRunInNewProcess () {
    if (!module.parent)
        return false;

    const parentModulePath = path.dirname(module.parent.filename);
    const parentModuleDir  = path.basename(parentModulePath);

    let parentPackagePath = '';

    if (parentModuleDir.match(/^cli$/i))
        parentPackagePath = path.dirname(path.dirname(parentModulePath));
    else if (parentModuleDir.match(/^bin$/i))
        parentPackagePath = path.dirname(parentModulePath);
    else
        return false;

    if (parentPackagePath === path.join(__dirname, '../..'))
        return false;

    try {
        const parentPkgInfo = require(path.join(parentPackagePath, 'package.json'));

        return semver.lt(parentPkgInfo.version, MINIMAL_TESTCAFE_VERSION_WITH_SAFE_STACK_CHAIN_IN_PROCESS_LOADING);
    }
    catch (e) {
        return false;
    }
}

function startCli (cliPath, inNewProcess) {
    if (!inNewProcess) {
        require(cliPath);
        return;
    }

    process.argv[1] = cliPath;

    const terminationHandler = new TerminationHandler();

    const childCli = spawn(process.argv.shift(), process.argv, {
        stdio: [process.stdin, process.stdout, process.stderr, 'ipc']
    });

    terminationHandler.on(TerminationHandler.TERMINATION_LEVEL_INCREASED_EVENT, () => childCli.send('shutdown'));

    childCli.on('exit', code => process.exit(code));
}

(async function loader () {
    const inNewProcess = shouldRunInNewProcess();
    const cliPath      = getLocalInstallation() || require.resolve('./cli');

    return startCli(cliPath, inNewProcess);
})();
