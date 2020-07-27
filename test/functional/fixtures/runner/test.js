const path       = require('path');
const os         = require('os-family');
const { expect } = require('chai');
const config     = require('../../config');

function run (browsers, testFile) {
    return testCafe
        .createRunner()
        .src(path.join(__dirname, testFile))
        .browsers(browsers)
        .run();
}

describe('Runner', () => {
    if (config.useLocalBrowsers && !config.useHeadlessBrowsers && os.linux) {
        let originalDisplay = null;

        before(() => {
            originalDisplay = process.env.DISPLAY;

            process.env.DISPLAY = '';
        });

        after(() => {
            process.env.DISPLAY = originalDisplay;
        });

        it('Should throw an error when tests are run on Linux without graphical subsystem', async () => {
            try {
                await run('chromium', './testcafe-fixtures/basic-test.js');

                throw new Error('Promise rejection expected');
            }
            catch (err) {
                expect(err.message).eql(
                    `Your Linux version does not have a graphic subsystem to run chromium with a GUI. ` +
                    `You can launch the browser in headless mode. ` +
                    `If you use a portable browser version, ` +
                    `specify the browser alias before the path instead of the 'path' prefix. ` +
                    `For more information, see ` +
                    `https://devexpress.github.io/testcafe/documentation/guides/concepts/browsers.html#test-in-headless-mode`
                );
            }
        });
    }
});
