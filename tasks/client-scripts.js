var gulp = require('gulp');
var Promise = require('pinkie');
var mustache = require('gulp-mustache');
var fs = require('fs');
var rename = require('gulp-rename');
var path = require('path');
var gulpif = require('gulp-if');
var util = require('gulp-util');
var uglify = require('gulp-uglify');

// Build

gulp.task('client-scripts', ['client-scripts-bundle'], clientScriptsTask);

function clientScriptsTask () {
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
}
