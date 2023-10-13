const createTestCafe     = require('../../../../../lib');
const { createReporter } = require('../../../utils/reporter');
const { expect }         = require('chai');
const path               = require('path');
const config             = require('../../../config');
let testcafe             = null;
let errors               = null;


const reporter = createReporter({
    reportTestDone (name, testRunInfo) {
        errors = testRunInfo.errs;
    },
});

if (config.nativeAutomation) {
    describe('gh-318 Chrome Emulation Mode', () => {
        it('Should finish test after click', async () => {
            await createTestCafe('127.0.0.1', 1335, 1336)
                .then(tc => {
                    testcafe = tc;
                })
                .then(() => {
                    return testcafe
                        .createRunner()
                        .src(path.join(__dirname, './testcafe-fixtures/touch-emulation-test.js'))
                        .reporter(reporter)
                        .browsers('chrome:headless:emulation:device=iphone X')
                        .run();
                })
                .then(() => expect(errors.length).eql(0))
                .finally(() => testcafe.close());
        });
    });
}
