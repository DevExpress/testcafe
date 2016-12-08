var gulp = require('gulp');
var functionalTestConfig = require('../test/functional/config');
var config = require('./config.js');

gulp.task('test-functional-travis-legacy', ['build'], testFunctionalTravisLegacyTask);

function testFunctionalTravisLegacyTask () {
    return config.testFunctional('test/functional/legacy-fixtures', functionalTestConfig.testingEnvironmentNames.legacy);
}
