const childProcess           = require('child_process');
const isDockerMachineExist   = require('./is-docker-machine-exists');
const isDockerMachineRunning = require('./is-docker-daemon-running');
const getDockerEnv           = require('./get-docker-env');
const { assignIn }           = require('lodash');

module.exports = function startDocker () {
    const dockerMachineName = process.env['DOCKER_MACHINE_NAME'] || 'default';

    if (!isDockerMachineExist(dockerMachineName))
        childProcess.execSync('docker-machine create -d virtualbox ' + dockerMachineName);

    if (!isDockerMachineRunning(dockerMachineName))
        childProcess.execSync('docker-machine start ' + dockerMachineName);

    const dockerEnv = getDockerEnv(dockerMachineName);

    assignIn(process.env, dockerEnv);
};

