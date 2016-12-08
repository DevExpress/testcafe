var gulp = require('gulp');
var functionalTestConfig = require('../test/functional/config');
var config = require('./config.js');

gulp.task('test-functional-travis-mobile', ['build'], testFunctionalTravisMobileTask);

function testFunctionalTravisMobileTask () {
    return config.testFunctional('test/functional/fixtures', functionalTestConfig.testingEnvironmentNames.saucelabsMobileBrowsers);
}
