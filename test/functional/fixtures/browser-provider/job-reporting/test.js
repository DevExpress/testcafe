const path                  = require('path');
const { expect }            = require('chai');
const config                = require('../../../config');
const chromeBrowserProvider = require('../../../../../lib/browser/provider/built-in/dedicated/chrome');
const browserProviderPool   = require('../../../../../lib/browser/provider/pool');
const BrowserConnection     = require('../../../../../lib/browser/connection');
const { noop }              = require('lodash');

if (config.useLocalBrowsers) {
    describe('Browser Provider - Job Results Reporting', function () {
        const BROWSER_OPENING_DELAY = 4000;

        let mockProvider = null;

        const mockProviderPlugin = Object.assign({}, chromeBrowserProvider, {
            state:     {},
            idNameMap: {},

            openBrowser (browserId, pageUrl, browserConfig) {
                const self       = this;
                const providerId = typeof browserConfig ===
                                   'string' ? browserConfig : browserConfig.userArgs.replace(/\W*/, '');

                this.idNameMap[browserId] = providerId;
                this.state[providerId]    = {};

                if (/failed/.test(providerId)) {
                    setTimeout(function () {
                        self.simulateError(browserId);
                    }, BROWSER_OPENING_DELAY);
                }

                return chromeBrowserProvider.openBrowser.call(this, browserId, pageUrl, {
                    ...browserConfig,
                    userArgs: `--no-sandbox ${browserConfig.userArgs}`,
                    headless: true,
                });
            },

            closeBrowser (browserId) {
                return chromeBrowserProvider.closeBrowser.call(this, browserId);
            },

            isValidBrowserName () {
                return Promise.resolve(true);
            },

            isHeadlessBrowser () {
                return true;
            },

            reportJobResult (browserId, result, data) {
                const name = this.idNameMap[browserId];

                this.state[name].result = result;
                this.state[name].data   = data;

                return Promise.resolve();
            },

            simulateError (browserId) {
                const bc = BrowserConnection.getById(browserId);

                bc.emit('error', new Error('Connection error'));
            }
        });


        function run (browsers, file) {
            return testCafe
                .createRunner()
                .src(path.join(__dirname, file))
                .reporter('json', {
                    write: noop,
                    end:   noop
                })
                .browsers(browsers)
                .run();
        }

        before(function () {
            browserProviderPool.addProvider('chrome', mockProviderPlugin);

            return browserProviderPool
                .getProvider('chrome')
                .then(provider => {
                    mockProvider = provider;
                });
        });

        after(() => {
            browserProviderPool.addProvider('chrome', chromeBrowserProvider);
        });

        beforeEach(() => {
            mockProvider.plugin.state     = {};
            mockProvider.plugin.idNameMap = {};
        });

        it('Should report job results to the providers', function () {
            return run(['chrome --id-1', 'chrome --id-2'], './testcafe-fixtures/index-test.js')
                .then(function () {
                    expect(mockProvider.plugin.state['id-1'].result).eql(mockProvider.plugin.JOB_RESULT.done);
                    expect(mockProvider.plugin.state['id-1'].data).eql({ total: 2, passed: 1 });
                    expect(mockProvider.plugin.state['id-2'].result).eql(mockProvider.plugin.JOB_RESULT.done);
                    expect(mockProvider.plugin.state['id-2'].data).eql({ total: 2, passed: 1 });
                });
        });

        it('Should report job error to the providers', () => {
            return run(['chrome --failed-1', 'chrome --id-2'], './testcafe-fixtures/long-test.js')
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(error => {
                    expect(error.message).eql('Connection error');
                    expect(mockProvider.plugin.state['failed-1'].result).eql(mockProvider.plugin.JOB_RESULT.errored);
                    expect(mockProvider.plugin.state['failed-1'].data.message).eql('Connection error');
                    expect(mockProvider.plugin.state['id-2'].result).eql(mockProvider.plugin.JOB_RESULT.aborted);
                });
        });

        it('Should report job cancellation to the providers', function () {
            return run(['chrome --id-1', 'chrome --id-2'], './testcafe-fixtures/long-test.js')
                .cancel()
                .then(function () {
                    expect(mockProvider.plugin.state['id-1'].result).eql(mockProvider.plugin.JOB_RESULT.aborted);
                    expect(mockProvider.plugin.state['id-2'].result).eql(mockProvider.plugin.JOB_RESULT.aborted);
                });
        });
    });
}

