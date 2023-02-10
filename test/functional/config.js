const hostname = process.env.USE_PUBLIC_HOSTNAME ? process.env.HOSTNAME : '127.0.0.1';

const browserProviderNames = {
    sauceLabs:    'sauceLabs',
    browserstack: 'browserstack',
    remote:       'remote',
    safari:       'safari',
};

const testingEnvironmentNames = {
    osXDesktopAndMSEdgeBrowsers: 'osx-desktop-and-ms-edge-browsers',
    mobileBrowsers:              'mobile-browsers',
    localBrowsersIE:             'local-browsers-ie',
    localBrowsersChromeFirefox:  'local-browsers-chrome-firefox',
    localBrowsers:               'local-browsers',
    localChrome:                 'local-chrome',
    localSafari:                 'local-safari',
    localHeadlessChrome:         'local-headless-chrome',
    localHeadlessFirefox:        'local-headless-firefox',
    remote:                      'remote',
    legacy:                      'legacy',
};

const testingEnvironments = {};

testingEnvironments[testingEnvironmentNames.osXDesktopAndMSEdgeBrowsers] = {
    jobName:  'functional tests - OS X desktop and MS edge browsers',
    provider: browserProviderNames.browserstack,

    browserstack: {
        username:  process.env.BROWSER_STACK_USERNAME,
        accessKey: process.env.BROWSER_STACK_ACCESS_KEY,
    },

    browsers: [
        {
            browserName: 'browserstack:edge:OS X Monterey',
            alias:       'edge',
        },
    ],
};

testingEnvironments[testingEnvironmentNames.mobileBrowsers] = {
    jobName:  'functional tests - mobile browsers',
    provider: browserProviderNames.browserstack,

    browserstack: {
        username:  process.env.BROWSER_STACK_USERNAME,
        accessKey: process.env.BROWSER_STACK_ACCESS_KEY,
    },

    browsers: [
        {
            browserName: 'browserstack:iPad 9th@15',
            alias:       'ipad',
        },
        {
            browserName: 'browserstack:iPhone 13 Pro@15',
            alias:       'iphone',
        },
    ],
};

testingEnvironments[testingEnvironmentNames.localBrowsers] = {
    isLocalBrowsers: true,

    browsers: [
        {
            platform:    'Windows 10',
            browserName: 'chrome',
            alias:       'chrome',
        },
        {
            platform:    'Windows 10',
            browserName: 'ie',
            version:     '11.0',
            alias:       'ie',
        },
        {
            platform:    'Windows 10',
            browserName: 'firefox',
            alias:       'firefox',
        },
    ],
};

testingEnvironments[testingEnvironmentNames.localChrome] = {
    isLocalBrowsers: true,

    browsers: [
        {
            platform:    'Windows 10',
            browserName: 'chrome',
            alias:       'chrome',
        },
    ],
};

testingEnvironments[testingEnvironmentNames.localBrowsersChromeFirefox] = {
    isLocalBrowsers: true,

    browsers: [
        {
            platform:    'Windows 10',
            browserName: 'chrome',
            alias:       'chrome',
        },
        {
            platform:    'Windows 10',
            browserName: 'firefox',
            alias:       'firefox',
        },
    ],
};

testingEnvironments[testingEnvironmentNames.localHeadlessChrome] = {
    isLocalBrowsers:    true,
    isHeadlessBrowsers: true,

    retryTestPages: true,

    browsers: [
        {
            platform:    'Windows 10',
            browserName: 'chrome:headless --no-sandbox',
            userAgent:   'headlesschrome',
            alias:       'chrome',
        },
    ],
};

testingEnvironments[testingEnvironmentNames.localSafari] = {
    remote:   true,
    provider: browserProviderNames.safari,

    safari: {},

    browsers: [
        {
            browserName: 'safari',
            userAgent:   'safari',
            alias:       'safari',
        },
    ],
};

testingEnvironments[testingEnvironmentNames.localHeadlessFirefox] = {
    isLocalBrowsers:    true,
    isHeadlessBrowsers: true,

    retryTestPages: true,

    browsers: [
        {
            platform:    'Windows 10',
            browserName: 'firefox:headless:disableMultiprocessing=true',
            alias:       'firefox',
        },
    ],
};

testingEnvironments[testingEnvironmentNames.remote] = {
    remote:   true,
    provider: browserProviderNames.remote,

    browsers: [{
        get qrCode () {
            return !!process.env.QR_CODE;
        },

        get alias () {
            return process.env.BROWSER_ALIAS || 'chrome';
        },
    }],
};

testingEnvironments[testingEnvironmentNames.legacy] = {
    isLocalBrowsers:    true,
    isHeadlessBrowsers: true,

    browsers: [
        {
            platform:    'Windows 10',
            browserName: 'chrome:headless --no-sandbox',
            userAgent:   'headlesschrome',
            alias:       'chrome',
        },
    ],
};

module.exports = {
    get currentEnvironmentName () {
        return process.env.TESTING_ENVIRONMENT || this.testingEnvironmentNames.localBrowsers;
    },

    get currentEnvironment () {
        return this.testingEnvironments[this.currentEnvironmentName];
    },

    get isLegacyEnvironment () {
        return this.currentEnvironmentName === this.testingEnvironmentNames.legacy;
    },

    get useLocalBrowsers () {
        return this.currentEnvironment.isLocalBrowsers;
    },

    get useHeadlessBrowsers () {
        return this.currentEnvironment.isHeadlessBrowsers;
    },

    get devMode () {
        return process.env.DEV_MODE === 'true';
    },

    get proxyless () {
        return process.env.PROXYLESS === 'true';
    },

    get retryTestPages () {
        return this.currentEnvironment.retryTestPages;
    },

    get experimentalDebug () {
        return !!process.env.EXPERIMENTAL_DEBUG;
    },

    testingEnvironmentNames,
    testingEnvironments,
    browserProviderNames,

    testCafe: {
        hostname: hostname,
        port1:    9000,
        port2:    9001,
    },

    site: {
        viewsPath: './test/functional/',
        ports:     {
            server1:                3000,
            server2:                3001,
            basicAuthServer:        3002,
            ntlmAuthServer:         3003,
            trustedProxyServer:     3004,
            transparentProxyServer: 3005,
        },
    },

    browserstackConnectorServicePort: 9200,

    browsers: [],

    testScreenshotsDir: '___test-screenshots___',
    testVideosDir:      '___test-videos___',

    hasBrowser (alias) {
        return this.currentEnvironment.browsers.some(browser => browser.alias.includes(alias));
    },

    get experimentalESM () {
        return !!process.env.NODE_OPTIONS && process.env.NODE_OPTIONS.includes('--experimental-loader');
    },
};
