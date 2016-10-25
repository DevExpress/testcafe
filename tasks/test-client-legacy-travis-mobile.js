var gulp = require('gulp');
var qunitHarness = require('gulp-qunit-harness');
var config = require('./config.js');

gulp.task('test-client-legacy-travis-mobile', ['build'], testClientLegacyTravisMobileTask);

function testClientLegacyTravisMobileTask () {
    var saucelabsSettings = config.CLIENT_TESTS_SAUCELABS_SETTINGS;

    saucelabsSettings.browsers = config.CLIENT_TESTS_MOBILE_BROWSERS;

    return gulp
        .src('test/client/legacy-fixtures/**/*-test.js')
        .pipe(qunitHarness(config.CLIENT_TESTS_LEGACY_SETTINGS, saucelabsSettings));
}
