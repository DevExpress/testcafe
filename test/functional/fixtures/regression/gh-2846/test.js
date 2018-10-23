const config = require('../../../config');
const expect = require('chai').expect;

if (config.useHeadlessBrowsers) {
    describe('[Regression](GH-2846)', function () {
        it('Should add warning on t.debug', function () {
            return runTests('./testcafe-fixtures/index.js')
                .then(() => {
                    expect(testReport.warnings).eql(['It is not allowed to debug in Headless mode']);
                });
        });
    });
}

