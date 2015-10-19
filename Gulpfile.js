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
var less         = require('less');
var merge        = require('merge-stream');
var path         = require('path');
var Promise      = require('es6-promise').Promise;
var promisify    = require('es6-promisify');


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

    css: [{ src: '/ui.css', path: './lib/client/ui/styles.css' }],

    configApp: require('./test/client/config-qunit-server-app')
};

var CLIENT_TESTS_BROWSERS = [
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

var UI_STYLES_FILE_PATH = '/client/ui';
var UI_STYLES_TEMP_DIR  = path.join('lib', UI_STYLES_FILE_PATH);


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


//Styles
gulp.task('styles-temp-copy', ['clean'], function () {
    return gulp
        .src(path.join('src', UI_STYLES_FILE_PATH, 'styles.less'))
        .pipe(gulp.dest(UI_STYLES_TEMP_DIR));
});

gulp.task('build-styles', ['styles-temp-copy'], function () {
    var SHADOW_UI_CLASSNAME_POSTFIX = require('./node_modules/testcafe-hammerhead/lib/const').SHADOW_UI_CLASSNAME_POSTFIX;
    var TEMP_SRC_FILE               = path.join(process.cwd(), UI_STYLES_TEMP_DIR, 'styles.less');

    var readFile  = promisify(fs.readFile);
    var writeFile = promisify(fs.writeFile);
    var unlink    = promisify(fs.unlink);

    //NOTE: add unique UI postfix to each LESS class and id selector
    function processSelector (selector) {
        if (selector.elements) {
            selector.elements.forEach(function (element) {
                var isPureMixin      = typeof element.index === 'undefined';
                var isTargetSelector = element.value && (element.value.indexOf('.') === 0 ||
                                                         element.value.indexOf('#') === 0);

                if (isTargetSelector && !isPureMixin)
                    element.value += SHADOW_UI_CLASSNAME_POSTFIX;
            });
        }
    }

    function addUIClassPostfix (lessRules) {
        lessRules.forEach(function (rule) {
            if (rule.selectors)
                rule.selectors.forEach(processSelector);

            if (rule.rules)
                addUIClassPostfix(rule.rules);
        });
    }

    function parseLess (src) {
        return new Promise(function (resolve, reject) {
            var parser = new less.Parser();

            src = src.toString();

            parser.parse(src, function (parseErr, tree) {
                if (parseErr)
                    reject('Failed to parse client runtime LESS: ' + parseErr.message);
                else
                    resolve(tree);
            });
        });
    }

    return readFile(TEMP_SRC_FILE)
        .then(parseLess)
        .then(function (tree) {
            addUIClassPostfix([tree]);

            return writeFile(path.join('lib', UI_STYLES_FILE_PATH, 'styles.css'), tree.toCSS());
        })
        .then(function () {
            return unlink(TEMP_SRC_FILE);
        });
});


//Build
gulp.task('build', ['lint', 'wrap-scripts-with-templates', 'build-styles'], function () {
    var js = gulp
        .src([
            'src/**/*.js',
            '!src/client/**/*.js'
        ])
        .pipe(gulpBabel());

    var styles = gulp
        .src([
            'src/**/*.less',
            '!' + path.join('src', UI_STYLES_FILE_PATH, 'styles.less')
        ])
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
