var gulp = require('gulp');
var qunitHarness = require('gulp-qunit-harness');
var config = require('./config.js');

gulp.task('test-client-travis-mobile', ['build'], testClientTravisMobileTask);

function testClientTravisMobileTask () {
    var saucelabsSettings = config.CLIENT_TESTS_SAUCELABS_SETTINGS;

    saucelabsSettings.browsers = config.CLIENT_TESTS_MOBILE_BROWSERS;

    return gulp
        .src('test/client/fixtures/**/*-test.js')
        .pipe(qunitHarness(config.CLIENT_TESTS_SETTINGS, saucelabsSettings));
}
