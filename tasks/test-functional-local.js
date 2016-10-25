var gulp = require('gulp');
var functionalTestConfig = require('../test/functional/config');
var config = require('./config.js');

gulp.task('test-functional-local', ['build'], testFunctionalLocalTask);

function testFunctionalLocalTask () {
    return config.testFunctional('test/functional/fixtures', functionalTestConfig.testingEnvironmentNames.localBrowsers);
}
