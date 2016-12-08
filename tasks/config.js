var websiteServer = null;

var assignIn = require('lodash').assignIn;

var CLIENT_TESTS_SETTINGS_BASE = {
    port:            2000,
    crossDomainPort: 2001,

    scripts: [
        { src: '/async.js', path: 'test/client/vendor/async.js' },
        { src: '/hammerhead.js', path: 'node_modules/testcafe-hammerhead/lib/client/hammerhead.js' },
        { src: '/core.js', path: 'lib/client/core/index.js' },
        { src: '/ui.js', path: 'lib/client/ui/index.js' },
        { src: '/automation.js', path: 'lib/client/automation/index.js' },
        { src: '/legacy-runner.js', path: 'node_modules/testcafe-legacy-api/lib/client/index.js' },
        { src: '/before-test.js', path: 'test/client/before-test.js' }
    ],

    configApp: require('../test/client/config-qunit-server-app')
};
var CLIENT_TESTS_PATH = 'test/client/fixtures';
var CLIENT_TESTS_LEGACY_PATH = 'test/client/legacy-fixtures';

var CLIENT_TESTS_SAUCELABS_SETTINGS = {
    username:  process.env.SAUCE_USERNAME,
    accessKey: process.env.SAUCE_ACCESS_KEY,
    build:     process.env.TRAVIS_BUILD_ID || '',
    tags:      [process.env.TRAVIS_BRANCH || 'master'],
    name:      'testcafe client tests',
    timeout:   720
};

var CLIENT_TESTS_DESKTOP_BROWSERS = [
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
        platform:    'OS X 10.11',
        browserName: 'safari',
        version:     '9.0'
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

var CLIENT_TESTS_OLD_BROWSERS = [
    {
        platform:    'Windows 8',
        browserName: 'internet explorer',
        version:     '10.0'
    },
    {
        platform:    'Windows 7',
        browserName: 'internet explorer',
        version:     '9.0'
    }
];

var CLIENT_TESTS_MOBILE_BROWSERS = [
    {
        platform:    'Linux',
        browserName: 'android',
        version:     '5.1',
        deviceName:  'Android Emulator'
    },
    {
        platform:    'OS X 10.10',
        browserName: 'iphone',
        version:     '8.1',
        deviceName:  'iPad Simulator'
    },
    {
        platform:    'iOS',
        browserName: 'Safari',
        // NOTE: https://github.com/DevExpress/testcafe/issues/471
        // problem with extra scroll reproduced only on saucelabs
        // virtual machines with ios device emulators
        version:     '9.3',
        deviceName:  'iPhone 6 Plus'
    }
];


function buildWebsite (mode, cb) {
    var spawn = require('cross-spawn');
    // NOTE: we have three website build configurations.
    //
    // * production - used when the website is built for publishing. Gulp task 'build-website-production'.
    // * development - used when the website is built for local deployment. Gulp task 'build-website-development'.
    // * testing - used when the website is built for testing. Gulp task 'build-website-testing'.
    //
    // This is how they affect the website.
    //
    // * Blog comments.
    //   - Do not appear in testing mode.
    //   - In development mode, comments from an internal 'staging' thread are displayed.
    //   - In production mode, public comment threads are displayed.
    // * Google Analytics is enabled in production mode only.
    var options = mode ? { stdio: 'inherit', env: { JEKYLL_ENV: mode } } : { stdio: 'inherit' };

    spawn('jekyll', ['build', '--source', 'site/src/', '--destination', 'site/deploy'], options)
        .on('exit', cb);
}

function testWebsite (isTravis) {
    var Promise = require('pinkie');
    var runSequence = require('run-sequence');

    return new Promise(function (resolve) {
        var buildTask = isTravis ? 'build-website' : 'build-website-testing';

        runSequence(buildTask, 'serve-website', resolve);
    })
        .then(function () {
            var WebsiteTester = require('../test/website/test.js');
            var websiteTester = new WebsiteTester();

            return websiteTester.checkLinks();
        })
        .then(function (failed) {
            return new Promise(function (resolve, reject) {
                websiteServer.close(function () {
                    if (failed)
                        reject('Broken links found!');
                    else
                        resolve();
                });
            });
        });
}

function testFunctional (fixturesDir, testingEnvironmentName) {
    process.env.TESTING_ENVIRONMENT = testingEnvironmentName;
    var gulp = require('gulp');
    var mocha = require('gulp-mocha');

    return gulp
        .src(['test/functional/setup.js', fixturesDir + '/**/test.js'])
        .pipe(mocha({
            ui:       'bdd',
            reporter: 'spec',
            timeout:  typeof v8debug === 'undefined' ? 30000 : Infinity // NOTE: disable timeouts in debug
        }));
}


module.exports = {
    CLIENT_TESTS_SETTINGS:           assignIn({}, CLIENT_TESTS_SETTINGS_BASE, { basePath: CLIENT_TESTS_PATH }),
    CLIENT_TESTS_LEGACY_SETTINGS:    assignIn({}, CLIENT_TESTS_SETTINGS_BASE, { basePath: CLIENT_TESTS_LEGACY_PATH }),
    CLIENT_TESTS_SAUCELABS_SETTINGS: CLIENT_TESTS_SAUCELABS_SETTINGS,
    CLIENT_TESTS_DESKTOP_BROWSERS:   CLIENT_TESTS_DESKTOP_BROWSERS,
    CLIENT_TESTS_OLD_BROWSERS:       CLIENT_TESTS_OLD_BROWSERS,
    CLIENT_TESTS_MOBILE_BROWSERS:    CLIENT_TESTS_MOBILE_BROWSERS,
    buildWebsite:                    buildWebsite,
    testWebsite:                     testWebsite,
    websiteServer:                   websiteServer,
    testFunctional:                  testFunctional,
};
