var expect                     = require('chai').expect;
var config                     = require('../../config');
var quarantineModeTracker      = require('../../quarantine-mode-tracker');
var errorInEachBrowserContains = require('../../assertion-helper.js').errorInEachBrowserContains;


function checkQuarantineTestRuns (quarantineState) {
    var browsers = quarantineState === 'failed-quarantine' ?
        quarantineModeTracker.browsersFailingQuarantine :
        quarantineModeTracker.browsersPassingQuarantine;

    var browserAgents = Object.keys(browsers);

    expect(browserAgents.length).to.equal(config.browsers.length);

    // NOTE: 4 runs in total:
    // failing sequence: 1st run - fail, 2nd - pass, 3rd and 4th - fail
    // passing sequence: 1st run - fail, 2nd, 3rd and 4th - pass
    browserAgents.forEach(function (ua) {
        expect(browsers[ua].step).to.equal(4);
    });
}


describe('Quarantine mode tests', function () {

    afterEach(function () {
        quarantineModeTracker.clearFailingBrowsers();
        quarantineModeTracker.clearPassingBrowsers();
    });

    it('Should pass if an unstable test passes in most of runs', function () {
        return runTests('testcafe-fixtures/passing-quarantine.test.js', 'Wait 200ms', { quarantineMode: true })
            .then(function () {
                checkQuarantineTestRuns('passed-quarantine');

                expect(testReport.unstable).to.be.true;
            });
    });

    it('Should fail if an unstable test fails in most of runs', function () {
        return runTests('testcafe-fixtures/failing-quarantine.test.js', 'Wait 200ms', {
            shouldFail:     true,
            quarantineMode: true
        })
            .catch(function (errs) {
                var expectedError = 'Failed by request! on page';

                checkQuarantineTestRuns('failed-quarantine');

                expect(testReport.unstable).to.be.true;

                errorInEachBrowserContains(errs, expectedError, 0);
            });
    });
});
