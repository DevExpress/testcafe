const config                    = require('../../../config');
const { expect }                = require('chai');
const { createWarningReporter } = require('../../../utils/warning-reporter');

if (config.useHeadlessBrowsers) {
    describe('[Regression](GH-2846)', function () {
        it('Should add warning on t.debug', function () {
            const { reporter, assertReporterWarnings, warningResult } = createWarningReporter();

            return runTests('./testcafe-fixtures/index.js', null, { reporter })
                .then(() => {
                    assertReporterWarnings('debug');
                    expect(warningResult.warnings.length).eql(1);
                    expect(warningResult.warnings[0].message).eql('You cannot debug in headless mode.');
                });
        });
    });
}

