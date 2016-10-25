var gulp = require('gulp');

gulp.task('fast-build', [
    'server-scripts',
    'client-scripts',
    'styles',
    'images',
    'templates',
]);
