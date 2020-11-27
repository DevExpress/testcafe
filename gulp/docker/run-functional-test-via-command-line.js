const tmp          = require('tmp');
const copy         = require('recursive-copy');
const path         = require('path');
const childProcess = require('child_process');
const os           = require('os');
const osFamily     = require('os-family');

function correctPathOnWindows (tmpDir) {
    const modifiedTmpDirSegments = tmpDir.split(path.sep);
    const userNameTmpDirPart     = modifiedTmpDirSegments[2];

    if (userNameTmpDirPart.includes('~')) {
        // NOTE: Docker cannot resolve paths with `~` symbol on Windows operation system
        const userInfo = os.userInfo();

        modifiedTmpDirSegments[2] = userInfo.username;
    }

    return modifiedTmpDirSegments.join(path.posix.sep);
}

function setAccessPrivileges (dir) {
    const cmd = `chmod -R 777 ${dir}`;

    childProcess.execSync(cmd, { stdio: 'inherit', env: process.env });
}

module.exports = function runFunctionalTestViaCommandLine (publishRepository, packageInfo) {
    tmp.setGracefulCleanup();

    const tmpDir   = tmp.dirSync();
    const testsDir = path.join(__dirname, '../../test/docker/testcafe-fixtures');

    return copy(testsDir, tmpDir.name).then(() => {
        const resultTmpDirPath = osFamily.win ? correctPathOnWindows(tmpDir.name) : tmpDir.name;

        if (osFamily.linux)
            setAccessPrivileges(resultTmpDirPath);

        const cmd = `docker run -i -v ${resultTmpDirPath}:/tests -w /tests ${publishRepository}:${packageInfo.version} chromium:headless basic-test.js`;

        childProcess.execSync(cmd, { stdio: 'inherit', env: process.env });
    });
};

