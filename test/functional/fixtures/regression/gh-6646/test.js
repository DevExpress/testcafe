const expect = require('chai').expect;

const config             = require('../../../config');
const { createReporter } = require('../../../utils/reporter');

let testErrors     = null;
const actionErrors = [];

const reporter = createReporter({
    reportTestActionDone (name, { err }) {
        actionErrors.push(err);
    },
    reportTestDone (name, testRunInfo) {
        testErrors = testRunInfo.errs;
    },
});

// TODO: Stabilize test on macOS
(config.hasBrowser('safari') ? describe.skip : describe)('Should pass the "error.id" argument to the reporter', function () {
    it('Action error', function () {
        return runTests('./testcafe-fixtures/index.js', 'Action error', {
            reporter,
            selectorTimeout: 100,
        })
            .then(function () {
                expect(testErrors.length).eql(config.browsers.length);
                expect(testErrors.length).eql(actionErrors.length);

                for (const err of testErrors) {
                    expect(!!err.id).eql(true);
                    expect(!!testErrors.find(e => e.id === err.id)).eql(true);
                }
            });
    });

});


