const gulp                          = require('gulp');
const gulpStep                      = require('gulp-step');
const data                          = require('gulp-data');
const less                          = require('gulp-less');
const mocha                         = require('gulp-mocha-simple');
const mustache                      = require('gulp-mustache');
const rename                        = require('gulp-rename');
const uglify                        = require('gulp-uglify');
const ll                            = require('gulp-ll-next');
const clone                         = require('gulp-clone');
const mergeStreams                  = require('merge-stream');
const del                           = require('del');
const fs                            = require('fs');
const path                          = require('path');
const { promisify }                 = require('util');
const globby                        = require('globby');
const minimist                      = require('minimist');
const functionalTestConfig          = require('./test/functional/config');
const childProcess                  = require('child_process');
const npmAuditor                    = require('npm-auditor');
const checkLicenses                 = require('./test/dependency-licenses-checker');
const packageInfo                   = require('./package');
const ensureDockerEnvironment       = require('./gulp/docker/ensure-docker-environment');
const getDockerPublishInfo          = require('./gulp/docker/get-publish-info');
const runFunctionalTestInDocker     = require('./gulp/docker/run-functional-test-via-command-line');
const { exitDomains, enterDomains } = require('./gulp/helpers/domain');
const getTimeout                    = require('./gulp/helpers/get-timeout');
const promisifyStream               = require('./gulp/helpers/promisify-stream');
const testFunctional                = require('./gulp/helpers/test-functional');
const testClient                    = require('./gulp/helpers/test-client');
const moduleExportsTransform        = require('./gulp/helpers/module-exports-transform');

const {
    TESTS_GLOB,
    LEGACY_TESTS_GLOB,
    MULTIPLE_WINDOWS_TESTS_GLOB,
    MIGRATE_ALL_TESTS_TO_COMPILER_SERVICE_GLOB,
    COMPILER_SERVICE_TESTS_GLOB
} = require('./gulp/constants/functional-test-globs');

const {
    CLIENT_TESTS_SETTINGS,
    CLIENT_TESTS_LOCAL_SETTINGS,
    CLIENT_TESTS_LEGACY_SETTINGS,
    CLIENT_TESTS_SAUCELABS_SETTINGS,
    CLIENT_TESTS_DESKTOP_BROWSERS,
    CLIENT_TESTS_MOBILE_BROWSERS
} = require('./gulp/constants/client-test-settings');

const readFile = promisify(fs.readFile);

gulpStep.install();

ll
    .install()
    .tasks([
        'lint',
        'check-licenses'
    ])
    .onlyInDebug([
        'styles',
        'client-scripts',
        'client-scripts-bundle'
    ]);

const ARGS          = minimist(process.argv.slice(2));
const QR_CODE       = 'qr-code' in ARGS;
const SKIP_BUILD    = process.env.SKIP_BUILD || 'skip-build' in ARGS;
const BROWSER_ALIAS = ARGS['browser-alias'];

const { PUBLISH_TAGS, PUBLISH_REPO } = getDockerPublishInfo(packageInfo);

const NODE_MODULE_BINS = path.join(__dirname, 'node_modules/.bin');

process.env.PATH = NODE_MODULE_BINS + path.delimiter + process.env.PATH + path.delimiter + NODE_MODULE_BINS;

process.env.DEV_MODE = ('dev' in ARGS).toString();

gulp.task('audit', () => {
    return npmAuditor()
        .then(result => {
            process.stdout.write(result.report);
            process.stdout.write('\n');

            if (result.exitCode !== 0)
                throw new Error('Security audit failed');
        });
});

gulp.task('clean', () => {
    return del('lib');
});


// Lint
gulp.task('lint', () => {
    const eslint = require('gulp-eslint');

    return gulp
        .src([
            'examples/**/*.js',
            'docker/*.js',
            'src/**/*.js',
            'src/**/*.ts',
            'test/**/*.js',
            'gulp/**/*.js',
            '!test/client/vendor/**/*.*',
            '!test/functional/fixtures/api/es-next/custom-client-scripts/data/*.js',
            'Gulpfile.js'
        ])
        .pipe(eslint())
        .pipe(eslint.format(process.env.ESLINT_FORMATTER))
        .pipe(eslint.failAfterError());
});

// License checker
gulp.task('check-licenses', () => {
    return checkLicenses();
});

// Build
const EMPTY_COMMENT_REGEXP = /^\s*\/\/\s*$/mg;
const EMPTY_LINES_REGEXP   = /^\s*$/mg;
const NEWLINE_REGEXP       = /^/mg;
const IDNENT_SPACE_REGEXP  = /^\s*\n(\s*)\S/;
const SPACE                = ' ';
const INDENT_SPACE_COUNT   = 4;

gulp.step('ts-defs', async () => {
    const partialPaths = await globby('ts-defs-src/*/**/*.d.ts');
    const partials     = {};

    for (const partialPath of partialPaths)
        partials[path.basename(partialPath)] = String(await readFile(partialPath));

    const stream = gulp
        .src('ts-defs-src/*.mustache')
        .pipe(mustache(
            {
                allowReferences: false,

                format: () => (text, render) => {
                    const renderedText = render(text);

                    const indent       = IDNENT_SPACE_REGEXP.exec(text);
                    const indentLength = indent[1].length - INDENT_SPACE_COUNT;

                    return renderedText
                        .replace(NEWLINE_REGEXP, SPACE.repeat(indentLength))
                        .replace(EMPTY_COMMENT_REGEXP, '')
                        .replace(EMPTY_LINES_REGEXP, '');
                }
            },
            {},
            partials
        ))
        .pipe(rename(file => {
            file.extname  = '';
        }))
        .pipe(gulp.dest('./ts-defs/'));


    await promisifyStream(stream);
});

gulp.step('client-scripts-bundle', () => {
    return childProcess
        .spawn('rollup -c', { shell: true, stdio: 'inherit', cwd: path.join(__dirname, 'src/client') });
});

gulp.step('client-scripts-templates-render', () => {
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

gulp.step('server-scripts-compile', () => {
    return childProcess
        .spawn('tsc -p src/tsconfig.json', { shell: true, stdio: 'inherit' });
});


// TODO: get rid of this step when we migrate to proper ES6 default imports
gulp.step('server-scripts-add-exports', () => {
    return gulp
        .src([
            'lib/**/*.js',
            '!lib/client/**/*.js'
        ])
        .pipe(moduleExportsTransform)
        .pipe(gulp.dest('lib'));
});

gulp.step('server-scripts', gulp.series('server-scripts-compile', 'server-scripts-add-exports'));

gulp.step('styles', () => {
    return gulp
        .src('src/**/*.less')
        .pipe(less())
        .pipe(gulp.dest('lib'));
});

gulp.step('templates', () => {
    return gulp
        .src([
            'src/**/*.mustache',
            '!src/**/*.js.wrapper.mustache'
        ])
        .pipe(gulp.dest('lib'));
});

gulp.step('images', () => {
    return gulp
        .src([
            'src/**/*.png',
            'src/**/*.ico',
            'src/**/*.svg'
        ])
        .pipe(gulp.dest('lib'));
});

//NOTE: Executing tasks in parallel can cause out-of-memory errors on Azure Pipelines
const buildTasks = process.env.TF_BUILD ? gulp.series : gulp.parallel;

gulp.step('package-content', buildTasks('ts-defs', 'server-scripts', 'client-scripts', 'styles', 'images', 'templates'));

gulp.task('fast-build', gulp.series('clean', 'package-content'));

gulp.task('build', process.env.DEV_MODE === 'true' ? gulp.registry().get('fast-build') : buildTasks('lint', 'fast-build'));

// Test
gulp.step('prepare-tests', gulp.registry().get(SKIP_BUILD ? 'lint' : 'build'));

gulp.step('test-server-run', () => {
    // HACK: We have to exit from all Gulp's error domains to avoid conflicts with error handling inside mocha tests
    const domains = exitDomains();

    try {
        return gulp
            .src('test/server/*-test.js', { read: false })
            .pipe(mocha({
                timeout: getTimeout(2000)
            }));
    }
    finally {
        enterDomains(domains);
    }
});

gulp.step('test-server-bootstrap', gulp.series('prepare-tests', 'test-server-run'));

gulp.task('test-server', gulp.parallel('check-licenses', 'test-server-bootstrap'));

gulp.step('test-client-run', () => {
    return testClient('test/client/fixtures/**/*-test.js', CLIENT_TESTS_SETTINGS);
});

gulp.task('test-client', gulp.series('prepare-tests', 'test-client-run'));

gulp.step('test-client-local-run', () => {
    return testClient('test/client/fixtures/**/*-test.js', CLIENT_TESTS_LOCAL_SETTINGS, {}, true);
});

gulp.task('test-client-local', gulp.series('prepare-tests', 'test-client-local-run'));

gulp.step('test-client-legacy-run', () => {
    return testClient('test/client/legacy-fixtures/**/*-test.js', CLIENT_TESTS_LEGACY_SETTINGS);
});

gulp.task('test-client-legacy', gulp.series('prepare-tests', 'test-client-legacy-run'));

gulp.step('test-client-travis-run', () => {
    const saucelabsSettings = CLIENT_TESTS_SAUCELABS_SETTINGS;

    saucelabsSettings.browsers = CLIENT_TESTS_DESKTOP_BROWSERS;

    return testClient('test/client/fixtures/**/*-test.js', CLIENT_TESTS_SETTINGS, saucelabsSettings);
});

gulp.task('test-client-travis', gulp.series('prepare-tests', 'test-client-travis-run'));

gulp.step('test-client-travis-mobile-run', () => {
    const saucelabsSettings = CLIENT_TESTS_SAUCELABS_SETTINGS;

    saucelabsSettings.browsers = CLIENT_TESTS_MOBILE_BROWSERS;

    return testClient('test/client/fixtures/**/*-test.js', CLIENT_TESTS_SETTINGS, saucelabsSettings);
});

gulp.task('test-client-travis-mobile', gulp.series('prepare-tests', 'test-client-travis-mobile-run'));

gulp.step('test-client-legacy-travis-run', () => {
    const saucelabsSettings = CLIENT_TESTS_SAUCELABS_SETTINGS;

    saucelabsSettings.browsers = CLIENT_TESTS_DESKTOP_BROWSERS;

    return testClient('test/client/legacy-fixtures/**/*-test.js', CLIENT_TESTS_LEGACY_SETTINGS, saucelabsSettings);
});

gulp.task('test-client-legacy-travis', gulp.series('prepare-tests', 'test-client-legacy-travis-run'));

gulp.step('test-client-legacy-travis-mobile-run', () => {
    const saucelabsSettings = CLIENT_TESTS_SAUCELABS_SETTINGS;

    saucelabsSettings.browsers = CLIENT_TESTS_MOBILE_BROWSERS;

    return testClient('test/client/legacy-fixtures/**/*-test.js', CLIENT_TESTS_LEGACY_SETTINGS, saucelabsSettings);
});

gulp.task('test-client-legacy-travis-mobile', gulp.series('prepare-tests', 'test-client-legacy-travis-mobile-run'));

gulp.step('test-functional-travis-desktop-osx-and-ms-edge-run', () => {
    return testFunctional(TESTS_GLOB, functionalTestConfig.testingEnvironmentNames.osXDesktopAndMSEdgeBrowsers);
});

gulp.task('test-functional-travis-desktop-osx-and-ms-edge', gulp.series('prepare-tests', 'test-functional-travis-desktop-osx-and-ms-edge-run'));

gulp.step('test-functional-travis-mobile-run', () => {
    return testFunctional(TESTS_GLOB, functionalTestConfig.testingEnvironmentNames.mobileBrowsers);
});

gulp.task('test-functional-travis-mobile', gulp.series('prepare-tests', 'test-functional-travis-mobile-run'));

gulp.step('test-functional-local-run', () => {
    return testFunctional(TESTS_GLOB, functionalTestConfig.testingEnvironmentNames.localBrowsers);
});

gulp.task('test-functional-local', gulp.series('prepare-tests', 'test-functional-local-run'));

gulp.step('test-functional-local-ie-run', () => {
    return testFunctional(TESTS_GLOB, functionalTestConfig.testingEnvironmentNames.localBrowsersIE);
});

gulp.task('test-functional-local-ie', gulp.series('prepare-tests', 'test-functional-local-ie-run'));

gulp.step('test-functional-local-chrome-firefox-run', () => {
    return testFunctional(TESTS_GLOB, functionalTestConfig.testingEnvironmentNames.localBrowsersChromeFirefox);
});

gulp.task('test-functional-local-chrome-firefox', gulp.series('prepare-tests', 'test-functional-local-chrome-firefox-run'));

gulp.step('test-functional-local-headless-chrome-run', () => {
    return testFunctional(TESTS_GLOB, functionalTestConfig.testingEnvironmentNames.localHeadlessChrome);
});

gulp.task('test-functional-local-headless-chrome', gulp.series('prepare-tests', 'test-functional-local-headless-chrome-run'));

gulp.step('test-functional-local-headless-firefox-run', () => {
    return testFunctional(TESTS_GLOB, functionalTestConfig.testingEnvironmentNames.localHeadlessFirefox);
});

gulp.task('test-functional-local-headless-firefox', gulp.series('prepare-tests', 'test-functional-local-headless-firefox-run'));

gulp.step('test-functional-remote-run', () => {
    if (QR_CODE)
        process.env.QR_CODE = 'true';

    if (BROWSER_ALIAS)
        process.env.BROWSER_ALIAS = BROWSER_ALIAS;

    return testFunctional(TESTS_GLOB, functionalTestConfig.testingEnvironmentNames.remote);
});

gulp.task('test-functional-remote', gulp.series('prepare-tests', 'test-functional-remote-run'));

gulp.step('test-functional-local-legacy-run', () => {
    return testFunctional(LEGACY_TESTS_GLOB, functionalTestConfig.testingEnvironmentNames.legacy);
});

gulp.task('test-functional-local-legacy', gulp.series('prepare-tests', 'test-functional-local-legacy-run'));

gulp.step('test-functional-local-multiple-windows-run', () => {
    return testFunctional(MULTIPLE_WINDOWS_TESTS_GLOB, functionalTestConfig.testingEnvironmentNames.localBrowsersChromeFirefox);
});

gulp.task('test-functional-local-multiple-windows', gulp.series('prepare-tests', 'test-functional-local-multiple-windows-run'));

gulp.step('test-functional-local-compiler-service-run', () => {
    return testFunctional(MIGRATE_ALL_TESTS_TO_COMPILER_SERVICE_GLOB.concat(COMPILER_SERVICE_TESTS_GLOB), functionalTestConfig.testingEnvironmentNames.localHeadlessChrome, { experimentalCompilerService: true });
});

gulp.task('test-functional-local-compiler-service', gulp.series('prepare-tests', 'test-functional-local-compiler-service-run'));

gulp.step('test-functional-local-proxyless-run', () => {
    return testFunctional(TESTS_GLOB, functionalTestConfig.testingEnvironmentNames.localHeadlessChrome, { isProxyless: true });
});

gulp.task('test-functional-local-proxyless', gulp.series('prepare-tests', 'test-functional-local-proxyless-run'));

gulp.task('docker-build', done => {
    childProcess.execSync('npm pack', { env: process.env }).toString();

    ensureDockerEnvironment();

    const packageId  = `${packageInfo.name}-${packageInfo.version}.tgz`;
    const tagCommand = PUBLISH_TAGS.map(tag => `-t ${PUBLISH_REPO}:${tag}`).join(' ');
    const command    = `docker build --no-cache --build-arg packageId=${packageId} ${tagCommand} -f docker/Dockerfile .`;

    childProcess.execSync(command, { stdio: 'inherit', env: process.env });

    done();
});

gulp.step('docker-server-test-run', done => {
    ensureDockerEnvironment();

    childProcess.execSync(`docker build --no-cache --build-arg tag=${packageInfo.version} -t docker-server-tests -f test/docker/Dockerfile .`,
        { stdio: 'inherit', env: process.env });

    childProcess.execSync('docker image rm docker-server-tests', { stdio: 'inherit', env: process.env });

    done();
});

gulp.step('docker-functional-test-run', () => {
    ensureDockerEnvironment();

    return runFunctionalTestInDocker(PUBLISH_REPO, packageInfo);
});

gulp.step('docker-publish-run', done => {
    const PUBLISH_COMMANDS = [
        'docker push',
        'docker pull',
        'docker image rm -f'
    ];

    PUBLISH_TAGS.forEach(tag => {
        PUBLISH_COMMANDS.forEach(command => {
            childProcess.execSync(`${command} ${PUBLISH_REPO}:${tag}`, { stdio: 'inherit', env: process.env });
        });
    });

    done();
});

gulp.task('docker-test', gulp.series('docker-build', 'docker-server-test-run', 'docker-functional-test-run'));

gulp.task('docker-test-travis', gulp.series('build', 'docker-test'));

gulp.task('docker-publish', gulp.series('docker-test', 'docker-publish-run'));

gulp.task('travis', process.env.GULP_TASK ? gulp.series(process.env.GULP_TASK) : () => {});
