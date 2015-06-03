var gulp = require('gulp'),
    nodeunit = require('gulp-nodeunit');

gulp.task('Nodeunit', function () {
    return gulp
        .src('test/nodeunit/**/*_test.js')
        .pipe(nodeunit());
});