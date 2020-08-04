const { execSync } = require('child_process');
const OS           = require('os-family');


const DOCKER_DAEMON_DETECTION_OPTIONS = {
    windows: {
        detectCommand:    'wmic process get Name /format:list',
        daemonNameRegExp: /Docker (for Windows|Desktop).exe/
    },

    linux: {
        detectCommand:    'ps -ejf | grep dockerd',
        daemonNameRegExp: /dockerd/
    }
};

const OS_NOT_SUPPORTED_ERROR = 'Cannot run docker tests with this OS';

function detectDockerDaemon ({ detectCommand, daemonNameRegExp }) {
    try {
        const processInfo = execSync(detectCommand).toString();

        return processInfo.match(daemonNameRegExp);
    }
    catch (e) {
        return false;
    }
}

module.exports = function () {
    if (OS.win)
        return detectDockerDaemon(DOCKER_DAEMON_DETECTION_OPTIONS.windows);

    if (OS.linux)
        return detectDockerDaemon(DOCKER_DAEMON_DETECTION_OPTIONS.linux);

    throw new Error(OS_NOT_SUPPORTED_ERROR);
};
