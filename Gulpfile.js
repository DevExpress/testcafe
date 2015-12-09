var babel        = require('babel');
var gulp         = require('gulp');
var gulpBabel    = require('gulp-babel');
var gulpLess     = require('gulp-less');
var eslint       = require('gulp-eslint');
var ghPages      = require('gulp-gh-pages');
var git          = require('gulp-git');
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
var Promise      = require('es6-promise').Promise;
var opn          = require('opn');
var connect      = require('connect');
var readline     = require('readline');
var spawn        = require('child_process').spawn;
var serveStatic  = require('serve-static');

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

var server, sockets = [];

gulp.task('clean', function (cb) {
    del('lib', cb);
});


// Lint
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


// Build
gulp.task('client-scripts', ['client-scripts-bundle'], function () {
    var scripts = [
        { wrapper: 'src/client/core/index.js.wrapper.mustache', src: 'lib/client/core/index.js' },
        { wrapper: 'src/client/ui/index.js.wrapper.mustache', src: 'lib/client/ui/index.js' },
        { wrapper: 'src/client/runner/index.js.wrapper.mustache', src: 'lib/client/runner/index.js' }
    ];

    return Promise.all(scripts.map(function (script) {
        return gulp
            .src(script.wrapper)
            .pipe(mustache({ source: fs.readFileSync(script.src).toString() }))
            .pipe(rename(path.basename(script.src)))
            .pipe(gulpif(!util.env.dev, uglify()))
            .pipe(gulp.dest(path.dirname(script.src)));
    }));
});

gulp.task('client-scripts-bundle', ['clean'], function () {
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

                return { code: transformed.code };
            }
        }))
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
        .pipe(gulpLess())
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

//Documentation
gulp.task('clear-site', function() {
	return del('./site');		
});

gulp.task('fetch-assets-repo', ['clear-site'], function(cb) {
//	git.clone('https://github.com/VasilyStrelyaev/testcafe-gh-page-assets.git', {args: './site'}, function (e) {
//		if (e) return cb(e);
//		cb();
//	});
	return gulp.src('../testcafe-gh-page-assets/**/*')
		.pipe(gulp.dest('./site'));	
});

gulp.task('put-in-articles', ['fetch-assets-repo'], function() {
	return gulp.src('./docs/articles/**/*')
		.pipe(gulp.dest('./site/src'));	
});

gulp.task('put-in-navigation', ['put-in-articles'], function() {
	return gulp.src('./docs/_data/**/*')
		.pipe(gulp.dest('./site/src/_data'));	
});

gulp.task('put-in-docs', ['put-in-articles', 'put-in-navigation']);

gulp.task('prepare-website', ['fetch-assets-repo', 'put-in-docs']);

gulp.task('deploy-to-gh-pages', ['prepare-website'], function() {
	return gulp.src('./site/src/**/*')
		.pipe(ghPages());
});

gulp.task('build-website', ['prepare-website'], function(cb){
    var cp = spawn('jekyll.bat', ['build', '--source', './site/src/', '--destination', './site/deploy']);

    cp.on('exit', function(code) {
        cb(code === 0 ? null : 'ERROR: Jekyll process exited with code: ' + code);
    });
});

gulp.task('serve-website', ['build-website'], function() {
	server = connect().use('/testcafe', serveStatic('./site/deploy')).listen(8080);
	server.on('connection', function(socket) {
        sockets.push(socket);
        socket.on('close', function() { 
			sockets.splice(sockets.indexOf(socket), 1);
		});
    });
});

gulp.task('open-website', ['serve-website'], function(){
	opn('http://localhost:8080/testcafe');
});

gulp.task('prompt-web-server-close', ['open-website'], function(cb) {
	var rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	
	rl.question("Press Enter to terminate the web server...", function() {
		rl.close();
		server.close(function(e) {
			if(e) return cb(e);
			cb();
		});
		console.log("Server stopped.");
		sockets.forEach(function(socket) {
			socket.destroy();
		});
	});
});

gulp.task('preview-website', ['prompt-web-server-close']);

// Publish
gulp.task('publish', ['test-server'], function () {
    // TODO switch publish tag once we'll be ready to release
    return publish({ tag: 'alpha' });
});