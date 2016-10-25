var gulp = require('gulp');
var config = require('./config.js');

gulp.task('build-website', ['prepare-website'], buildWebsiteTask);

function buildWebsiteTask (cb) {
    config.buildWebsite('', cb);
}
