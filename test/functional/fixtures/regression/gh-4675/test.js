const path               = require('path');
const { expect }         = require('chai');
const createTestCafe     = require('../../../../../lib');
const config             = require('../../../config.js');
const { createReporter } = require('../../../utils/reporter');

function customReporter (name) {
    return createReporter({
        name,
        reportTaskStart () {
            this.write('');
        }
    });
}

let testCafe = null;

if (config.useLocalBrowsers && !config.useHeadlessBrowsers) {
    describe('[Regression](GH-4675) - Should raise an error if several reporters are going to write to the stdout', function () {
        it('Should raise an error if several reporters are going to write to the stdout', function () {
            let error = null;

            return createTestCafe('127.0.0.1', 1335, 1336)
                .then(tc => {
                    testCafe = tc;
                })
                .then(() => {
                    return testCafe.createRunner()
                        .browsers(`chrome`)
                        .src(path.join(__dirname, './testcafe-fixtures/index.js'))
                        .reporter([customReporter('custom1'), customReporter('custom2')])
                        .run();
                })
                .catch(err => {
                    error = err;

                    return testCafe.close();
                })
                .finally(() => {
                    expect(error.message).eql('Reporters cannot share output streams. The following reporters interfere with one another: "custom1, custom2".');
                });
        });
    });
}
