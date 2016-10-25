var gulp = require('gulp');
var runSequence = require('run-sequence');
var Promise = require('pinkie');
var opn = require('opn');

gulp.task('preview-website', previewWebsiteTask);

function previewWebsiteTask () {
    return new Promise(function (resolve) {
        runSequence('build-website-development', 'serve-website', resolve);
    })
    .then(function () {
        return opn('http://localhost:8080/testcafe');
    });
}
