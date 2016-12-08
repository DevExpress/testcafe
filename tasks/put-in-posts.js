var gulp = require('gulp');

gulp.task('put-in-posts', ['fetch-assets-repo'], putInPostsTask);

function putInPostsTask () {
    return gulp
        .src('docs/articles/blog/**/*')
        .pipe(gulp.dest('site/src/_posts'));
}
