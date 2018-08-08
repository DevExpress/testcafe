var babel                = require('babel-core');
var gulp                 = require('gulp');
var gulpStep             = require('gulp-step');
var gulpBabel            = require('gulp-babel');
var data                 = require('gulp-data');
var less                 = require('gulp-less');
var qunitHarness         = require('gulp-qunit-harness');
var git                  = require('gulp-git');
var ghpages              = require('gulp-gh-pages');
var mocha                = require('gulp-mocha-simple');
var mustache             = require('gulp-mustache');
var rename               = require('gulp-rename');
var webmake              = require('gulp-webmake');
var uglify               = require('gulp-uglify');
var ll                   = require('gulp-ll-next');
const clone              = require('gulp-clone');
const mergeStreams       = require('merge-stream');
var del                  = require('del');
var fs                   = require('fs');
var path                 = require('path');
var globby               = require('globby');
var opn                  = require('opn');
var connect              = require('connect');
var spawn                = require('cross-spawn');
var serveStatic          = require('serve-static');
var Promise              = require('pinkie');
var markdownlint         = require('markdownlint');
var minimist             = require('minimist');
var prompt               = require('gulp-prompt');
var functionalTestConfig = require('./test/functional/config');
var assignIn             = require('lodash').assignIn;
var yaml                 = require('js-yaml');
var childProcess         = require('child_process');
var listBrowsers         = require('testcafe-browser-tools').getInstallations;
var npmAuditor           = require('npm-auditor');
var checkLicenses        = require('./test/dependency-licenses-checker');

gulpStep.install();

ll
    .install()
    .tasks([
        'lint',
        'check-licenses',
        'server-scripts'
    ])
    .onlyInDebug([
        'styles',
        'client-scripts',
        'client-scripts-bundle'
    ]);

var ARGS     = minimist(process.argv.slice(2));
var DEV_MODE = 'dev' in ARGS;

var CLIENT_TESTS_PATH        = 'test/client/fixtures';
var CLIENT_TESTS_LEGACY_PATH = 'test/client/legacy-fixtures';

var CLIENT_TESTS_SETTINGS_BASE = {
    port:            2000,
    crossDomainPort: 2001,

    scripts: [
        { src: '/async.js', path: 'test/client/vendor/async.js' },
        { src: '/hammerhead.js', path: 'node_modules/testcafe-hammerhead/lib/client/hammerhead.min.js' },
        { src: '/core.js', path: 'lib/client/core/index.min.js' },
        { src: '/ui.js', path: 'lib/client/ui/index.min.js' },
        { src: '/automation.js', path: 'lib/client/automation/index.min.js' },
        { src: '/driver.js', path: 'lib/client/driver/index.js' },
        { src: '/legacy-runner.js', path: 'node_modules/testcafe-legacy-api/lib/client/index.js' },
        { src: '/before-test.js', path: 'test/client/before-test.js' }
    ],

    configApp: require('./test/client/config-qunit-server-app')
};

var CLIENT_TESTS_SETTINGS        = assignIn({}, CLIENT_TESTS_SETTINGS_BASE, { basePath: CLIENT_TESTS_PATH });
var CLIENT_TESTS_LOCAL_SETTINGS  = assignIn({}, CLIENT_TESTS_SETTINGS);
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
        platform:    'macOS 10.13',
        browserName: 'safari',
        version:     '11.1'
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

var CLIENT_TESTS_OLD_BROWSERS = [
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

var CLIENT_TESTS_MOBILE_BROWSERS = [
    {
        platform:    'Linux',
        browserName: 'android',
        version:     '6.0',
        deviceName:  'Android Emulator'
    },
    {
        platform:    'iOS',
        browserName: 'Safari',
        // NOTE: https://github.com/DevExpress/testcafe/issues/471
        // problem with extra scroll reproduced only on saucelabs
        // virtual machines with ios device emulators
        version:     '10.3',
        deviceName:  'iPhone 7 Plus Simulator'
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

var CLIENT_TEST_LOCAL_BROWSERS_ALIASES = ['ie', 'edge', 'chrome', 'firefox', 'safari'];

var PUBLISH_TAG = JSON.parse(fs.readFileSync(path.join(__dirname, '.publishrc')).toString()).publishTag;

var websiteServer = null;

gulp.task('audit', function () {
    return npmAuditor()
        .then(result => {
            process.stdout.write(result.report);
            process.stdout.write('\n');

            if (result.exitCode !== 0)
                throw new Error('Security audit failed');
        });
});

gulp.task('clean', function () {
    return del('lib');
});


// Lint
gulp.task('lint', function () {
    var eslint = require('gulp-eslint');

    return gulp
        .src([
            'examples/**/*.js',
            'src/**/*.js',
            'test/**/*.js',
            '!test/client/vendor/**/*.*',
            'Gulpfile.js'
        ])
        .pipe(eslint())
        .pipe(eslint.format(process.env.ESLINT_FORMATTER))
        .pipe(eslint.failAfterError());
});

// License checker
gulp.task('check-licenses', function () {
    return checkLicenses();
});

// Build

gulp.step('client-scripts-bundle', function () {
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
        .pipe(gulp.dest('lib'));
});

gulp.step('client-scripts-templates-render', function () {
    const scripts = gulp
        .src([
            'src/client/core/index.js.wrapper.mustache',
            'src/client/ui/index.js.wrapper.mustache',
            'src/client/automation/index.js.wrapper.mustache',
            'src/client/driver/index.js.wrapper.mustache'
        ], { base: 'src' })
        .pipe(rename(file => {
            file.extname  = '';
            file.basename = file.basename.replace('.js.wrapper', '');
        }))
        .pipe(data(file => {
            const sourceFilePath = path.resolve('lib', file.relative + '.js');

            return {
                source: fs.readFileSync(sourceFilePath)
            };
        }))
        .pipe(mustache())
        .pipe(rename(file => {
            file.extname = '.js';
        }));

    const bundledScripts = scripts
        .pipe(clone())
        .pipe(uglify())
        .pipe(rename(file => {
            file.extname = '.min.js';
        }));

    return mergeStreams(scripts, bundledScripts)
        .pipe(gulp.dest('lib'));
});

gulp.step('client-scripts', gulp.series('client-scripts-bundle', 'client-scripts-templates-render'));

gulp.step('server-scripts', function () {
    return gulp
        .src([
            'src/**/*.js',
            '!src/client/**/*.js'
        ])
        .pipe(gulpBabel())
        .pipe(gulp.dest('lib'));
});

gulp.step('styles', function () {
    return gulp
        .src('src/**/*.less')
        .pipe(less())
        .pipe(gulp.dest('lib'));
});

gulp.step('templates', function () {
    return gulp
        .src([
            'src/**/*.mustache',
            '!src/**/*.js.wrapper.mustache'
        ])
        .pipe(gulp.dest('lib'));
});

gulp.step('images', function () {
    return gulp
        .src([
            'src/**/*.png',
            'src/**/*.ico',
            'src/**/*.svg'
        ])
        .pipe(gulp.dest('lib'));
});

gulp.step('package-content', gulp.parallel('server-scripts', 'client-scripts', 'styles', 'images', 'templates'));

gulp.task('fast-build', gulp.series('clean', 'package-content'));

gulp.task('build', DEV_MODE ? gulp.registry().get('fast-build') : gulp.parallel('fast-build'));

// Test
gulp.step('test-server-run', function () {
    return gulp
        .src('test/server/*-test.js', { read: false })
        .pipe(mocha({
            timeout: typeof v8debug !== 'undefined' || !!process.debugPort ? Infinity : 2000 // NOTE: disable timeouts in debug
        }));
});

gulp.step('test-server-bootstrap', gulp.series('build', 'test-server-run'));

gulp.task('test-server', gulp.parallel('check-licenses', 'test-server-bootstrap'));

function testClient (tests, settings, envSettings, cliMode) {
    function runTests (env, runOpts) {
        return gulp
            .src(tests)
            .pipe(qunitHarness(settings, env, runOpts));
    }

    if (!cliMode)
        return runTests(envSettings);

    return listBrowsers().then(function (browsers) {
        const browserNames   = Object.keys(browsers);
        const targetBrowsers = [];

        browserNames.forEach(function (browserName) {
            if (CLIENT_TEST_LOCAL_BROWSERS_ALIASES.includes(browserName))
                targetBrowsers.push({ browserInfo: browsers[browserName], browserName: browserName });
        });

        return runTests({ browsers: targetBrowsers }, { cliMode: true });
    });
}

gulp.step('test-client-run', function () {
    return testClient('test/client/fixtures/**/*-test.js', CLIENT_TESTS_SETTINGS);
});

gulp.task('test-client', gulp.series('build', 'test-client-run'));

gulp.step('test-client-local-run', function () {
    return testClient('test/client/fixtures/**/*-test.js', CLIENT_TESTS_LOCAL_SETTINGS, {}, true);
});

gulp.task('test-client-local', gulp.series('build', 'test-client-local-run'));

gulp.step('test-client-legacy-run', function () {
    return testClient('test/client/legacy-fixtures/**/*-test.js', CLIENT_TESTS_LEGACY_SETTINGS);
});

gulp.task('test-client-legacy', gulp.series('build', 'test-client-legacy-run'));

gulp.step('test-client-travis-run', function () {
    var saucelabsSettings = CLIENT_TESTS_SAUCELABS_SETTINGS;

    saucelabsSettings.browsers = CLIENT_TESTS_DESKTOP_BROWSERS;

    return testClient('test/client/fixtures/**/*-test.js', CLIENT_TESTS_SETTINGS, saucelabsSettings);
});

gulp.task('test-client-travis', gulp.series('build', 'test-client-travis-run'));

gulp.step('test-client-old-browsers-travis-run', function () {
    var saucelabsSettings = CLIENT_TESTS_SAUCELABS_SETTINGS;

    saucelabsSettings.browsers = CLIENT_TESTS_OLD_BROWSERS;

    return testClient('test/client/fixtures/**/*-test.js', CLIENT_TESTS_SETTINGS, saucelabsSettings);
});

gulp.task('test-client-old-browsers-travis', gulp.series('build', 'test-client-old-browsers-travis-run'));

gulp.step('test-client-travis-mobile-run', function () {
    var saucelabsSettings = CLIENT_TESTS_SAUCELABS_SETTINGS;

    saucelabsSettings.browsers = CLIENT_TESTS_MOBILE_BROWSERS;

    return testClient('test/client/fixtures/**/*-test.js', CLIENT_TESTS_SETTINGS, saucelabsSettings);
});

gulp.task('test-client-travis-mobile', gulp.series('build', 'test-client-travis-mobile-run'));

gulp.step('test-client-legacy-travis-run', function () {
    var saucelabsSettings = CLIENT_TESTS_SAUCELABS_SETTINGS;

    saucelabsSettings.browsers = CLIENT_TESTS_DESKTOP_BROWSERS;

    return testClient('test/client/legacy-fixtures/**/*-test.js', CLIENT_TESTS_LEGACY_SETTINGS, saucelabsSettings);
});

gulp.task('test-client-legacy-travis', gulp.series('build', 'test-client-legacy-travis-run'));

gulp.step('test-client-legacy-travis-mobile-run', function () {
    var saucelabsSettings = CLIENT_TESTS_SAUCELABS_SETTINGS;

    saucelabsSettings.browsers = CLIENT_TESTS_MOBILE_BROWSERS;

    return testClient('test/client/legacy-fixtures/**/*-test.js', CLIENT_TESTS_LEGACY_SETTINGS, saucelabsSettings);
});

gulp.task('test-client-legacy-travis-mobile', gulp.series('build', 'test-client-legacy-travis-mobile-run'));

//Documentation
gulp.task('generate-docs-readme', function (done) {
    function generateItem (name, url, level) {
        return ' '.repeat(level * 2) + '* [' + name + '](articles' + url + ')\n';
    }

    function generateDirectory (tocItems, level) {
        var res = '';

        tocItems.forEach(function (item) {
            res += generateItem(item.name ? item.name : item.url, item.url, level);

            if (item.content)
                res += generateDirectory(item.content, level + 1);
        });

        return res;
    }

    function generateReadme (toc) {
        var tocList = generateDirectory(toc, 0);

        return '# Documentation\n\n> This is the documentation\'s development version. ' +
               'The functionality described here may not be included in the current release version. ' +
               'Unreleased functionality may change or be dropped before the next release. ' +
               'The release version\'s documentation is available at the [TestCafe website](https://devexpress.github.io/testcafe/documentation/getting-started/).\n\n' +
               tocList;
    }

    var toc    = yaml.safeLoad(fs.readFileSync('docs/nav/nav-menu.yml', 'utf8'));
    var readme = generateReadme(toc);

    fs.writeFileSync('docs/README.md', readme);

    done();
});

gulp.task('lint-docs', function () {
    function lintFiles (files, config) {
        return new Promise(function (resolve, reject) {
            markdownlint({ files: files, config: config }, function (err, result) {
                var lintErr = err || result && result.toString();

                if (lintErr)
                    reject(lintErr);
                else
                    resolve();
            });
        });
    }

    var lintDocsAndExamples = globby([
        'docs/articles/**/*.md',
        '!docs/articles/faq/**/*.md',
        '!docs/articles/documentation/recipes/**/*.md',
        'examples/**/*.md'
    ]).then(function (files) {
        return lintFiles(files, require('./.md-lint/docs.json'));
    });

    var lintFaq = globby([
        'docs/articles/faq/**/*.md'
    ]).then(function (files) {
        return lintFiles(files, require('./.md-lint/faq.json'));
    });

    var lintRecipes = globby([
        'docs/articles/documentation/recipes/**/*.md'
    ]).then(function (files) {
        return lintFiles(files, require('./.md-lint/recipes.json'));
    });

    var lintReadme    = lintFiles('README.md', require('./.md-lint/readme.json'));
    var lintChangelog = lintFiles('CHANGELOG.md', require('./.md-lint/changelog.json'));

    return Promise.all([lintDocsAndExamples, lintReadme, lintChangelog, lintRecipes, lintFaq]);
});

gulp.task('clean-website', function () {
    return del('site');
});

gulp.step('fetch-assets-repo', function (cb) {
    git.clone('https://github.com/DevExpress/testcafe-gh-page-assets.git', { args: 'site' }, cb);
});

gulp.step('put-in-articles', function () {
    return gulp
        .src(['docs/articles/**/*', '!docs/articles/blog/**/*'])
        .pipe(gulp.dest('site/src'));
});

gulp.step('put-in-posts', function () {
    return gulp
        .src('docs/articles/blog/**/*')
        .pipe(gulp.dest('site/src/_posts'));
});

gulp.step('put-in-navigation', function () {
    return gulp
        .src('docs/nav/**/*')
        .pipe(gulp.dest('site/src/_data'));
});

gulp.step('put-in-publications', function () {
    return gulp
        .src('docs/publications/**/*')
        .pipe(gulp.dest('site/src/_data'));
});

gulp.step('put-in-tweets', function () {
    return gulp
        .src('docs/tweets/**/*')
        .pipe(gulp.dest('site/src/_data'));
});

gulp.step('put-in-website-content', gulp.parallel('put-in-articles', 'put-in-navigation', 'put-in-posts', 'put-in-publications', 'put-in-tweets'));
gulp.step('prepare-website-content', gulp.series('clean-website', 'fetch-assets-repo', 'put-in-website-content'));

gulp.step('prepare-website', gulp.parallel('lint-docs', 'prepare-website-content'));

function buildWebsite (mode, cb) {
    var options = mode ? { stdio: 'inherit', env: { JEKYLL_ENV: mode } } : { stdio: 'inherit' };

    spawn('jekyll', ['build', '--source', 'site/src/', '--destination', 'site/deploy'], options)
        .on('exit', cb);
}

// NOTE: we have three website build configurations.
//
// * production - used when the website is built for publishing. Gulp task 'build-website-production'.
// * development - used when the website is built for local deployment. Gulp task 'build-website-development'.
// * testing - used when the website is built for testing. Gulp task 'build-website-testing'.
//
// This is how they affect the website.
//
// * Blog comments.
//   - Do not appear in testing mode.
//   - In development mode, comments from an internal 'staging' thread are displayed.
//   - In production mode, public comment threads are displayed.
// * Google Analytics is enabled in production mode only.

gulp.step('build-website-production-run', function (cb) {
    buildWebsite('production', cb);
});

gulp.task('build-website-production', gulp.series('prepare-website', 'build-website-production-run'));

gulp.step('build-website-development-run', function (cb) {
    buildWebsite('development', cb);
});

gulp.task('build-website-development', gulp.series('prepare-website', 'build-website-development-run'));

gulp.step('build-website-testing-run', function (cb) {
    buildWebsite('testing', cb);
});

gulp.task('build-website-testing', gulp.series('prepare-website', 'build-website-testing-run'));

gulp.step('build-website-run', function (cb) {
    buildWebsite('', cb);
});

gulp.task('build-website', gulp.series('prepare-website', 'build-website-run'));

gulp.task('serve-website', function (cb) {
    var app = connect()
        .use('/testcafe', serveStatic('site/deploy'));

    websiteServer = app.listen(8080, cb);
});

gulp.step('preview-website-open', function () {
    return opn('http://localhost:8080/testcafe');
});

gulp.task('preview-website', gulp.series('build-website-development', 'serve-website', 'preview-website-open'));

gulp.step('test-website-run', function () {
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

gulp.task('test-website', gulp.series('build-website-testing', 'serve-website', 'test-website-run'));

gulp.task('test-website-travis', gulp.series('build-website', 'serve-website', 'test-website-run'));

gulp.step('website-publish-run', function () {
    return gulp
        .src('site/deploy/**/*')
        .pipe(rename(function (filePath) {
            filePath.dirname = filePath.dirname.toLowerCase();

            return filePath;
        }))
        .pipe(prompt.confirm({
            message: 'Are you sure you want to publish the website?',
            default: false
        }))
        .pipe(ghpages());
});

gulp.task('publish-website', gulp.series('build-website-production', 'website-publish-run'));

gulp.task('test-docs-travis', gulp.parallel('test-website-travis', 'lint'));


function testFunctional (fixturesDir, testingEnvironmentName, browserProviderName) {
    process.env.TESTING_ENVIRONMENT = testingEnvironmentName;
    process.env.BROWSER_PROVIDER    = browserProviderName;

    if (DEV_MODE)
        process.env.DEV_MODE = true;

    return gulp
        .src(['test/functional/setup.js', fixturesDir + '/**/test.js'])
        .pipe(mocha({
            ui:       'bdd',
            reporter: 'spec',
            timeout:  typeof v8debug === 'undefined' ? 1000000 : Infinity // NOTE: disable timeouts in debug
        }));
}

gulp.step('test-functional-travis-desktop-osx-and-ms-edge-run', function () {
    return testFunctional('test/functional/fixtures', functionalTestConfig.testingEnvironmentNames.osXDesktopAndMSEdgeBrowsers, functionalTestConfig.browserProviderNames.browserstack);
});

gulp.task('test-functional-travis-desktop-osx-and-ms-edge', gulp.series('build', 'test-functional-travis-desktop-osx-and-ms-edge-run'));

gulp.step('test-functional-travis-mobile-run', function () {
    return testFunctional('test/functional/fixtures', functionalTestConfig.testingEnvironmentNames.mobileBrowsers, functionalTestConfig.browserProviderNames.browserstack);
});

gulp.task('test-functional-travis-mobile', gulp.series('build', 'test-functional-travis-mobile-run'));

gulp.step('test-functional-local-run', function () {
    return testFunctional('test/functional/fixtures', functionalTestConfig.testingEnvironmentNames.localBrowsers);
});

gulp.task('test-functional-local', gulp.series('build', 'test-functional-local-run'));

gulp.step('test-functional-local-ie-run', function () {
    return testFunctional('test/functional/fixtures', functionalTestConfig.testingEnvironmentNames.localBrowsersIE);
});

gulp.task('test-functional-local-ie', gulp.series('build', 'test-functional-local-ie-run'));

gulp.step('test-functional-local-chrome-firefox-run', function () {
    return testFunctional('test/functional/fixtures', functionalTestConfig.testingEnvironmentNames.localBrowsersChromeFirefox);
});

gulp.task('test-functional-local-chrome-firefox', gulp.series('build', 'test-functional-local-chrome-firefox-run'));

gulp.step('test-functional-local-headless-run', function () {
    return testFunctional('test/functional/fixtures', functionalTestConfig.testingEnvironmentNames.localHeadlessBrowsers);
});

gulp.task('test-functional-local-headless', gulp.series('build', 'test-functional-local-headless-run'));

gulp.step('test-functional-local-legacy-run', function () {
    return testFunctional('test/functional/legacy-fixtures', functionalTestConfig.testingEnvironmentNames.legacy);
});

gulp.task('test-functional-local-legacy', gulp.series('build', 'test-functional-local-legacy-run'));

gulp.step('test-functional-travis-old-browsers-run', function () {
    return testFunctional('test/functional/fixtures', functionalTestConfig.testingEnvironmentNames.oldBrowsers, functionalTestConfig.browserProviderNames.sauceLabs);
});

gulp.task('test-functional-travis-old-browsers', gulp.series('build', 'test-functional-travis-old-browsers-run'));

function getDockerEnv (machineName) {
    return childProcess
        .execSync('docker-machine env --shell bash ' + machineName)
        .toString()
        .split('\n')
        .map(function (line) {
            return line.match(/export\s*(.*)="(.*)"$/);
        })
        .filter(function (match) {
            return !!match;
        })
        .reduce(function (env, match) {
            env[match[1]] = match[2];
            return env;
        }, {});
}

function isDockerMachineRunning (machineName) {
    try {
        return childProcess.execSync('docker-machine status ' + machineName).toString().match(/Running/);
    }
    catch (e) {
        return false;
    }
}

function isDockerMachineExist (machineName) {
    try {
        childProcess.execSync('docker-machine status ' + machineName);
        return true;
    }
    catch (e) {
        return !e.message.match(/Host does not exist/);
    }
}

function startDocker () {
    var dockerMachineName = process.env['DOCKER_MACHINE_NAME'] || 'default';

    if (!isDockerMachineExist(dockerMachineName))
        childProcess.execSync('docker-machine create -d virtualbox ' + dockerMachineName);

    if (!isDockerMachineRunning(dockerMachineName))
        childProcess.execSync('docker-machine start ' + dockerMachineName);

    var dockerEnv = getDockerEnv(dockerMachineName);

    assignIn(process.env, dockerEnv);
}

gulp.task('docker-build', function (done) {
    if (!process.env['DOCKER_HOST']) {
        try {
            startDocker();
        }
        catch (e) {
            throw new Error('Unable to initialize Docker environment. Use Docker terminal to run this task.\n' +
                            e.stack);
        }
    }

    var imageId = childProcess
        .execSync('docker build -q -t testcafe -f docker/Dockerfile .', { env: process.env })
        .toString()
        .replace(/\n/g, '');

    childProcess.execSync('docker tag ' + imageId + ' testcafe/testcafe:' + PUBLISH_TAG, {
        stdio: 'inherit',
        env:   process.env
    });

    done();
});

gulp.step('docker-publish-run', function (done) {
    childProcess.execSync('docker push testcafe/testcafe:' + PUBLISH_TAG, { stdio: 'inherit', env: process.env });

    done();
});

gulp.task('docker-publish', gulp.series('docker-build', 'docker-publish-run'));

gulp.task('travis', process.env.GULP_TASK ? gulp.series(process.env.GULP_TASK) : () => {});
