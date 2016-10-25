var gulp = require('gulp');
var functionalTestConfig = require('../test/functional/config');
var config = require('./config.js');

gulp.task('test-functional-travis-desktop-osx-and-ms-edge', ['build'], testFunctionalTravisDesktopOsxAndMsEdgeTask);

function testFunctionalTravisDesktopOsxAndMsEdgeTask () {
    return config.testFunctional('test/functional/fixtures', functionalTestConfig.testingEnvironmentNames.saucelabsOSXDesktopAndMSEdgeBrowsers);
}
