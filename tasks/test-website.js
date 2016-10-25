var gulp = require('gulp');
var config = require('./config.js');

gulp.task('test-website', testWebsiteTask);

function testWebsiteTask () {
    return config.testWebsite(false);
}
