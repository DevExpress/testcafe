var expect               = require('chai').expect;
var Promise              = require('pinkie');
var testcafeBrowserTools = require('testcafe-browser-tools');
var browserProviderPool  = require('../../lib/browser/provider/pool');

describe('Browser provider', function () {
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
                expect(browserInfo.cmd).to.be.equal('--internal-arg --arg1 --arg2');
            });
    });

    it('Should parse browser parameters with arguments if there are spaces in a file path', function () {
        return getBrowserInfo('path:`/opt/Google Chrome/chrome` --arg1 --arg2')
            .then(function (browserInfo) {
                expect(browserInfo.path).to.be.equal('/opt/Google Chrome/chrome');
                expect(browserInfo.cmd).to.be.equal('--internal-arg --arg1 --arg2');
            });
    });

    it('Should parse alias with arguments', function () {
        return getBrowserInfo('chrome --arg1 --arg2')
            .then(function (browserInfo) {
                expect(browserInfo.path).to.be.equal('chrome');
                expect(browserInfo.cmd).to.be.equal('--internal-arg --arg1 --arg2');
            });
    });
});

