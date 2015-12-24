var babel        = require('babel');
var gulp         = require('gulp');
var gulpBabel    = require('gulp-babel');
var less         = require('gulp-less');
var filter       = require('gulp-filter');
var eslint       = require('gulp-eslint');
var qunitHarness = require('gulp-qunit-harness');
var mocha        = require('gulp-mocha');
var mustache     = require('gulp-mustache');
var rename       = require('gulp-rename');
var webmake      = require('gulp-webmake');
var util         = require('gulp-util');
var gulpif       = require('gulp-if');
var uglify       = require('gulp-uglify');
var ll           = require('gulp-ll');
var publish      = require('publish-please');
var del          = require('del');
var fs           = require('fs');
var path         = require('path');
var Promise      = require('pinkie');

ll
    .tasks([
        'lint',
        'server-scripts'
    ])
    .onlyInDebug([
        'styles',
        'client-scripts',
        'client-scripts-bundle'
    ]);


var CLIENT_TESTS_SETTINGS = {
    basePath:        'test/client/fixtures',
    port:            2000,
    crossDomainPort: 2001,

    scripts: [
        { src: '/async.js', path: 'test/client/vendor/async.js' },
        { src: '/hammerhead.js', path: 'node_modules/testcafe-hammerhead/lib/client/hammerhead.js' },
        { src: '/core.js', path: 'lib/client/core/index.js' },
        { src: '/ui.js', path: 'lib/client/ui/index.js' },
        { src: '/runner.js', path: 'lib/client/runner/index.js' },
        { src: '/before-test.js', path: 'test/client/before-test.js' }
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
        browserName: 'chrome',
        platform:    'OS X 10.11'
    },
    {
        platform:    'Windows 10',
        browserName: 'firefox'
    },
    {
        browserName: 'firefox',
        platform:    'OS X 10.11'
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
    },
    {
        platform:    'Linux',
        browserName: 'android',
        version:     '5.1',
        deviceName:  'Android Emulator'
    },
    {
        browserName: 'safari',
        platform:    'OS X 10.10',
        version:     '8.0'
    },
    {
        browserName: 'iphone',
        platform:    'OS X 10.10',
        version:     '8.1',
        deviceName:  'iPad Simulator'
    },
    {
        browserName: 'iphone',
        platform:    'OS X 10.10',
        version:     '9.1',
        deviceName:  'iPhone 6 Plus'
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


// Lint
gulp.task('lint-client', function () {
    return gulp
        .src([
            'src/client/runner/automation/playback/scroll.js',
            'src/client/runner/utils/**/*.js'
        ])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('lint', ['lint-client'], function () {
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


// Build
gulp.task('client-scripts', ['client-scripts-bundle'], function () {
    var scripts = [
        { wrapper: 'src/client/core/index.js.wrapper.mustache', src: 'lib/client/core/index.js' },
        { wrapper: 'src/client/ui/index.js.wrapper.mustache', src: 'lib/client/ui/index.js' },
        { wrapper: 'src/client/runner/index.js.wrapper.mustache', src: 'lib/client/runner/index.js' }
    ];

    return Promise
        .all(scripts.map(function (script) {
            return gulp
                .src(script.wrapper)
                .pipe(mustache({ source: fs.readFileSync(script.src).toString() }))
                .pipe(rename(path.basename(script.src)))
                .pipe(gulpif(!util.env.dev, uglify()))
                .pipe(gulp.dest(path.dirname(script.src)));
        }));
});

gulp.task('client-scripts-bundle', ['clean'], function () {
    var filterBrowserIdlePage = filter('browser/idle-page/index.js', { restore: true });

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
                var transformed = babel.transform(code, {
                    sourceMap: false,
                    filename:  filename
                });

                return { code: transformed.code };
            }
        }))
        .pipe(filterBrowserIdlePage)
        .pipe(gulpif(!util.env.dev, uglify()))
        .pipe(filterBrowserIdlePage.restore)
        .pipe(gulp.dest('lib/client'));
});

gulp.task('server-scripts', ['clean'], function () {
    return gulp
        .src([
            'src/**/*.js',
            '!src/client/**/*.js'
        ])
        .pipe(gulpBabel())
        .pipe(gulp.dest('lib'));
});

gulp.task('styles', ['clean'], function () {
    return gulp
        .src('src/**/*.less')
        .pipe(less())
        .pipe(gulp.dest('lib'));
});

gulp.task('templates', ['clean'], function () {
    return gulp
        .src([
            'src/**/*.mustache',
            '!src/**/*.js.wrapper.mustache'
        ])
        .pipe(gulp.dest('lib'));
});

gulp.task('images', ['clean'], function () {
    return gulp
        .src([
            'src/**/*.png',
            'src/**/*.ico',
            'src/**/*.svg'
        ])
        .pipe(gulp.dest('lib'));
});


gulp.task('build', ['lint', 'server-scripts', 'client-scripts', 'styles', 'images', 'templates']);

// Test
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
        .src('test/client/fixtures/**/*-test.js')
        .pipe(qunitHarness(CLIENT_TESTS_SETTINGS));
});

gulp.task('test-client-travis', ['build'], function () {
    return gulp
        .src('test/client/fixtures/**/*-test.js')
        .pipe(qunitHarness(CLIENT_TESTS_SETTINGS, SAUCELABS_SETTINGS));
});

gulp.task('travis', [process.env.GULP_TASK || '']);

// Publish
gulp.task('publish', ['test-server'], function () {
    // TODO switch publish tag once we'll be ready to release
    return publish({ tag: 'alpha' });
});
