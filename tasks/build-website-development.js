var gulp = require('gulp');
var config = require('./config.js');

gulp.task('build-website-development', ['prepare-website'], buildWebsiteEevelopmentTask);

function buildWebsiteEevelopmentTask (cb) {
    config.buildWebsite('development', cb);
}
