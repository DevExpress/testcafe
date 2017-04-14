var os = require('os');

var isTravisEnvironment = !!process.env.TRAVIS;
var isCCNetEnvironment  = !!process.env.CCNET;
var hostname            = isTravisEnvironment ? os.hostname() : '127.0.0.1';

var browserProviderNames = {
    sauceLabs:    'sauceLabs',
    browserstack: 'browserstack'
};

var testingEnvironmentNames = {
    osXDesktopAndMSEdgeBrowsers: 'osx-desktop-and-ms-edge-browsers',
    mobileBrowsers:              'mobile-browsers',
    localBrowsers:               'local-browsers',
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
            osVersion: 'Sierra',
            name:      'safari',
            version:   '10.0',
            alias:     'safari'
        },
        {
            os:        'OS X',
            osVersion: 'Sierra',
            name:      'chrome',
            version:   '57.0',
            alias:     'chrome-osx'
        },
        {
            os:        'OS X',
            osVersion: 'Sierra',
            name:      'firefox',
            version:   '52.0',
            alias:     'firefox-osx'
        },
        {
            os:        'Windows',
            osVersion: '10',
            name:      'edge',
            version:   '13.0',
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
            os:        'android',
            osVersion: '4.4',
            browser:   'Android Browser',
            device:    'Samsung Galaxy S5',
            name:      'Samsung Galaxy S5',
            alias:     'android'
        },
        {
            os:        'ios',
            osVersion: '10.0',
            browser:   'Mobile Safari',
            device:    'iPad Pro (9.7 inch)',
            name:      'iPad Pro (9.7 inch)',
            alias:     'ipad'
        },
        {
            os:        'ios',
            osVersion: '10.0',
            device:    'iPhone 7 Plus',
            browser:   'Mobile Safari',
            name:      'iPhone 7 Plus',
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
