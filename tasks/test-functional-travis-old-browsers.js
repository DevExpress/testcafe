var gulp = require('gulp');
var functionalTestConfig = require('../test/functional/config');
var config = require('./config.js');

gulp.task('test-functional-travis-old-browsers', ['build'], testFunctionalTravisOldBrowsersTask);

function testFunctionalTravisOldBrowsersTask () {
    return config.testFunctional('test/functional/fixtures', functionalTestConfig.testingEnvironmentNames.oldBrowsers);
}
