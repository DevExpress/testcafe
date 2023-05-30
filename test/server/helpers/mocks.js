const { noop }         = require('lodash');
const { EventEmitter } = require('events');

const proxyMock = {
    resolveRelativeServiceUrl: noop,
    start:                     noop,
    switchToNativeAutomation:  noop,
    GET:                       noop,
    POST:                      noop,
};

const browserConnectionGatewayMock = {
    startServingConnection:   noop,
    stopServingConnection:    noop,
    initialize:               noop,
    switchToNativeAutomation: noop,
    getConnections:           () => ({}),
    proxy:                    proxyMock,
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

    mergeOptions (options) {
        this._mergedOptions = options;
    },

    clear () {
        delete this._mergedOptions;
    },

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
    proxyMock,
};
