const { assignIn } = require('lodash');

const CLIENT_TEST_LOCAL_BROWSERS_ALIASES = ['ie', 'edge', 'chrome', 'firefox', 'safari'];

const CLIENT_TESTS_PATH        = 'test/client/fixtures';
const CLIENT_TESTS_LEGACY_PATH = 'test/client/legacy-fixtures';

const CLIENT_TESTS_SETTINGS_BASE = {
    port:            2000,
    crossDomainPort: 2001,

    scripts: [
        { src: '/async.js', path: 'test/client/vendor/async.js' },
        { src: '/hammerhead.js', path: 'node_modules/testcafe-hammerhead/lib/client/hammerhead.min.js' },
        { src: '/core.js', path: 'lib/client/core/index.min.js' },
        { src: '/ui.js', path: 'lib/client/ui/index.min.js' },
        { src: '/automation.js', path: 'lib/client/automation/index.min.js' },
        { src: '/driver.js', path: 'lib/client/driver/index.js' },
        { src: '/legacy-runner.js', path: 'node_modules/testcafe-legacy-api/lib/client/index.js' },
        { src: '/before-test.js', path: 'test/client/before-test.js' }
    ],

    configApp: require('../../test/client/config-qunit-server-app')
};

const CLIENT_TESTS_SETTINGS        = assignIn({}, CLIENT_TESTS_SETTINGS_BASE, { basePath: CLIENT_TESTS_PATH });
const CLIENT_TESTS_LOCAL_SETTINGS  = assignIn({}, CLIENT_TESTS_SETTINGS);
const CLIENT_TESTS_LEGACY_SETTINGS = assignIn({}, CLIENT_TESTS_SETTINGS_BASE, { basePath: CLIENT_TESTS_LEGACY_PATH });

const CLIENT_TESTS_DESKTOP_BROWSERS = [
    {
        platform:    'Windows 10',
        browserName: 'microsoftedge'
    },
    {
        platform:    'Windows 10',
        browserName: 'chrome'
    },
    {
        platform:    'Windows 10',
        browserName: 'firefox'
    },
    {
        platform:    'Windows 10',
        browserName: 'internet explorer',
        version:     '11.0'
    },
    {
        platform:    'macOS 10.13',
        browserName: 'safari',
        version:     '11.1'
    },
    {
        platform:    'OS X 10.11',
        browserName: 'chrome'
    },
    {
        platform:    'OS X 10.11',
        browserName: 'firefox'
    }
];

const CLIENT_TESTS_MOBILE_BROWSERS = [
    {
        platform:    'Linux',
        browserName: 'android',
        version:     '6.0',
        deviceName:  'Android Emulator'
    },
    {
        platform:    'iOS',
        browserName: 'Safari',
        // NOTE: https://github.com/DevExpress/testcafe/issues/471
        // problem with extra scroll reproduced only on saucelabs
        // virtual machines with ios device emulators
        version:     '10.3',
        deviceName:  'iPhone 7 Plus Simulator'
    }
];

const CLIENT_TESTS_SAUCELABS_SETTINGS = {
    username:  process.env.SAUCE_USERNAME,
    accessKey: process.env.SAUCE_ACCESS_KEY,
    build:     process.env.TRAVIS_BUILD_ID || '',
    tags:      [process.env.TRAVIS_BRANCH || 'master'],
    name:      'testcafe client tests',
    timeout:   720
};

module.exports = {
    CLIENT_TEST_LOCAL_BROWSERS_ALIASES,
    CLIENT_TESTS_SETTINGS,
    CLIENT_TESTS_LOCAL_SETTINGS,
    CLIENT_TESTS_LEGACY_SETTINGS,
    CLIENT_TESTS_SAUCELABS_SETTINGS,
    CLIENT_TESTS_DESKTOP_BROWSERS,
    CLIENT_TESTS_MOBILE_BROWSERS
};
