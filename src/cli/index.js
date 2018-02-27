import path from 'path';
import { spawn } from 'child_process';
import semver from 'semver';
import resolveCwd from 'resolve-cwd';
import log from './log';
import TerminationHandler from './termination-handler';


const SAFE_VERSION = '0.19.0-alpha2';

function getLocalInstallation () {
    const local = resolveCwd('testcafe/lib/cli');

    if (local && local !== __filename) {
        log.write('Using locally installed version of TestCafe.');
        return local;
    }

    return '';
}

function isNewProcessNeeded () {
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

    const parentPkgInfo = require(path.join(parentPackagePath, 'package.json'));

    return semver.lt(parentPkgInfo.version, SAFE_VERSION);
}

function startCli (cliPath, newProcess) {
    if (!newProcess) {
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
    const needNewProcess = isNewProcessNeeded();
    const cliPath        = getLocalInstallation() || require.resolve('./cli');

    return startCli(cliPath, needNewProcess);
})();
