var gulp = require('gulp');

gulp.task('prepare-website', [
    'put-in-articles',
    'put-in-navigation',
    'put-in-posts',
    'lint-docs',
]);
