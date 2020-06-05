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

        it('Should provide emulating device for user agent', async () => {
            let prettyUserAgents = null;

            const customReporter = () => ({
                reportTaskStart (startTime, userAgents) {
                    prettyUserAgents = userAgents;
                },
                reportTestDone () {},
                reportFixtureStart () {},
                reportTaskDone () {}
            });

            await testCafe
                .createRunner()
                .src(path.join(__dirname, './testcafe-fixtures/index-test.js'))
                .reporter(customReporter)
                .browsers('chrome:headless:emulation:device=iphone X --no-sandbox')
                .run();

            expect(prettyUserAgents.length).eql(1);
            expect(prettyUserAgents[0]).to.include('(Emulating iPhone X)');
        });
    });
}

