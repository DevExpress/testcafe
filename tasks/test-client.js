var gulp = require('gulp');
var qunitHarness = require('gulp-qunit-harness');
var config = require('./config.js');

gulp.task('test-client', ['build'], testClientTask);

function testClientTask () {
    return gulp
        .src('test/client/fixtures/**/*-test.js')
        .pipe(qunitHarness(config.CLIENT_TESTS_SETTINGS));
}
