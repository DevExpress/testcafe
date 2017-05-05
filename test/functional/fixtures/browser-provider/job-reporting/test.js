var path                = require('path');
var browserTools        = require('testcafe-browser-tools');
var expect              = require('chai').expect;
var config              = require('../../../config');
var browserProviderPool = require('../../../../../lib/browser/provider/pool');
var BrowserConnection   = require('../../../../../lib/browser/connection');


if (config.useLocalBrowsers) {
    describe('Browser Provider - Job Results Reporting', function () {
        var BROWSER_OPENING_DELAY = 3000;

        var chromeInfo   = null;
        var mockProvider = null;

        var mockProviderPlugin = {
            state:     {},
            idNameMap: {},

            openBrowser: function (browserId, pageUrl, name) {
                var self = this;

                this.idNameMap[browserId] = name;
                this.state[name]          = {};

                if (/failed/.test(name)) {
                    setTimeout(function () {
                        self.simulateError(browserId);
                    }, BROWSER_OPENING_DELAY);
                }

                return browserTools.open(chromeInfo, pageUrl);
            },

            closeBrowser: function (browserId) {
                return browserTools.close(browserId);
            },

            reportJobResult: function (browserId, result, data) {
                var name = this.idNameMap[browserId];

                this.state[name].result = result;
                this.state[name].data   = data;

                return Promise.resolve();
            },

            simulateError: function (browserId) {
                var bc = BrowserConnection.getById(browserId);

                bc.emit('error', new Error('Connection error'));
            }
        };


        function run (browsers, file) {
            return testCafe
                .createRunner()
                .src(path.join(__dirname, file))
                .reporter('json', {
                    write: function () {

                    },

                    end: function () {

                    }
                })
                .browsers(browsers)
                .run();
        }

        before(function () {
            browserProviderPool.addProvider('mock', mockProviderPlugin);

            return browserProviderPool
                .getProvider('mock')
                .then(function (provider) {
                    mockProvider = provider;

                    return browserTools.getBrowserInfo('chrome');
                })
                .then(function (info) {
                    chromeInfo = info;
                });
        });

        after(function () {
            browserProviderPool.removeProvider('mock');
        });

        beforeEach(function () {
            mockProvider.plugin.state     = {};
            mockProvider.plugin.idNameMap = {};
        });

        it('Should report job results to the providers', function () {
            return run(['mock:id-1', 'mock:id-2'], './testcafe-fixtures/index-test.js')
                .then(function () {
                    expect(mockProvider.plugin.state['id-1'].result).eql(mockProvider.plugin.JOB_RESULT.done);
                    expect(mockProvider.plugin.state['id-1'].data).eql({ total: 2, passed: 1 });
                    expect(mockProvider.plugin.state['id-2'].result).eql(mockProvider.plugin.JOB_RESULT.done);
                    expect(mockProvider.plugin.state['id-2'].data).eql({ total: 2, passed: 1 });
                });
        });

        it('Should report job error to the providers', function () {
            return run(['mock:failed-1', 'mock:id-2'], './testcafe-fixtures/long-test.js')
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (error) {
                    expect(error.message).eql('Connection error');
                    expect(mockProvider.plugin.state['failed-1'].result).eql(mockProvider.plugin.JOB_RESULT.errored);
                    expect(mockProvider.plugin.state['failed-1'].data.message).eql('Connection error');
                    expect(mockProvider.plugin.state['id-2'].result).eql(mockProvider.plugin.JOB_RESULT.aborted);
                });
        });

        it('Should report job cancellation to the providers', function () {
            return run(['mock:id-1', 'mock:id-2'], './testcafe-fixtures/long-test.js')
                .cancel()
                .then(function () {
                    expect(mockProvider.plugin.state['id-1'].result).eql(mockProvider.plugin.JOB_RESULT.aborted);
                    expect(mockProvider.plugin.state['id-2'].result).eql(mockProvider.plugin.JOB_RESULT.aborted);
                });
        });
    });
}

