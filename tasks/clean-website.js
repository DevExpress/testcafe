var gulp = require('gulp');
var del = require('del');

gulp.task('clean-website', cleanWebsiteTask);

function cleanWebsiteTask () {
    return del('site');
}
