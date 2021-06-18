const { expect }              = require('chai');
const { noop }                = require('lodash');
const BrowserConnection       = require('../../lib/browser/connection');
const Test                    = require('../../lib/api/structure/test');
const Bootstrapper            = require('../../lib/runner/bootstrapper');
const delay                   = require('../../lib/utils/delay');

describe('Bootstrapper', () => {
    describe('.createRunnableConfiguration()', () => {
        it('Browser connection error message should include hint that tests compilation takes too long', async function () {
            this.timeout(3000);

            const browserConnectionGateway = {
                startServingConnection: noop,
                stopServingConnection:  noop
            };

            const compilerService = {
                init:     noop,
                getTests: async () => {
                    await delay(1500);

                    return [ new Test({ currentFixture: void 0 }) ];
                }
            };

            const bootstrapper = new Bootstrapper({ browserConnectionGateway, compilerService });

            bootstrapper.browserInitTimeout           = 100;
            bootstrapper.TESTS_COMPILATION_UPPERBOUND = 0;

            const provider = {
                openBrowser:       noop,
                isLocalBrowser:    noop,
                isHeadlessBrowser: () => true,
                closeBrowser:      noop
            };

            bootstrapper.browsers = [ new BrowserConnection(browserConnectionGateway, { provider }) ];

            try {
                await bootstrapper.createRunnableConfiguration();

                throw new Error('Promise rejection expected');
            }
            catch (err) {
                expect(err.message).contains('Tests took too long to compile');
            }
        });
    });
});
