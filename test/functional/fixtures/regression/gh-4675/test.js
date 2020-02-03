const path           = require('path');
const expect         = require('chai').expect;
const createTestCafe = require('../../../../../lib');
const config         = require('../../../config.js');

function customReporter (name) {
    return () => {
        return {
            name: name,
            reportTestDone () { },
            reportFixtureStart () { },
            reportTaskStart () {
                this.write('');
            },
            reportTaskDone () { }
        };
    };
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
                    expect(error.message).eql('The following reporters attempted to write to the same output stream: "custom1, custom2". Only one reporter can write to a stream.');
                });
        });
    });
}
