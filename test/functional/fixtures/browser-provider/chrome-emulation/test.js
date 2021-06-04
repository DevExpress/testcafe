const path                 = require('path');
const { expect }           = require('chai');
const config               = require('../../../config');
const { createNullStream } = require('../../../utils/stream');
const { createReporter }   = require('../../../utils/reporter');
const os                   = require('os-family');
const detectDisplay        = require('../../../../../lib/utils/detect-display');

const isLinuxWithoutGUI = os.linux && !detectDisplay();

if (config.useLocalBrowsers) {
    describe('Browser Provider - Chrome Emulation Mode', () => {
        describe('Should emulate touch event handlers', () => {
            async function checkTouchEmulation (browserAlias) {
                const failedCount = await testCafe
                    .createRunner()
                    .src(path.join(__dirname, './testcafe-fixtures/index-test.js'))
                    .filter(fixtureName => fixtureName === 'Check presence of touch event handlers')
                    .reporter('minimal', createNullStream())
                    .browsers(browserAlias)
                    .run();

                expect(failedCount).eql(0);
            }

            if (!config.isProxyless) {
                it('headless', () => {
                    return checkTouchEmulation('chrome:headless:emulation:device=iphone 6 --no-sandbox');
                });
            }

            if (!isLinuxWithoutGUI) {
                it('non-headless', () => {
                    return checkTouchEmulation('chrome:emulation:device=iphone 6 --no-sandbox');
                });
            }
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
