const os = require('os');

const isTravisEnvironment = !!process.env.TRAVIS;
const hostname            = isTravisEnvironment ? os.hostname() : '127.0.0.1';

const browserProviderNames = {
    sauceLabs:    'sauceLabs',
    browserstack: 'browserstack',
    remote:       'remote'
};

const testingEnvironmentNames = {
    osXDesktopAndMSEdgeBrowsers: 'osx-desktop-and-ms-edge-browsers',
    mobileBrowsers:              'mobile-browsers',
    localBrowsersIE:             'local-browsers-ie',
    localBrowsersChromeFirefox:  'local-browsers-chrome-firefox',
    localBrowsers:               'local-browsers',
    localHeadlessChrome:         'local-headless-chrome',
    localHeadlessFirefox:        'local-headless-firefox',
    remote:                      'remote',
    oldBrowsers:                 'old-browsers',
    legacy:                      'legacy'
};

const testingEnvironments = {};

testingEnvironments[testingEnvironmentNames.osXDesktopAndMSEdgeBrowsers] = {
    jobName: 'functional tests - OS X desktop and MS edge browsers',

    browserstack: {
        username:  process.env.BROWSER_STACK_USERNAME,
        accessKey: process.env.BROWSER_STACK_ACCESS_KEY
    },

    retryTestPages: true,

    browsers: [
        {
            browserName: 'browserstack:safari@11.1:OS X High Sierra',
            alias:       'safari'
        },
        {
            browserName: 'browserstack:chrome@71:OS X High Sierra',
            alias:       'chrome-osx'
        },
        {
            browserName: 'browserstack:firefox@64:OS X High Sierra',
            alias:       'firefox-osx'
        }
    ]
};

testingEnvironments[testingEnvironmentNames.mobileBrowsers] = {
    jobName: 'functional tests - mobile browsers',

    browserstack: {
        username:  process.env.BROWSER_STACK_USERNAME,
        accessKey: process.env.BROWSER_STACK_ACCESS_KEY
    },

    retryTestPages: true,

    browsers: [
        {
            browserName: 'browserstack:iPad Pro 12.9 2017@11',
            alias:       'ipad'
        },
        {
            browserName: 'browserstack:iPhone 7 Plus@10',
            alias:       'iphone'
        }
    ]
};

testingEnvironments[testingEnvironmentNames.localBrowsers] = {
    isLocalBrowsers: true,

    browsers: [
        {
            platform:    'Windows 10',
            browserName: 'chrome',
            alias:       'chrome'
        },
        {
            platform:    'Windows 10',
            browserName: 'ie',
            version:     '11.0',
            alias:       'ie'
        },
        {
            platform:    'Windows 10',
            browserName: 'firefox',
            alias:       'firefox'
        }
    ]
};

testingEnvironments[testingEnvironmentNames.localBrowsersIE] = {
    isLocalBrowsers: true,

    retryTestPages: true,

    browsers: [
        {
            platform:    'Windows 10',
            browserName: 'ie',
            version:     '11.0',
            alias:       'ie'
        }
    ]
};

testingEnvironments[testingEnvironmentNames.localBrowsersChromeFirefox] = {
    isLocalBrowsers: true,

    browsers: [
        {
            platform:    'Windows 10',
            browserName: 'chrome',
            alias:       'chrome'
        },
        {
            platform:    'Windows 10',
            browserName: 'firefox',
            alias:       'firefox'
        }
    ]
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
            alias:       'chrome'
        }
    ]
};

testingEnvironments[testingEnvironmentNames.localHeadlessFirefox] = {
    isLocalBrowsers:    true,
    isHeadlessBrowsers: true,

    retryTestPages: true,

    browsers: [
        {
            platform:    'Windows 10',
            browserName: 'firefox:headless:disableMultiprocessing=true',
            alias:       'firefox'
        }
    ]
};

testingEnvironments[testingEnvironmentNames.remote] = {
    remote: true,

    browsers: [{
        get qrCode () {
            return !!process.env.QR_CODE;
        },

        get alias () {
            return process.env.BROWSER_ALIAS || 'chrome';
        }
    }]
};

testingEnvironments[testingEnvironmentNames.oldBrowsers] = {
    jobName: 'functional tests - ms desktop browsers',

    sauceLabs: {
        username:  process.env.SAUCE_USERNAME_FUNCTIONAL_DESKTOP,
        accessKey: process.env.SAUCE_ACCESS_KEY_FUNCTIONAL_DESKTOP,

    },

    retryTestPages: true,

    browsers: [
        {
            platform:    'Windows 8',
            browserName: 'internet explorer',
            version:     '10.0',
            alias:       'ie 10'
        },
        {
            platform:    'Windows 7',
            browserName: 'internet explorer',
            version:     '9.0',
            alias:       'ie 9'
        }
    ]
};

testingEnvironments[testingEnvironmentNames.legacy] = {
    isLocalBrowsers:    true,
    isHeadlessBrowsers: true,

    browsers: [
        {
            platform:    'Windows 10',
            browserName: 'chrome:headless --no-sandbox',
            userAgent:   'headlesschrome',
            alias:       'chrome'
        }
    ]
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
        return !!process.env.DEV_MODE;
    },

    get retryTestPages () {
        return this.currentEnvironment.retryTestPages;
    },

    isTravisEnvironment,

    testingEnvironmentNames,
    testingEnvironments,
    browserProviderNames,

    testCafe: {
        hostname: hostname,
        port1:    9000,
        port2:    9001
    },

    site: {
        viewsPath: './test/functional/',
        ports:     {
            server1:                3000,
            server2:                3001,
            basicAuthServer:        3002,
            ntlmAuthServer:         3003,
            trustedProxyServer:     3004,
            transparentProxyServer: 3005
        }
    },

    browserstackConnectorServicePort: 9200,

    browsers: [],

    testScreenshotsDir: '___test-screenshots___',
    testVideosDir:      '___test-videos___'
};
