var os = require('os');

var isTravisEnvironment = !!process.env.TRAVIS;
var isCCNetEnvironment  = !!process.env.CCNET;
var hostname            = isTravisEnvironment ? os.hostname() : '127.0.0.1';

var browserProviderNames = {
    sauceLabs:    'sauceLabs',
    browserstack: 'browserstack'
};

var testingEnvironmentNames = {
    browserstackOSXDesktopAndMSEdgeBrowsers: 'browserstack-osx-desktop-and-ms-edge-browsers',
    saucelabsMobileBrowsers:                 'saucelabs-mobile-browsers',
    browserstackMobileBrowsers:              'browserstack-mobile-browsers',
    localBrowsers:                           'local-browsers',
    oldBrowsers:                             'old-browsers',
    legacy:                                  'legacy'
};

var testingEnvironments = {};

testingEnvironments[testingEnvironmentNames.browserstackOSXDesktopAndMSEdgeBrowsers] = {
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
            name:      'chrome',
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

testingEnvironments[testingEnvironmentNames.browserstackMobileBrowsers] = {
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
            device:    'Samsung Galaxy Tab 4 10.1',
            alias:     'android'
        },
        {
            os:        'ios',
            osVersion: '10.0',
            browser:   'Mobile Safari',
            device:    'iPad Pro (9.7 inch)',
            alias:     'ipad'
        },
        {
            os:        'ios',
            osVersion: '10.0',
            device:    'iPhone 7 Plus',
            browser:   'Mobile Safari',
            alias:     'iphone'
        },

    ]
};

testingEnvironments[testingEnvironmentNames.saucelabsMobileBrowsers] = {
    sauceLabs: {
        username:  process.env.SAUCE_USERNAME_FUNCTIONAL_MOBILE,
        accessKey: process.env.SAUCE_ACCESS_KEY_FUNCTIONAL_MOBILE,
        jobName:   'functional tests - mobile browsers'
    },

    browsers: [
        {
            platformName:    'Android',
            deviceName:      'Android Emulator',
            platformVersion: '5.1',
            browserName:     'Browser',
            alias:           'android'
        },
        {
            // NOTE: we can't run tests on iOS 9.3 because of a bug in this version
            // (see https://github.com/DevExpress/testcafe-hammerhead/issues/672#issuecomment-232043366).
            // This bug is fixed in iOS 9.3.2 but it's not available on the farm.
            platformName:    'iOS',
            deviceName:      'iPad Retina Simulator',
            platformVersion: '10.2',
            browserName:     'Safari',
            alias:           'ipad'
        },
        {
            platformName:    'iOS',
            deviceName:      'iPhone 7 Plus Simulator',
            platformVersion: '10.2',
            browserName:     'Safari',
            alias:           'iphone'
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
