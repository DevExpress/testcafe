const { noop }         = require('lodash');
const { EventEmitter } = require('events');

const browserConnectionGatewayMock = {
    startServingConnection:   noop,
    stopServingConnection:    noop,
    initialize:               noop,
    switchToNativeAutomation: noop,
    getConnections:           () => ({}),

    proxy: {
        resolveRelativeServiceUrl: noop,
        start:                     noop,
        switchToNativeAutomation:  noop,
    },
};

class BrowserSetMock extends EventEmitter {
    constructor () {
        super();

        this.browserConnectionGroups = [];
    }

    async dispose () {}
}

const configurationMock = {
    getOption:         noop,
    calculateHostname: noop,
    mergeOptions:      noop,

    startOptions: {
        hostname: 'localhost',
        port1:    1337,
        port2:    1338,
    },
};

function createBrowserProviderMock ({ local, headless } = { local: false, headless: false }) {
    return {
        openBrowser:       async () => {},
        closeBrowser:      async () => {},
        isLocalBrowser:    () => local,
        isHeadlessBrowser: () => headless,
    };
}

module.exports = {
    browserConnectionGatewayMock,
    browserSetMock: new BrowserSetMock(),
    configurationMock,
    createBrowserProviderMock,
};
