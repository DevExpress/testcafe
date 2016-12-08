var gulp = require('gulp');
var config = require('./config.js');

gulp.task('build-website-production', ['prepare-website'], buildWebsiteProductionTask);

function buildWebsiteProductionTask (cb) {
    config.buildWebsite('production', cb);
}
