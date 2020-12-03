const childProcess = require('child_process');

module.exports = function isDockerMachineExist (machineName) {
    try {
        childProcess.execSync('docker-machine status ' + machineName);
        return true;
    }
    catch (e) {
        return !e.message.match(/Host does not exist/);
    }
};
