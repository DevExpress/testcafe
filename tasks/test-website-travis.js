var gulp = require('gulp');
var config = require('./config.js');

gulp.task('test-website-travis', testWebsiteTravisTask);

function testWebsiteTravisTask () {
    return config.testWebsite(true);
}
