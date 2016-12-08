var gulp = require('gulp');
var less = require('gulp-less');

gulp.task('styles', ['clean'], stylesTask);

function stylesTask () {
    return gulp
        .src('src/**/*.less')
        .pipe(less())
        .pipe(gulp.dest('lib'));
}
