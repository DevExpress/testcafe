var gulp = require('gulp');
var nodeVer = require('node-version');

gulp.task('lint', lintTask);

function lintTask () {
    // TODO: eslint supports node version 4 or higher.
    // Remove this condition once we get rid of node 0.10 support.
    if (nodeVer.major === '0')
        return null;

    var eslint = require('gulp-eslint');

    return gulp
        .src([
            'examples/**/*.js',
            'src/**/*.js',
            'test/**/*.js',
            '!test/client/vendor/**/*.*',
            'Gulpfile.js',
            './tasks/*.js',
        ])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
}
