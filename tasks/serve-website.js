var gulp = require('gulp');
var config = require('./config.js');
var connect = require('connect');
var serveStatic = require('serve-static');

gulp.task('serve-website', serveWebsiteTask);

function serveWebsiteTask (cb) {
    var app = connect().use('/testcafe', serveStatic('site/deploy'));

    config.websiteServer = app.listen(8080, cb);
}
