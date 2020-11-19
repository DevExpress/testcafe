const childProcess = require('child_process');

module.exports = function isDockerMachineRunning (machineName) {
    try {
        return childProcess.execSync('docker-machine status ' + machineName).toString().match(/Running/);
    }
    catch (e) {
        return false;
    }
};
