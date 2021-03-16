const expect = require('chai').expect;

describe('Page Load timeout', () => {
    describe('Run level', () => {
        describe('Should wait for the window.load event if necessary', function () {
            it('Should wait for the window.load event if there are user event handlers for it', function () {
                return runTests('testcafe-fixtures/run-level.js', 'Wait for window.load', { pageLoadTimeout: 10000 });
            });

            it("Shouldn't wait for the window.load event more than timeout", function () {
                return runTests('testcafe-fixtures/run-level.js', "Don't wait for window.load more than timeout", { pageLoadTimeout: 0 });
            });

            it("Shouldn't wait for the window.load event if there are no user event handlers for it", function () {
                return runTests('testcafe-fixtures/run-level.js', "Don't wait for window.load", { pageLoadTimeout: 10000 });
            });
        });
    });

    describe('Test level', () => {
        it("Shouldn't wait for the window.load when the timeout is set to '0'", function () {
            return runTests('testcafe-fixtures/test-level.js', "Don't wait for window.load", { pageLoadTimeout: 100000 });
        });

        it('Should wait for the window.load event if there are user event handlers for it', function () {
            return runTests('testcafe-fixtures/test-level.js', 'Wait for window.load', { pageLoadTimeout: 0 });
        });

        it('Should wait for the window.load event in iframe', function () {
            return runTests('testcafe-fixtures/test-level.js', 'Wait for window.load in iframe', {
                pageLoadTimeout: 0,
                selectorTimeout: 10000
            });
        });

        it('Should raise a deprecation warning if the `t.setPageLoadTimeout` method is used', function () {
            return runTests('testcafe-fixtures/test-level.js', 'The `t.setPageLoadTimeout` method should raise a deprecation warning')
                .then(() => {
                    expect(testReport.warnings).eql([
                        'The \'t.setPageLoadTimeout\' method is deprecated ' +
                        'and will be removed in the next major release. ' +
                        'Use the \'test.timeouts\' method to set the \'pageLoadTimeout\' instead.\n\n'
                    ]);
                });
        });
    });
});
