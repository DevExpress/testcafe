const { exec } = require('child_process');
const debug    = require('debug');


const DEBUG = debug('testcafe:test:functional:safari-connector');

module.exports = class SafariConnector {
    connect () {
        return Promise.resolve();
    }

    waitForFreeMachines () {
        return Promise.resolve();
    }

    startBrowser (settings, url) {
        exec(`open -a /Applications/Safari.app ${url}`, (...args) => DEBUG(args));

        return Promise.resolve();
    }

    stopBrowser () {
        return Promise.resolve();
    }

    disconnect () {
        return Promise.resolve();
    }
};
