var gulp = require('gulp');
var mocha = require('gulp-mocha');

// Test
gulp.task('test-server', ['build'], testServerTask);

function testServerTask () {
    return gulp
        .src('test/server/*-test.js')
        .pipe(mocha({
            ui:       'bdd',
            reporter: 'spec',
            timeout:  typeof v8debug === 'undefined' ? 2000 : Infinity // NOTE: disable timeouts in debug
        }));
}
