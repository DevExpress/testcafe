import resolveCwd from 'resolve-cwd';
import log from './log';


function getLocalInstallation () {
    const local = resolveCwd('testcafe/lib/cli');

    if (local && local !== __filename) {
        log.write('Using locally installed version of TestCafe.');
        return local;
    }

    return '';
}

(function loader () {
    const cliPath = getLocalInstallation() || require.resolve('./cli');

    require(cliPath);
})();
