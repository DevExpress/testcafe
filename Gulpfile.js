var argv         = require('yargs').argv;
var babel        = require('babel');
var gulp         = require('gulp');
var gulpBabel    = require('gulp-babel');
var gulpLess     = require('gulp-less');
var eslint       = require('gulp-eslint');
var qunitHarness = require('gulp-qunit-harness');
var mocha        = require('gulp-mocha');
var mustache     = require('gulp-mustache');
var rename       = require('gulp-rename');
var webmake      = require('gulp-webmake');
var del          = require('del');
var fs           = require('fs');
var merge        = require('merge-stream');
var path         = require('path');
var Promise      = require('es6-promise').Promise;


var CLIENT_TESTS_SETTINGS = {
    basePath:        './test/client/fixtures',
    port:            2000,
    crossDomainPort: 2001,

    scripts: [
        { src: '/async.js', path: './test/client/vendor/async.js' },
        { src: '/hammerhead.js', path: './node_modules/testcafe-hammerhead/lib/client/hammerhead.js' },
        { src: '/core.js', path: './lib/client/core/index.js' },
        { src: '/ui.js', path: './lib/client/ui/index.js' },
        { src: '/runner.js', path: './lib/client/runner/index.js' },
        { src: '/before-test.js', path: './test/client/before-test.js' }
    ],

    configApp: require('./test/client/config-qunit-server-app')
};

var CLIENT_TESTS_BROWSERS = [
    {
        platform:    'Windows 10',
        browserName: 'microsoftedge'
    },
    {
        platform:    'Windows 10',
        browserName: 'chrome'
    },
    {
        platform:    'Windows 10',
        browserName: 'firefox'
    },
    {
        platform:    'Windows 10',
        browserName: 'internet explorer',
        version:     '11.0'
    },
    {
        platform:    'Windows 8',
        browserName: 'internet explorer',
        version:     '10.0'
    },
    {
        platform:    'Windows 7',
        browserName: 'internet explorer',
        version:     '9.0'
    }
];

var SAUCELABS_SETTINGS = {
    username:  process.env.SAUCE_USERNAME,
    accessKey: process.env.SAUCE_ACCESS_KEY,
    build:     process.env.TRAVIS_JOB_ID || '',
    tags:      [process.env.TRAVIS_BRANCH || 'master'],
    browsers:  CLIENT_TESTS_BROWSERS,
    name:      'testcafe client tests',
    timeout:   720
};


gulp.task('clean', function (cb) {
    del('lib', cb);
});


//Scripts
function wrapScriptWithTemplate (templatePath, scriptPath) {
    return gulp
        .src(templatePath)
        .pipe(mustache({
            source:    fs.readFileSync(scriptPath).toString(),
            sourceMap: ''
        }))
        .pipe(rename(path.basename(scriptPath)))
        .pipe(gulp.dest(path.dirname(scriptPath)));
}

gulp.task('wrap-scripts-with-templates', ['build-client-scripts'], function () {
    var scripts = [
        { templatePath: './src/client/core/index.js.wrapper.mustache', scriptPath: './lib/client/core/index.js' },
        { templatePath: './src/client/ui/index.js.wrapper.mustache', scriptPath: './lib/client/ui/index.js' },
        { templatePath: './src/client/runner/index.js.wrapper.mustache', scriptPath: './lib/client/runner/index.js' }
    ];

    return Promise.all(scripts.map(function (item) {
        return wrapScriptWithTemplate(item.templatePath, item.scriptPath);
    }));
});

gulp.task('build-client-scripts', ['clean'], function () {
    return gulp
        .src([
            'src/client/core/index.js',
            'src/client/ui/index.js',
            'src/client/runner/index.js',
            'src/client/browser/idle-page/index.js'
        ], { base: 'src/client' })
        .pipe(webmake({
            sourceMap: false,
            transform: function (filename, code) {
                //https://github.com/jakearchibald/es6-promise/issues/108
                if (filename.indexOf('es6-promise.js') !== -1) {
                    var polyfillCallString = 'lib$es6$promise$polyfill$$default();';

                    code = code.replace(polyfillCallString, '');
                }
                ///////////////////////////////////////////////////////////////

                var transformed = babel.transform(code, {
                    sourceMap: false,
                    filename:  filename
                });

                return {
                    code:      transformed.code,
                    sourceMap: transformed.map
                };
            }
        }))
        .pipe(gulp.dest('lib/client'));
});


//Build
gulp.task('build', ['lint', 'wrap-scripts-with-templates'], function () {
    var js = gulp
        .src([
            'src/**/*.js',
            '!src/client/**/*.js'
        ])
        .pipe(gulpBabel());

    var styles = gulp
        .src('src/**/*.less')
        .pipe(gulpLess());

    var templates = gulp
        .src(['src/**/*.mustache', '!src/**/*.js.wrapper.mustache']);

    var images = gulp
        .src(['src/**/*.png', 'src/**/*.ico', 'src/**/*.svg']);

    return merge(js, styles, templates, images)
        .pipe(gulp.dest('lib'));
});

gulp.task('lint', function () {
    return gulp
        .src([
            'src/**/*.js',
            '!src/client/**/*.js',  //TODO: fix it
            //'test/**/*.js',       //TODO: fix it
            'test/server/**.js',
            'test/report-design-viewer/*.js',
            'Gulpfile.js'
        ])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});


//Test
gulp.task('test-server', ['build'], function () {
    return gulp
        .src('test/server/*-test.js')
        .pipe(mocha({
            ui:       'bdd',
            reporter: 'spec',
            timeout:  typeof v8debug === 'undefined' ? 2000 : Infinity // NOTE: disable timeouts in debug
        }));
});

gulp.task('test-client', ['build'], function () {
    return gulp
        .src('./test/client/fixtures/**/*-test.js')
        .pipe(qunitHarness(CLIENT_TESTS_SETTINGS));
});

gulp.task('test-client-travis', ['build'], function () {
    return gulp
        .src('./test/client/fixtures/**/*-test.js')
        .pipe(qunitHarness(CLIENT_TESTS_SETTINGS, SAUCELABS_SETTINGS));
});

gulp.task('report-design-viewer', ['build'], function () {
    return new Promise(function () {
        require('./test/report-design-viewer')(argv.reporter, argv.decorator);
    });
});

gulp.task('travis', [process.env.GULP_TASK || '']);
