const Promise = require('pinkie');
const qrCode  = require('qrcode-terminal');


module.exports = class RemoteConnector {
    connect () {
        return Promise.resolve();
    }

    waitForFreeMachines () {
        return Promise.resolve();
    }

    startBrowser (settings, url) {
        console.log('Connection URL:', url); //eslint-disable-line no-console

        if (settings.qrCode)
            qrCode.generate(url);

        return Promise.resolve();
    }

    stopBrowser () {
        return Promise.resolve();
    }

    disconnect () {
        return Promise.resolve();
    }
};
