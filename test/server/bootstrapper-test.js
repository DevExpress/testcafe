const proxyquire              = require('proxyquire');
const chai                    = require('chai');
const { expect }              = chai;
const { noop }                = require('lodash');
const BrowserConnectionStatus = require('../../lib/browser/connection/status');
const BrowserConnection       = require('../../lib/browser/connection');
const Test                    = require('../../lib/api/structure/test');

chai.use(require('chai-string'));

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

            it('Should raise an error when browser is specified as non-headless', async () => {
                bootstrapper.browsers = [ 'chrome' ];

                try {
                    await bootstrapper.createRunnableConfiguration();

                    throw new Error('Promise rejection expected');
                }
                catch (err) {
                    expect(err.message).startsWith(
                        `You run chrome browser with graphic interface in Linux without graphic subsystem. ` +
                        `Try to run chrome in headless mode. For more information see ` +
                        `https://devexpress.github.io/testcafe/documentation/` +
                        `guides/concepts/browsers.html#test-in-headless-mode`
                    );
                }
            });

            it('Should raise an error when browser is specified by a path', async () => {
                bootstrapper.browsers = [ 'path:/non/exist' ];

                try {
                    await bootstrapper.createRunnableConfiguration();

                    throw new Error('Promise rejection expected');
                }
                catch (err) {
                    expect(err.message).startsWith(
                        `You run path:/non/exist browser with graphic interface in Linux without graphic subsystem. ` +
                        `Try to run path:/non/exist in headless mode. For more information see ` +
                        `https://devexpress.github.io/testcafe/documentation/` +
                        `guides/concepts/browsers.html#test-in-headless-mode`
                    );
                }
            });

            it('Should not raise an error when browser is specified as headless', async () => {
                bootstrapper.browsers = [ 'chrome:headless' ];

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

            it('Should not raise an error when browser is specified as non-local', async () => {
                bootstrapper.browsers = [ 'remote' ];

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
    });
});
