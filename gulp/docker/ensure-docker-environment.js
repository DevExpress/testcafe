const isDockerDaemonRunning = require('./is-docker-daemon-running');
const startDocker           = require('./start-docker');

module.exports = function ensureDockerEnvironment () {
    if (isDockerDaemonRunning())
        return;

    if (!process.env['DOCKER_HOST']) {
        try {
            startDocker();
        }
        catch (e) {
            throw new Error('Unable to initialize Docker environment. Use Docker terminal to run this task.\n' +
                e.stack);
        }
    }
};

