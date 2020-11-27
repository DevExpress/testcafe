const childProcess = require('child_process');

module.exports = function getDockerEnv (machineName) {
    return childProcess
        .execSync('docker-machine env --shell bash ' + machineName)
        .toString()
        .split('\n')
        .map(line => {
            return line.match(/export\s*(.*)="(.*)"$/);
        })
        .filter(match => {
            return !!match;
        })
        .reduce((env, match) => {
            env[match[1]] = match[2];
            return env;
        }, {});
};

