var gulp = require('gulp');
var del = require('del');

gulp.task('clean', cleanTask);

function cleanTask () {
    return del('lib');
}
