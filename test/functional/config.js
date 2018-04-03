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
            alias:     'safari'
        },
        {
            os:        'OS X',
            osVersion: 'Sierra',
            name:      'chrome',
            alias:     'chrome-osx'
        },
        {
            os:        'OS X',
            osVersion: 'Sierra',
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
            osVersion:  '7.1',
            device:     'Google Pixel',
            name:       'Android',
            alias:      'android'
        },
        {
            os:        'ios',
            osVersion: '10.0',
            device:    'iPad Pro (9.7 inch)',
            name:      'Mobile Safari',
            alias:     'ipad'
        },
        {
            os:        'ios',
            osVersion: '10.0',
            device:    'iPhone 7 Plus',
            name:      'Mobile Safari',
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
