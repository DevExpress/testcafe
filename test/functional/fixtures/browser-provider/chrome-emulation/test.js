const path    = require('path');
const expect  = require('chai').expect;
const config  = require('../../../config');


const NULL_STREAM = { write: () => {}, end: () => {} };

if (config.useLocalBrowsers) {
    describe('Browser Provider - Chrome Emulation Mode', function () {
        it('Should emulate touch event handlers', function () {
            return testCafe
                .createRunner()
                .src(path.join(__dirname, './testcafe-fixtures/index-test.js'))
                .filter(fixtureName => fixtureName === 'Check presence of touch event handlers')
                .reporter('minimal', NULL_STREAM)
                .browsers('chrome:headless:emulation:device=iphone 6')
                .run()
                .then(failedCount => {
                    expect(failedCount).eql(0);
                });
        });
    });
}

