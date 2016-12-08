var gulp = require('gulp');

gulp.task('test-docs-travis', [
    'test-website-travis',
    'lint',
]);
