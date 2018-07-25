var os = require('os');

var isTravisEnvironment = !!process.env.TRAVIS || !!process.env.SEMAPHORE || !!process.env.GITLAB_CI;
var hostname            = isTravisEnvironment ? os.hostname() : '127.0.0.1';

var browserProviderNames = {
    sauceLabs:    'sauceLabs',
    browserstack: 'browserstack'
};

var testingEnvironmentNames = {
    osXDesktopAndMSEdgeBrowsers: 'osx-desktop-and-ms-edge-browsers',
    mobileBrowsers:              'mobile-browsers',
    localBrowsersIE:             'local-browsers-ie',
    localBrowsersChromeFirefox:  'local-browsers-chrome-firefox',
    localBrowsers:               'local-browsers',
    localHeadlessBrowsers:       'local-headless-browsers',
    oldBrowsers:                 'old-browsers',
    legacy:                      'legacy'
};

var testingEnvironments = {};

testingEnvironments[testingEnvironmentNames.osXDesktopAndMSEdgeBrowsers] = {
    jobName: 'functional tests - OS X desktop and MS edge browsers',

    browserstack: {
        username:  process.env.BROWSER_STACK_USERNAME,
        accessKey: process.env.BROWSER_STACK_ACCESS_KEY
    },

    browsers: [
        {
            os:        'OS X',
            osVersion: 'High Sierra',
            name:      'safari',
            alias:     'safari'
        },
        {
            os:        'OS X',
            osVersion: 'High Sierra',
            name:      'chrome',
            alias:     'chrome-osx'
        },
        {
            os:        'OS X',
            osVersion: 'High Sierra',
            name:      'firefox',
            alias:     'firefox-osx'
        },
        {
            os:        'Windows',
            osVersion: '10',
            name:      'edge',
            alias:     'edge',
        }
    ]
};

testingEnvironments[testingEnvironmentNames.mobileBrowsers] = {
    jobName: 'functional tests - mobile browsers',

    browserstack: {
        username:  process.env.BROWSER_STACK_USERNAME,
        accessKey: process.env.BROWSER_STACK_ACCESS_KEY
    },

    browsers: [
        {
            realMobile: true,
            os:         'android',
            osVersion:  '8.0',
            device:     'Google Pixel',
            name:       'Android',
            alias:      'android'
        },
        {
            realMobile: true,
            os:         'ios',
            osVersion:  '11.2',
            device:     'iPad Pro',
            name:       'Mobile Safari',
            alias:      'ipad'
        },
        {
            realMobile: true,
            os:         'ios',
            osVersion:  '10.3',
            device:     'iPhone 7 Plus',
            name:       'Mobile Safari',
            alias:      'iphone'
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
    isLocalBrowsers:    true,
    isHeadlessBrowsers: true,

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

testingEnvironments[testingEnvironmentNames.localHeadlessBrowsers] = {
    isLocalBrowsers: true,

    browsers: [
        {
            platform:    'Windows 10',
            browserName: 'chrome:headless --no-sandbox',
            userAgent:   'headlesschrome',
            alias:       'chrome'
        },
        {
            platform:    'Windows 10',
            browserName: 'firefox:headless:disableMultiprocessing=true',
            alias:       'firefox'
        }
    ]
};

testingEnvironments[testingEnvironmentNames.oldBrowsers] = {
    jobName: 'functional tests - ms desktop browsers',

    sauceLabs: {
        username:  process.env.SAUCE_USERNAME_FUNCTIONAL_DESKTOP,
        accessKey: process.env.SAUCE_ACCESS_KEY_FUNCTIONAL_DESKTOP,

    },

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

    isTravisEnvironment,

    testingEnvironmentNames,
    testingEnvironments,
    browserProviderNames,

    testCafe: {
        hostname: hostname,
        port1:    2000,
        port2:    2001
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

    browserstackConnectorServicePort: 4000,

    browsers: []
};
