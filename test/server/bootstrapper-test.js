const proxyquire              = require('proxyquire');
const { expect }              = require('chai');
const { noop }                = require('lodash');
const isAlpine                = require('./helpers/is-alpine');
const BrowserConnectionStatus = require('../../lib/browser/connection/status');
const BrowserConnection       = require('../../lib/browser/connection');
const Test                    = require('../../lib/api/structure/test');
const browserProviderPool     = require('../../lib/browser/provider/pool');
const Bootstrapper            = require('../../lib/runner/bootstrapper');
const delay                   = require('../../lib/utils/delay');


const BROWSER_NAME = isAlpine() ? 'chromium' : 'chrome';

class BrowserConnectionMock extends BrowserConnection {
    constructor (...args) {
        super(...args);

        this.status = BrowserConnectionStatus.opened;
    }
}

function setupBootstrapper () {
    const BootstrapperMock = proxyquire('../../lib/runner/bootstrapper', {
        '../browser/connection':   BrowserConnectionMock,
        '../utils/detect-display': () => false,
        'os-family':               { linux: true, win: false, mac: false },
    });

    const browserConnectionGateway = {
        startServingConnection: noop,
        stopServingConnection:  noop
    };

    const compilerService = {
        init:     noop,
        getTests: () => [ new Test({ currentFixture: void 0 }) ]
    };

    return new BootstrapperMock(browserConnectionGateway, compilerService);
}

describe('Bootstrapper', () => {
    describe('.createRunnableConfiguration()', () => {
        describe('On Linux without a graphics subsystem', () => {
            let bootstrapper = null;

            beforeEach(() => {
                bootstrapper = setupBootstrapper();
            });

            it('Should raise an error when browser is specified as non-headless', async function () {
                this.timeout(3000);

                bootstrapper.browsers = [ BROWSER_NAME ];

                try {
                    await bootstrapper.createRunnableConfiguration();

                    throw new Error('Promise rejection expected');
                }
                catch (err) {
                    expect(err.message).eql(
                        `Your Linux version does not have a graphic subsystem to run ${BROWSER_NAME} with a GUI. ` +
                        `You can launch the browser in headless mode. ` +
                        `If you use a portable browser version, ` +
                        `specify the browser alias before the path instead of the 'path' prefix. ` +
                        `For more information, see ` +
                        `https://devexpress.github.io/testcafe/documentation/guides/concepts/browsers.html#test-in-headless-mode`
                    );
                }
            });

            it('Should raise an error when browser is specified by a path', async () => {
                bootstrapper.browsers = [ { path: '/non/exist' } ];

                try {
                    await bootstrapper.createRunnableConfiguration();

                    throw new Error('Promise rejection expected');
                }
                catch (err) {
                    expect(err.message).eql(
                        `Your Linux version does not have a graphic subsystem to run {"path":"/non/exist"} with a GUI. ` +
                        `You can launch the browser in headless mode. ` +
                        `If you use a portable browser version, ` +
                        `specify the browser alias before the path instead of the 'path' prefix. ` +
                        `For more information, see ` +
                        `https://devexpress.github.io/testcafe/documentation/guides/concepts/browsers.html#test-in-headless-mode`
                    );
                }
            });

            it('Should not raise an error when browser is specified as headless', async () => {
                bootstrapper.browsers = [ `${BROWSER_NAME}:headless` ];

                let isErrorThrown = false;

                try {
                    await bootstrapper.createRunnableConfiguration();
                }
                catch (err) {
                    isErrorThrown = true;
                }
                finally {
                    expect(isErrorThrown).to.be.false;
                }
            });

            it('Should not raise an error when remote browser is passed as BrowserConnection', async () => {
                const browserConnectionGateway = {
                    startServingConnection: noop,
                    stopServingConnection:  noop
                };

                const browserInfo = await browserProviderPool.getBrowserInfo('remote');

                bootstrapper.browsers = [ new BrowserConnection(browserConnectionGateway, browserInfo) ];

                let isErrorThrown = false;

                try {
                    await bootstrapper.createRunnableConfiguration();
                }
                catch (err) {
                    isErrorThrown = true;
                }
                finally {
                    expect(isErrorThrown).to.be.false;
                }
            });
        });

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

            const bootstrapper = new Bootstrapper(browserConnectionGateway, compilerService);

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
