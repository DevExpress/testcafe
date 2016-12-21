var os = require('os');

var isTravisEnvironment = !!process.env.TRAVIS;
var isCCNetEnvironment  = !!process.env.CCNET;
var hostname            = isTravisEnvironment ? os.hostname() : '127.0.0.1';

var testingEnvironmentNames = {
    saucelabsOSXDesktopAndMSEdgeBrowsers: 'saucelabs-osx-desktop-and-ms-edge-browsers',
    saucelabsMobileBrowsers:              'saucelabs-mobile-browsers',
    localBrowsers:                        'local-browsers',
    oldBrowsers:                          'old-browsers',
    legacy:                               'legacy'
};

var testingEnvironments = {};

testingEnvironments[testingEnvironmentNames.saucelabsOSXDesktopAndMSEdgeBrowsers] = {
    sauceLabs: {
        username:  process.env.SAUCE_USERNAME_FUNCTIONAL_DESKTOP,
        accessKey: process.env.SAUCE_ACCESS_KEY_FUNCTIONAL_DESKTOP,
        jobName:   'functional tests - OS X desktop and MS edge browsers'
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
            alias:       'edge'
        }
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
            deviceName:      'iPad Retina',
            platformVersion: '9.2',
            browserName:     'Safari',
            alias:           'ipad'
        },
        {
            platformName:    'iOS',
            deviceName:      'iPhone 6 Plus',
            platformVersion: '9.2',
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
    sauceLabs: {
        username:  process.env.SAUCE_USERNAME_FUNCTIONAL_DESKTOP,
        accessKey: process.env.SAUCE_ACCESS_KEY_FUNCTIONAL_DESKTOP,
        jobName:   'functional tests - ms desktop browsers'
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
    sauceLabs: {
        username:  process.env.SAUCE_USERNAME_FUNCTIONAL_DESKTOP,
        accessKey: process.env.SAUCE_ACCESS_KEY_FUNCTIONAL_DESKTOP,
        jobName:   'functional tests - legacy'
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
