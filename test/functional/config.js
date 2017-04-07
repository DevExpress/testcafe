var os = require('os');

var isTravisEnvironment = !!process.env.TRAVIS;
var isCCNetEnvironment  = !!process.env.CCNET;
var hostname            = isTravisEnvironment ? os.hostname() : '127.0.0.1';

var browserProviderNames = {
    sauceLabs:    'sauceLabs',
    browserstack: 'browserstack'
};

var testingEnvironmentNames = {
    saucelabsOSXDesktopAndMSEdgeBrowsers: 'saucelabs-osx-desktop-and-ms-edge-browsers',
    saucelabsMobileBrowsers:              'saucelabs-mobile-browsers',
    localBrowsers:                        'local-browsers',
    oldBrowsers:                          'old-browsers',
    legacy:                               'legacy'
};

var testingEnvironments = {};

testingEnvironments[testingEnvironmentNames.saucelabsOSXDesktopAndMSEdgeBrowsers] = {
    jobName: 'functional tests - OS X desktop and MS edge browsers',

    sauceLabs: {
        username:  process.env.SAUCE_USERNAME_FUNCTIONAL_DESKTOP,
        accessKey: process.env.SAUCE_ACCESS_KEY_FUNCTIONAL_DESKTOP
    },

    browsers: [
        {
            platform:    'OS X 10.11',
            browserName: 'safari',
            version:     '9.0',
            alias:       'safari'
        },
        {
            platform:    'OS X 10.11',
            browserName: 'chrome',
            alias:       'chrome-osx'
        },
        {
            platform:    'OS X 10.11',
            browserName: 'firefox',
            alias:       'firefox-osx'
        },
        {
            platform:    'Windows 10',
            browserName: 'microsoftedge',
            alias:       'edge',
            version:     '13.10586'
        }
    ]
};

testingEnvironments[testingEnvironmentNames.saucelabsMobileBrowsers] = {
    jobName: 'functional tests - mobile browsers',

    sauceLabs: {
        username:  process.env.SAUCE_USERNAME_FUNCTIONAL_MOBILE,
        accessKey: process.env.SAUCE_ACCESS_KEY_FUNCTIONAL_MOBILE
    },

    browserstack: {
        username:  process.env.BROWSER_STACK_USERNAME,
        accessKey: process.env.BROWSER_STACK_ACCESS_KEY
    },

    browsers: [
        {
            os:        'android',
            osVersion: '4.4',
            browser:   'Android Browser',
            device:    'Samsung Galaxy Tab 4 10.1',
            alias:     'android'
        },
        {
            os:        'ios',
            osVersion: '9.3',
            browser:   'Mobile Safari',
            device:    'iPad Pro',
            alias:     'ipad'
        },
        {
            os:        'ios',
            osVersion: '10.0',
            device:    'iPhone 7 Plus',
            browser:   'Mobile Safari',
            alias:     'iphone'
        }
    ]
};

testingEnvironments[testingEnvironmentNames.localBrowsers] = {
    browsers: [
        {
            platform:    'Windows 10',
            browserName: 'chrome',
            alias:       'chrome'
        },
        {
            platform:    'Windows 10',
            browserName: 'internet explorer',
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
    jobName: 'functional tests - legacy',

    sauceLabs: {
        username:  process.env.SAUCE_USERNAME_FUNCTIONAL_DESKTOP,
        accessKey: process.env.SAUCE_ACCESS_KEY_FUNCTIONAL_DESKTOP
    },

    browsers: [
        {
            platform:    'Windows 10',
            browserName: 'chrome',
            alias:       'chrome'
        },
        {
            platform:    'Windows 10',
            browserName: 'internet explorer',
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


module.exports = {
    useLocalBrowsers: !isTravisEnvironment && !isCCNetEnvironment,

    testingEnvironmentNames: testingEnvironmentNames,
    testingEnvironments:     testingEnvironments,
    browserProviderNames:    browserProviderNames,

    testCafe: {
        hostname: hostname,
        port1:    2000,
        port2:    2001
    },

    site: {
        viewsPath: './test/functional/',
        port1:     3000,
        port2:     3001,
        port3:     3002,
        port4:     3003
    },

    browsers: []
};
