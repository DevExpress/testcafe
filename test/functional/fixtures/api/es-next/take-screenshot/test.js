var expect                  = require('chai').expect;
var config                  = require('../../../../config.js');
var checkScreenshotsCreated = require('../../../../assertion-helper.js').checkScreenshotsCreated;


var testOnTravis = config.isTravisTask;


describe('[API] t.takeScreenshot()', function () {
    it('Should take a screenshot', function () {
        return runTests('./testcafe-fixtures/take-screenshot.js', 'Take a screenshot',
            { setScreenshotPath: true, only: 'local' })
            .then(checkScreenshotsCreated)
            .then(function (success) {
                if (!testOnTravis)
                    expect(success).eql(true);
            });
    });

    it('Should take a screenshot with a custom path', function () {
        return runTests('./testcafe-fixtures/take-screenshot.js', 'Take a screenshot with a custom path',
            { setScreenshotPath: true, only: 'local' })
            .then(checkScreenshotsCreated)
            .then(function (success) {
                if (!testOnTravis)
                    expect(success).eql(true);
            });
    });

    it('Should not take a screenshot without setting screenshotPath', function () {
        return runTests('./testcafe-fixtures/take-screenshot.js', 'Take a screenshot', { only: 'local' })
            .then(function () {
                return checkScreenshotsCreated(true);
            })
            .then(function (success) {
                if (!testOnTravis)
                    expect(success).eql(true);
            });
    });
});
