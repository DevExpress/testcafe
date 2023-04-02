const gulp           = require('gulp');
const mocha          = require('gulp-mocha-simple');
const { castArray }  = require('lodash');
const getTimeout     = require('./get-timeout');
const chai           = require('chai');

const {
    TESTS_GLOB,
    DEBUG_GLOB_1,
    SCREENSHOT_TESTS_GLOB,
} = require('../constants/functional-test-globs');

chai.use(require('chai-string'));

const RETRY_TEST_RUN_COUNT = 3;
const SETUP_TESTS_GLOB     = 'test/functional/setup.js';

function shouldAddTakeScreenshotTestGlob (glob) {
    return [TESTS_GLOB, DEBUG_GLOB_1].includes(glob);
}

module.exports = function testFunctional (src, testingEnvironmentName, { experimentalDebug, isProxyless } = {}) {
    process.env.TESTING_ENVIRONMENT       = testingEnvironmentName;
    process.env.BROWSERSTACK_USE_AUTOMATE = 1;

    if (experimentalDebug)
        process.env.EXPERIMENTAL_DEBUG = 'true';

    if (isProxyless)
        process.env.PROXYLESS = 'true';

    if (!process.env.BROWSERSTACK_NO_LOCAL)
        process.env.BROWSERSTACK_NO_LOCAL = 1;

    let tests = castArray(src);

    // TODO: Run takeScreenshot tests first because other tests heavily impact them
    if (shouldAddTakeScreenshotTestGlob(src))
        tests = SCREENSHOT_TESTS_GLOB.concat(tests);

    tests.unshift(SETUP_TESTS_GLOB);

    const opts = {
        reporter: 'mocha-reporter-spec-with-retries',
        timeout:  getTimeout(3 * 60 * 1000),
    };

    if (process.env.RETRY_FAILED_TESTS === 'true')
        opts.retries = RETRY_TEST_RUN_COUNT;

    return gulp
        .src(tests)
        .pipe(mocha(opts));
};
