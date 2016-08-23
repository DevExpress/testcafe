var babel                = require('babel-core');
var gulp                 = require('gulp');
var gulpBabel            = require('gulp-babel');
var less                 = require('gulp-less');
var filter               = require('gulp-filter');
var git                  = require('gulp-git');
var globby               = require('globby');
var qunitHarness         = require('gulp-qunit-harness');
var mocha                = require('gulp-mocha');
var mustache             = require('gulp-mustache');
var rename               = require('gulp-rename');
var webmake              = require('gulp-webmake');
var util                 = require('gulp-util');
var gulpif               = require('gulp-if');
var uglify               = require('gulp-uglify');
var ll                   = require('gulp-ll');
var del                  = require('del');
var fs                   = require('fs');
var path                 = require('path');
var opn                  = require('opn');
var connect              = require('connect');
var spawn                = require('cross-spawn-async');
var serveStatic          = require('serve-static');
var Promise              = require('pinkie');
var markdownlint         = require('markdownlint');
var ghpages              = require('gulp-gh-pages');
var prompt               = require('gulp-prompt');
var nodeVer              = require('node-version');
var functionalTestConfig = require('./test/functional/config');
var assignIn             = require('lodash').assignIn;


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

var CLIENT_TESTS_PATH        = 'test/client/fixtures';
var CLIENT_TESTS_LEGACY_PATH = 'test/client/legacy-fixtures';

var CLIENT_TESTS_SETTINGS_BASE = {
    port:            2000,
    crossDomainPort: 2001,

    scripts: [
        { src: '/async.js', path: 'test/client/vendor/async.js' },
        { src: '/hammerhead.js', path: 'node_modules/testcafe-hammerhead/lib/client/hammerhead.js' },
        { src: '/core.js', path: 'lib/client/core/index.js' },
        { src: '/ui.js', path: 'lib/client/ui/index.js' },
        { src: '/automation.js', path: 'lib/client/automation/index.js' },
        { src: '/legacy-runner.js', path: 'node_modules/testcafe-legacy-api/lib/client/index.js' },
        { src: '/before-test.js', path: 'test/client/before-test.js' }
    ],

    configApp: require('./test/client/config-qunit-server-app')
};

var CLIENT_TESTS_SETTINGS        = assignIn({}, CLIENT_TESTS_SETTINGS_BASE, { basePath: CLIENT_TESTS_PATH });
var CLIENT_TESTS_LEGACY_SETTINGS = assignIn({}, CLIENT_TESTS_SETTINGS_BASE, { basePath: CLIENT_TESTS_LEGACY_PATH });

var CLIENT_TESTS_DESKTOP_BROWSERS = [
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
    },
    {
        platform:    'OS X 10.11',
        browserName: 'safari',
        version:     '9.0'
    },
    {
        platform:    'OS X 10.11',
        browserName: 'chrome'
    },
    {
        platform:    'OS X 10.11',
        browserName: 'firefox'
    }
];

var CLIENT_TESTS_MOBILE_BROWSERS = [
    {
        platform:    'Linux',
        browserName: 'android',
        version:     '5.1',
        deviceName:  'Android Emulator'
    },
    {
        platform:    'OS X 10.10',
        browserName: 'iphone',
        version:     '8.1',
        deviceName:  'iPad Simulator'
    },
    {
        platform:    'iOS',
        browserName: 'Safari',
        // NOTE: https://github.com/DevExpress/testcafe/issues/471
        // problem with extra scroll reproduced only on saucelabs
        // virtual machines with ios device emulators
        version:     '9.3',
        deviceName:  'iPhone 6 Plus'
    }
];

var CLIENT_TESTS_SAUCELABS_SETTINGS = {
    username:  process.env.SAUCE_USERNAME,
    accessKey: process.env.SAUCE_ACCESS_KEY,
    build:     process.env.TRAVIS_BUILD_ID || '',
    tags:      [process.env.TRAVIS_BRANCH || 'master'],
    name:      'testcafe client tests',
    timeout:   720
};

var websiteServer = null;

gulp.task('clean', function () {
    return del('lib');
});


// Lint
gulp.task('lint', function () {
    // TODO: eslint supports node version 4 or higher.
    // Remove this condition once we get rid of node 0.10 support.
    if (nodeVer.major === '0')
        return null;

    var eslint = require('gulp-eslint');

    return gulp
        .src([
            'src/**/*.js'
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
        { wrapper: 'src/client/automation/index.js.wrapper.mustache', src: 'lib/client/automation/index.js' },
        { wrapper: 'src/client/driver/index.js.wrapper.mustache', src: 'lib/client/driver/index.js' }
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

gulp.task('fast-build', ['server-scripts', 'client-scripts', 'styles', 'images', 'templates']);
gulp.task('build', ['lint', 'fast-build']);

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

function testClient (tests, settings, sauselabsSettings) {
    return gulp
        .src(tests)
        .pipe(qunitHarness(settings, sauselabsSettings));
}

gulp.task('test-client', [/*'build'*/], function () {
    return testClient('test/client/fixtures/**/*-test.js', CLIENT_TESTS_SETTINGS);
});

gulp.task('test-client-legacy', ['build'], function () {
    return testClient('test/client/legacy-fixtures/**/*-test.js', CLIENT_TESTS_LEGACY_SETTINGS);
});

gulp.task('test-client-travis', ['build'], function () {
    var saucelabsSettings = CLIENT_TESTS_SAUCELABS_SETTINGS;

    saucelabsSettings.browsers = CLIENT_TESTS_DESKTOP_BROWSERS;

    return testClient('test/client/fixtures/**/*-test.js', CLIENT_TESTS_SETTINGS, saucelabsSettings);
});

gulp.task('test-client-travis-mobile', ['build'], function () {
    var saucelabsSettings = CLIENT_TESTS_SAUCELABS_SETTINGS;

    saucelabsSettings.browsers = CLIENT_TESTS_MOBILE_BROWSERS;

    return testClient('test/client/fixtures/**/*-test.js', CLIENT_TESTS_SETTINGS, saucelabsSettings);
});

gulp.task('test-client-legacy-travis', ['build'], function () {
    var saucelabsSettings = CLIENT_TESTS_SAUCELABS_SETTINGS;

    saucelabsSettings.browsers = CLIENT_TESTS_DESKTOP_BROWSERS;

    return testClient('test/client/legacy-fixtures/**/*-test.js', CLIENT_TESTS_LEGACY_SETTINGS, saucelabsSettings);
});

gulp.task('test-client-legacy-travis-mobile', ['build'], function () {
    var saucelabsSettings = CLIENT_TESTS_SAUCELABS_SETTINGS;

    saucelabsSettings.browsers = CLIENT_TESTS_MOBILE_BROWSERS;

    return testClient('test/client/legacy-fixtures/**/*-test.js', CLIENT_TESTS_LEGACY_SETTINGS, saucelabsSettings);
});

gulp.task('travis', [process.env.GULP_TASK || '']);

//Documentation
gulp.task('lint-docs', function () {
    function lintFiles (files) {
        return new Promise(function (resolve, reject) {
            var config = {
                'files':  files,
                'config': require('./.markdownlint.json')
            };

            markdownlint(config, function (err, result) {
                var lintErr = err || result && result.toString();

                if (lintErr)
                    reject(lintErr);
                else
                    resolve();
            });
        });
    }

    return globby('docs/articles/**/*.md').then(lintFiles);
});

gulp.task('clean-website', function () {
    return del('site');
});

gulp.task('fetch-assets-repo', ['clean-website'], function (cb) {
    git.clone('https://github.com/DevExpress/testcafe-gh-page-assets.git', { args: 'site' }, cb);
});

gulp.task('put-in-articles', ['fetch-assets-repo'], function () {
    return gulp
        .src('docs/articles/**/*')
        .pipe(gulp.dest('site/src'));
});

gulp.task('put-in-navigation', ['fetch-assets-repo'], function () {
    return gulp
        .src('docs/nav/**/*')
        .pipe(gulp.dest('site/src/_data'));
});

gulp.task('prepare-website', ['put-in-articles', 'put-in-navigation', 'lint-docs']);

gulp.task('build-website', ['prepare-website'], function (cb) {
    spawn('jekyll', ['build', '--source', 'site/src/', '--destination', 'site/deploy'], { stdio: 'inherit' })
        .on('exit', cb);
});

gulp.task('serve-website', ['build-website'], function (cb) {
    var app = connect()
        .use('/testcafe', serveStatic('site/deploy'));

    websiteServer = app.listen(8080, cb);
});

gulp.task('preview-website', ['serve-website'], function () {
    opn('http://localhost:8080/testcafe');
});

gulp.task('test-website', ['serve-website'], function () {
    var WebsiteTester = require('./test/website/test.js');
    var websiteTester = new WebsiteTester();

    return websiteTester
        .checkLinks()
        .then(function (failed) {
            return new Promise(function (resolve, reject) {
                websiteServer.close(function () {
                    if (failed)
                        reject('Broken links found!');
                    else
                        resolve();
                });
            });
        });
});

gulp.task('publish-website', ['build-website'], function () {
    return gulp
        .src('site/deploy/**/*')
        .pipe(prompt.confirm({
            message: 'Are you sure you want to publish the website?',
            default: false
        }))
        .pipe(ghpages());
});

gulp.task('test-docs', ['test-website', 'lint']);


function testFunctional (fixturesDir, testingEnvironmentName) {
    process.env.TESTING_ENVIRONMENT = testingEnvironmentName;

    return gulp
        .src(['test/functional/setup.js', fixturesDir + '/**/test.js'])
        .pipe(mocha({
            ui:       'bdd',
            reporter: 'spec',
            timeout:  typeof v8debug === 'undefined' ? 30000 : Infinity // NOTE: disable timeouts in debug
        }));
}

gulp.task('test-functional-travis-desktop', ['build'], function () {
    return testFunctional('test/functional/fixtures', functionalTestConfig.testingEnvironmentNames.desktopBrowsers);
});

gulp.task('test-functional-travis-ms-desktop', ['build'], function () {
    return testFunctional('test/functional/fixtures', functionalTestConfig.testingEnvironmentNames.msDesktopBrowsers);
});

gulp.task('test-functional-travis-mobile', ['build'], function () {
    return testFunctional('test/functional/fixtures', functionalTestConfig.testingEnvironmentNames.mobileBrowsers);
});

gulp.task('test-functional-local', ['build'], function () {
    return testFunctional('test/functional/fixtures', functionalTestConfig.testingEnvironmentNames.localBrowsers);
});

gulp.task('test-functional-travis-legacy', ['build'], function () {
    return testFunctional('test/functional/legacy-fixtures', functionalTestConfig.testingEnvironmentNames.legacy);
});
