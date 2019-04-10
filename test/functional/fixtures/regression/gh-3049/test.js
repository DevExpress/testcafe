const path           = require('path');
const createTestCafe = require('../../../../../lib');
const config         = require('../../../config.js');

const isLocalChrome = config.useLocalBrowsers && config.browsers.some(browser => browser.alias.indexOf('chrome') > -1);

if (isLocalChrome) {
    describe('[Regression](GH-3049) - Should increase small browser window', function () {
        it('Run browser with minimal window size', function () {

            return createTestCafe('127.0.0.1', 1335, 1336)
                .then(tc => {
                    testCafe = tc;
                })
                .then(() => {
                    const headless = config.useHeadlessBrowsers ? ':headless' : '';

                    return testCafe.createRunner()
                        .browsers(`chrome${headless} --window-size=1,1`)
                        .src(path.join(__dirname, './testcafe-fixtures/index.js'))
                        .run();
                })
                .then(err => {
                    testCafe.close();

                    if (err)
                        throw new Error('Error occured');
                });
        });
    });
}
