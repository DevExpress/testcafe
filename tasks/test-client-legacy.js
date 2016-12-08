var gulp = require('gulp');
var qunitHarness = require('gulp-qunit-harness');
var config = require('./config.js');

gulp.task('test-client-legacy', ['build'], testClientLegacyTask);

function testClientLegacyTask () {
    return gulp
        .src('test/client/legacy-fixtures/**/*-test.js')
        .pipe(qunitHarness(config.CLIENT_TESTS_LEGACY_SETTINGS));
}
