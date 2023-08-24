const { expect }        = require('chai');
const BrowserConnection = require('../../lib/browser/connection');
const Bootstrapper      = require('../../lib/runner/bootstrapper');
const Test              = require('../../lib/api/structure/test');
const delay             = require('../../lib/utils/delay');

const {
    browserConnectionGatewayMock,
    configurationMock,
    createBrowserProviderMock,
} = require('./helpers/mocks');

describe('Bootstrapper', () => {
    describe('.createRunnableConfiguration()', () => {
        let bootstrapper = null;

        beforeEach(() => {
            bootstrapper = new Bootstrapper({
                browserConnectionGateway: browserConnectionGatewayMock,
                configuration:            configurationMock,
            });

            bootstrapper.browserInitTimeout           = 100;
            bootstrapper.TESTS_COMPILATION_UPPERBOUND = 0;

            bootstrapper.browsers = [ new BrowserConnection(browserConnectionGatewayMock, { provider: createBrowserProviderMock({ local: false }) }) ];

            bootstrapper._compileTests = async () => {
                await delay(1500);

                return [ new Test({ currentFixture: void 0 }) ];
            };
        });

        it('Browser connection error message should include hint that tests compilation takes too long', async function () {
            this.timeout(3000);

            try {
                await bootstrapper.createRunnableConfiguration();

                throw new Error('Promise rejection expected');
            }
            catch (err) {
                expect(err.message).contains('Tests took too long to compile');
            }
        });

        it('Should raise an error if fixture.globalBefore is not a function', async function () {
            bootstrapper.hooks = {
                fixture: {
                    before: 'yo',
                },
            };

            try {
                await bootstrapper.createRunnableConfiguration();

                throw new Error('Promise rejection expected');
            }
            catch (err) {
                expect(err.message).eql('Cannot prepare tests due to the following error:\n\n' +
                                          'The fixture.globalBefore hook (string) is not of expected type (function).');
            }
        });

        it('Should raise an error if fixture.globalAfter is not a function', async function () {
            bootstrapper.hooks = {
                fixture: {
                    after: 'yo',
                },
            };

            try {
                await bootstrapper.createRunnableConfiguration();

                throw new Error('Promise rejection expected');
            }
            catch (err) {
                expect(err.message).eql('Cannot prepare tests due to the following error:\n\n' +
                                        'The fixture.globalAfter hook (string) is not of expected type (function).');
            }
        });

        it('Should raise an error if test.globalBefore is not a function', async function () {
            bootstrapper.hooks = {
                test: {
                    before: 'yo',
                },
            };

            try {
                await bootstrapper.createRunnableConfiguration();

                throw new Error('Promise rejection expected');
            }
            catch (err) {
                expect(err.message).eql('Cannot prepare tests due to the following error:\n\n' +
                                        'The test.globalBefore hook (string) is not of expected type (function).');
            }
        });

        it('Should raise an error if test.globalAfter is not a function', async function () {
            bootstrapper.hooks = {
                test: {
                    after: 'yo',
                },
            };

            try {
                await bootstrapper.createRunnableConfiguration();

                throw new Error('Promise rejection expected');
            }
            catch (err) {
                expect(err.message).eql('Cannot prepare tests due to the following error:\n\n' +
                                        'The test.globalAfter hook (string) is not of expected type (function).');
            }
        });

        it("Should disable native automation mode if it's necessary", async () => {
            let remoteBrowserConnections    = [];
            let automatedBrowserConnections = [];

            const chromeBrowserInfoMock = {
                provider: {
                    supportNativeAutomation: () => true,
                },
            };

            const firefoxBrowserInfoMock = {
                provider: {
                    supportNativeAutomation: () => false,
                },
            };

            const remoteBrowserConnectionMock = {
                isNativeAutomationEnabled: () => false,
            };

            bootstrapper.configuration.clear();
            bootstrapper._disableNativeAutomationIfNecessary(remoteBrowserConnections, automatedBrowserConnections);
            expect(bootstrapper.configuration._mergedOptions).to.be.undefined;

            remoteBrowserConnections = [remoteBrowserConnectionMock];

            bootstrapper._disableNativeAutomationIfNecessary(remoteBrowserConnections, automatedBrowserConnections);
            expect(bootstrapper.configuration._mergedOptions).eql({ disableNativeAutomation: true });
            bootstrapper.configuration.clear();

            remoteBrowserConnections    = [];
            automatedBrowserConnections = [chromeBrowserInfoMock];

            bootstrapper._disableNativeAutomationIfNecessary(remoteBrowserConnections, automatedBrowserConnections);
            expect(bootstrapper.configuration._mergedOptions).to.be.undefined;
            bootstrapper.configuration.clear();

            automatedBrowserConnections = [chromeBrowserInfoMock, firefoxBrowserInfoMock];

            bootstrapper._disableNativeAutomationIfNecessary(remoteBrowserConnections, automatedBrowserConnections);
            expect(bootstrapper.configuration._mergedOptions).eql({ disableNativeAutomation: true });
            bootstrapper.configuration.clear();
        });

        it('Should throw an error if browser is opened with the "userProfile" option in the Native Automation mode', async function () {
            try {
                bootstrapper.browsers = [{
                    alias:         'chrome',
                    browserOption: { userProfile: true },
                    provider:      {
                        isLocalBrowser:          () => true,
                        supportNativeAutomation: () => true,
                    },
                }, {
                    alias:         'edge',
                    browserOption: { userProfile: true },
                    provider:      {
                        isLocalBrowser:          () => true,
                        supportNativeAutomation: () => true,
                    },
                }];

                await bootstrapper.createRunnableConfiguration();

                throw new Error('Promise rejection expected');
            }
            catch (err) {
                expect(err.message).eql('When TestCafe uses native automation, it cannot apply the "userProfile" option. ' +
                                        'To continue, disable native automation, or remove the "userProfile" suffix for ' +
                                        'the following browsers: "chrome, edge".');
            }
        });
    });
});
