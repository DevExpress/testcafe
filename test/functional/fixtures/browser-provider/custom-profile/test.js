const path                 = require('path');
const { expect }           = require('chai');
const Promise              = require('pinkie');
const config               = require('../../../config');
const nullStream           = require('../../../utils/null-stream');
const createChromeProfile  = require('../../../../../lib/browser/provider/built-in/chrome/create-temp-profile');
const createFirefoxProfile = require('../../../../../lib/browser/provider/built-in/firefox/create-temp-profile');


if (config.useLocalBrowsers && !config.isTravisEnvironment) {
    describe('Browser Provider - Custom User Profile', function () {
        it('Should run tests in userProfile mode', function () {
            return testCafe
                .createRunner()
                .src(path.join(__dirname, './testcafe-fixtures/index-test.js'))
                .reporter('minimal', nullStream)
                .browsers('chrome:userProfile', 'firefox:userProfile')
                .run()
                .then(failedCount => {
                    expect(failedCount).eql(0);
                });
        });

        it('Should run tests with the explicitly specified profile', function () {
            return Promise
                .all([createChromeProfile('localhost'), createFirefoxProfile({ config: {} })])
                .then(([chromeProfile, firefoxProfile]) => {
                    return testCafe
                        .createRunner()
                        .src(path.join(__dirname, './testcafe-fixtures/index-test.js'))
                        .reporter('minimal', nullStream)
                        .browsers(`chrome --user-data-dir=${chromeProfile.name}`, `firefox -profile ${firefoxProfile.name}`)
                        .run();
                })
                .then(failedCount => {
                    expect(failedCount).eql(0);
                });
        });
    });
}
