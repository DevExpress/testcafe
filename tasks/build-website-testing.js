var gulp = require('gulp');
var config = require('./config.js');

gulp.task('build-website-testing', ['prepare-website'], buildWebsiteTestingTask);

function buildWebsiteTestingTask (cb) {
    config.buildWebsite('testing', cb);
}
