var gulp = require('gulp');

gulp.task('put-in-navigation', ['fetch-assets-repo'], putInNavigationTask);

function putInNavigationTask () {
    return gulp
        .src('docs/nav/**/*')
        .pipe(gulp.dest('site/src/_data'));
}
