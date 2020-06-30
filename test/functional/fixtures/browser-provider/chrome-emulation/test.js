const path                 = require('path');
const chai                 = require('chai');
const { expect }           = require('chai');
const config               = require('../../../config');
const { createNullStream } = require('../../../utils/stream');
const { createReporter }   = require('../../../utils/reporter');

chai.use(require('chai-string'));

if (config.useLocalBrowsers) {
    describe('Browser Provider - Chrome Emulation Mode', () => {
        it.only('Should emulate touch event handlers', () => {
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

        it('Should provide emulating device for user agent', async () => {
            let prettyUserAgents = null;

            const reporter = createReporter({
                reportTaskStart (startTime, userAgents) {
                    prettyUserAgents = userAgents;
                }
            });

            await testCafe
                .createRunner()
                .src(path.join(__dirname, './testcafe-fixtures/index-test.js'))
                .reporter(reporter)
                .browsers('chrome:headless:emulation:device=iphone X --no-sandbox')
                .run();

            expect(prettyUserAgents.length).eql(1);
            expect(prettyUserAgents[0]).endsWith('(Emulating iPhone X)');
        });
    });
}

