var gulp   = require('gulp');
var babel  = require('gulp-babel');
var less   = require('gulp-less');
var eslint = require('gulp-eslint');
var mocha  = require('gulp-mocha');
var del    = require('del');
var merge  = require('merge-stream');

gulp.task('clean', function (cb) {
    del('lib', cb);
});

gulp.task('build', ['clean'], function () {
    var js = gulp
        .src('src/**/*.js')
        .pipe(babel());

    var styles = gulp
        .src('src/**/*.less')
        .pipe(less());

    var templates = gulp
        .src('src/**/*.mustache');

    var images = gulp
        .src('src/**/*.png');

    return merge(js, styles, templates, images)
        .pipe(gulp.dest('lib'));
});

gulp.task('lint', function () {
    return gulp
        .src([
            'src/**/*.js',
            'test/**/*.js',
            'Gulpfile.js'
        ])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('test-server', ['build'], function () {
    return gulp
        .src('test/server/**/*-test.js')
        .pipe(mocha({
            ui:       'bdd',
            reporter: 'spec',
            timeout:  typeof v8debug === 'undefined' ? 2000 : Infinity // NOTE: disable timeouts in debug
        }));
});

gulp.task('test', ['lint', 'test-server']);
