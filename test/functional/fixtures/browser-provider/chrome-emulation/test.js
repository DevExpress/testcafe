const path                 = require('path');
const expect               = require('chai').expect;
const config               = require('../../../config');
const { createNullStream } = require('../../../utils/stream');


if (config.useLocalBrowsers) {
    describe('Browser Provider - Chrome Emulation Mode', () => {
        it('Should emulate touch event handlers', () => {
            return testCafe
                .createRunner()
                .src(path.join(__dirname, './testcafe-fixtures/index-test.js'))
                .filter(fixtureName => fixtureName === 'Check presence of touch event handlers')
                .reporter('minimal', createNullStream())
                .browsers('chrome:headless:emulation:device=iphone 6 --no-sandbox')
                .run()
                .then(failedCount => {
                    expect(failedCount).eql(0);
                });
        });
    });
}

