var gulp = require('gulp');

gulp.task('put-in-articles', ['fetch-assets-repo'], putInArticlesTask);

function putInArticlesTask () {
    return gulp
        .src(['docs/articles/**/*', '!docs/articles/blog/**/*'])
        .pipe(gulp.dest('site/src'));
}
