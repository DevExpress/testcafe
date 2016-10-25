var gulp = require('gulp');
var qunitHarness = require('gulp-qunit-harness');
var config = require('./config.js');

gulp.task('test-client-old-browsers-travis', ['build'], testClientOldBrowsersTravisTask);

function testClientOldBrowsersTravisTask () {
    var saucelabsSettings = config.CLIENT_TESTS_SAUCELABS_SETTINGS;

    saucelabsSettings.browsers = config.CLIENT_TESTS_OLD_BROWSERS;

    return gulp
        .src('test/client/fixtures/**/*-test.js')
        .pipe(qunitHarness(config.CLIENT_TESTS_SETTINGS, saucelabsSettings));
}
