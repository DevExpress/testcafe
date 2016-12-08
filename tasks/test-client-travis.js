var gulp = require('gulp');
var qunitHarness = require('gulp-qunit-harness');
var config = require('./config.js');

gulp.task('test-client-travis', ['build'], testClientTravisTask);

function testClientTravisTask () {
    var saucelabsSettings = config.CLIENT_TESTS_SAUCELABS_SETTINGS;

    saucelabsSettings.browsers = config.CLIENT_TESTS_DESKTOP_BROWSERS;

    return gulp
        .src('test/client/fixtures/**/*-test.js')
        .pipe(qunitHarness(config.CLIENT_TESTS_SETTINGS, saucelabsSettings));
}
