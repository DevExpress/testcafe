var gulp = require('gulp');
var filter = require('gulp-filter');
var webmake = require('gulp-webmake');
var babel = require('babel-core');
var path = require('path');
var gulpif = require('gulp-if');
var util = require('gulp-util');
var uglify = require('gulp-uglify');

gulp.task('client-scripts-bundle', ['clean'], clientScriptsBundleTask);

function clientScriptsBundleTask () {
    var filterBrowserIdlePage = filter('browser/idle-page/index.js', { restore: true });

    return gulp
        .src([
            'src/client/core/index.js',
            'src/client/driver/index.js',
            'src/client/ui/index.js',
            'src/client/automation/index.js',
            'src/client/browser/idle-page/index.js'
        ], { base: 'src' })
        .pipe(webmake({
            sourceMap: false,
            transform: function (filename, code) {
                var transformed = babel.transform(code, {
                    sourceMap: false,
                    ast:       false,
                    filename:  filename,

                    // NOTE: force usage of client .babelrc for all
                    // files, regardless of their location
                    babelrc: false,
                    extends: path.join(__dirname, './src/client/.babelrc')
                });

                // HACK: babel-plugin-transform-es2015-modules-commonjs forces
                // 'use strict' insertion. We need to remove it manually because
                // of https://github.com/DevExpress/testcafe/issues/258
                return { code: transformed.code.replace(/^('|")use strict('|");?/, '') };
            }
        }))
        .pipe(filterBrowserIdlePage)
        .pipe(gulpif(!util.env.dev, uglify()))
        .pipe(filterBrowserIdlePage.restore)
        .pipe(gulp.dest('lib'));
}
