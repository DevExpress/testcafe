const gulp                                   = require('gulp');
const qunitHarness                           = require('gulp-qunit-harness');
const { getInstallations: listBrowsers }     = require('testcafe-browser-tools');
const { CLIENT_TEST_LOCAL_BROWSERS_ALIASES } = require('../constants/client-test-settings');

function runTests (env, runOpts, tests, settings) {
    return gulp
        .src(tests)
        .pipe(qunitHarness(settings, env, runOpts));
}

module.exports = function testClient (tests, settings, envSettings, cliMode) {
    if (!cliMode)
        return runTests(envSettings, settings, tests);

    return listBrowsers().then(browsers => {
        const browserNames   = Object.keys(browsers);
        const targetBrowsers = [];

        browserNames.forEach(browserName => {
            if (CLIENT_TEST_LOCAL_BROWSERS_ALIASES.includes(browserName))
                targetBrowsers.push({ browserInfo: browsers[browserName], browserName: browserName });
        });

        return runTests({ browsers: targetBrowsers }, { cliMode: true }, tests, settings);
    });
};
