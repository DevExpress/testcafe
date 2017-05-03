var expect               = require('chai').expect;
var Promise              = require('pinkie');
var testcafeBrowserTools = require('testcafe-browser-tools');
var browserProviderPool  = require('../../lib/browser/provider/pool');

describe('Browser provider', function () {
    describe('Path and arguments handling', function () {
        var processedBrowserInfo                 = null;
        var originalBrowserToolsGetBrowserInfo   = null;
        var originalBrowserToolsOpen             = null;
        var originalBrowserToolsGetInstallations = null;

        function getBrowserInfo (arg) {
            return browserProviderPool
                .getBrowserInfo(arg)
                .then(function (browserInfo) {
                    return browserInfo.provider.openBrowser('id', 'test-url', browserInfo.browserName);
                })
                .catch(function (error) {
                    expect(error.message).to.contain('STOP');
                    return processedBrowserInfo;
                });
        }

        before(function () {
            originalBrowserToolsGetBrowserInfo   = testcafeBrowserTools.getBrowserInfo;
            originalBrowserToolsOpen             = testcafeBrowserTools.open;
            originalBrowserToolsGetInstallations = testcafeBrowserTools.getInstallations;

            testcafeBrowserTools.getBrowserInfo = function (path) {
                return {
                    path: path,
                    cmd:  '--internal-arg'
                };
            };

            testcafeBrowserTools.open = function (browserInfo) {
                processedBrowserInfo = browserInfo;

                throw new Error('STOP');
            };

            testcafeBrowserTools.getInstallations = function () {
                return new Promise(function (resolve) {
                    resolve({ chrome: {} });
                });
            };
        });

        after(function () {
            testcafeBrowserTools.getBrowserInfo   = originalBrowserToolsGetBrowserInfo;
            testcafeBrowserTools.open             = originalBrowserToolsOpen;
            testcafeBrowserTools.getInstallations = originalBrowserToolsGetInstallations;
        });

        it('Should parse browser parameters with arguments', function () {
            return getBrowserInfo('path:/usr/bin/chrome --arg1 --arg2')
                .then(function (browserInfo) {
                    expect(browserInfo.path).to.be.equal('/usr/bin/chrome');
                    expect(browserInfo.cmd).to.be.equal('--arg1 --arg2 --internal-arg');
                });
        });

        it('Should parse browser parameters with arguments if there are spaces in a file path', function () {
            return getBrowserInfo('path:`/opt/Google Chrome/chrome` --arg1 --arg2')
                .then(function (browserInfo) {
                    expect(browserInfo.path).to.be.equal('/opt/Google Chrome/chrome');
                    expect(browserInfo.cmd).to.be.equal('--arg1 --arg2 --internal-arg');
                });
        });

        it('Should parse alias with arguments', function () {
            return getBrowserInfo('chrome --arg1 --arg2')
                .then(function (browserInfo) {
                    expect(browserInfo.path).to.be.equal('chrome');
                    expect(browserInfo.cmd).to.contain('--arg1 --arg2 --internal-arg');
                });
        });
    });

    describe('Init/dispose error handling', function () {
        var initShouldSuccess = false;

        var dummyProvider = {
            init: function () {
                if (initShouldSuccess)
                    return Promise.resolve();

                return Promise.reject(new Error('Initialization error'));
            },

            dispose: function () {
                return Promise.reject(new Error('Dispose error'));
            }
        };

        before(function () {
            browserProviderPool.addProvider('dummy', dummyProvider);
        });

        after(function () {
            browserProviderPool.removeProvider('dummy');
        });

        beforeEach(function () {
            initShouldSuccess = false;
        });

        it('Should catch initialization error', function () {
            return browserProviderPool
                .getProvider('dummy')
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (error) {
                    expect(error.message).to.contain('Initialization error');
                });
        });

        it('Should catch dispose error', function () {
            initShouldSuccess = true;

            return browserProviderPool
                .getProvider('dummy')
                .then(function () {
                    return browserProviderPool.dispose();
                })
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (error) {
                    expect(error.message).to.contain('Dispose error');
                });
        });
    });
});

