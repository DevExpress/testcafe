const expect                          = require('chai').expect;
const { noop, stubFalse, pick, omit } = require('lodash');
const nanoid                          = require('nanoid');
const { rmdirSync, statSync }         = require('fs');
const { join, dirname }               = require('path');
const proxyquire                      = require('proxyquire');
const sinon                           = require('sinon');
const Module                          = require('module');
const dedent                          = require('dedent');
const browserProviderPool             = require('../../lib/browser/provider/pool');
const BUILTIN_PROVIDERS               = require('../../lib/browser/provider/built-in');
const parseProviderName               = require('../../lib/browser/provider/parse-provider-name');
const BrowserConnection               = require('../../lib/browser/connection');
const ProviderCtor                    = require('../../lib/browser/provider/');
const WARNING_MESSAGE                 = require('../../lib/notifications/warning-message');
const BrowserProviderPluginHost       = require('../../lib/browser/provider/plugin-host');
const WarningLog                      = require('../../lib/notifications/warning-log');

class BrowserConnectionMock extends BrowserConnection {
    constructor () {
        const browserConnectionGatewayMock = {
            startServingConnection: noop,
            stopServingConnection:  noop
        };

        const providerMock = {
            openBrowser:    noop,
            isLocalBrowser: noop
        };

        super(browserConnectionGatewayMock, { provider: providerMock });

        this.ready = true;
    }

    _runBrowser () {
    }

    addWarning (...args) {
        this.message = args[0];
    }
}

describe('Browser provider', function () {
    function debugMock (id) {
        if (!debugMock.data)
            debugMock.data = {};

        if (!debugMock.data[id])
            debugMock.data[id] = '';

        return newData => {
            debugMock.data[id] += newData;
        };
    }

    beforeEach(() => {
        debugMock.data = null;
    });

    describe('Path and arguments handling', function () {
        it('Should parse the path: alias with arguments', async () => {
            const browserInfo = await browserProviderPool.getBrowserInfo('path:/usr/bin/chrome --arg1 --arg2');

            expect(browserInfo).include({
                providerName: 'path',
                browserName:  '/usr/bin/chrome --arg1 --arg2'
            });
        });

        it('Should parse the path: alias with arguments with spaces', async () => {
            const browserInfo = await browserProviderPool.getBrowserInfo('path:`/opt/Google Chrome/chrome` --arg1 --arg2');

            expect(browserInfo).include({
                providerName: 'path',
                browserName:  '`/opt/Google Chrome/chrome` --arg1 --arg2'
            });
        });

        it('Should parse the chrome: alias with arguments', async () => {
            const builtInProviders = {
                chrome: { isValidBrowserName: sinon.stub() }
            };

            builtInProviders.chrome.isValidBrowserName
                .withArgs('/usr/bin/chrome --arg1 --arg2').resolves(true);

            const mockedBrowserProviderPool = proxyquire('../../lib/browser/provider/pool', {
                './built-in': builtInProviders
            });

            const browserInfo = await mockedBrowserProviderPool.getBrowserInfo('chrome:/usr/bin/chrome --arg1 --arg2');

            expect(browserInfo).include({
                providerName: 'chrome',
                browserName:  '/usr/bin/chrome --arg1 --arg2'
            });
        });

        it('Should parse the firefox: alias with arguments', async () => {
            const builtInProviders = {
                firefox: { isValidBrowserName: sinon.stub() }
            };

            builtInProviders.firefox.isValidBrowserName
                .withArgs('/usr/bin/firefox -arg1 -arg2').resolves(true);

            const mockedBrowserProviderPool = proxyquire('../../lib/browser/provider/pool', {
                './built-in': builtInProviders
            });

            const browserInfo = await mockedBrowserProviderPool.getBrowserInfo('firefox:/usr/bin/firefox -arg1 -arg2');

            expect(browserInfo).include({
                providerName: 'firefox',
                browserName:  '/usr/bin/firefox -arg1 -arg2'
            });
        });

        it('Should parse browser parameters with arguments', async () => {
            const open           = sinon.stub();
            const getBrowserInfo = sinon.stub();

            getBrowserInfo
                .withArgs('/usr/bin/chrome')
                .resolves({ path: '/usr/bin/chrome', cmd: '--internal-arg' });

            open.resolves();

            const pathBrowserProvider  = proxyquire('../../lib/browser/provider/built-in/path', {
                'testcafe-browser-tools': { open, getBrowserInfo, __esModule: false }
            });

            await pathBrowserProvider.openBrowser('id', 'http://example.com', '/usr/bin/chrome --arg1 --arg2');

            expect(open.callCount).equal(1);

            expect(open.args[0]).deep.equal([
                { path: '/usr/bin/chrome', cmd: '--arg1 --arg2 --internal-arg' },
                'http://example.com'
            ]);
        });

        it('Should parse browser parameters with arguments if there are spaces in a file path', async () => {
            const open           = sinon.stub();
            const getBrowserInfo = sinon.stub();

            getBrowserInfo
                .withArgs('/opt/Google Chrome/chrome')
                .resolves({ path: '/opt/Google Chrome/chrome', cmd: '--internal-arg' });

            open.resolves();

            const pathBrowserProvider  = proxyquire('../../lib/browser/provider/built-in/path', {
                'testcafe-browser-tools': { open, getBrowserInfo, __esModule: false }
            });

            await pathBrowserProvider.openBrowser('id', 'http://example.com', '`/opt/Google Chrome/chrome` --arg1 --arg2');

            expect(open.callCount).equal(1);

            expect(open.args[0]).deep.equal([
                { path: '/opt/Google Chrome/chrome', cmd: '--arg1 --arg2 --internal-arg' },
                'http://example.com'
            ]);
        });

        it('Should parse path and arguments for Chrome', () => {
            const chromeProviderConfig  = require('../../lib/browser/provider/built-in/dedicated/chrome/config');

            expect(chromeProviderConfig('/usr/bin/chrome --arg1 --arg2')).include({
                path:     '/usr/bin/chrome',
                userArgs: '--arg1 --arg2'
            });
        });

        it('Should parse path and arguments for Firefox', () => {
            const firefoxProviderConfig  = require('../../lib/browser/provider/built-in/dedicated/firefox/config');

            expect(firefoxProviderConfig('/usr/bin/firefox -arg1 -arg2')).include({
                path:     '/usr/bin/firefox',
                userArgs: '-arg1 -arg2'
            });
        });
    });

    describe('Init/dispose error handling', function () {
        let initShouldSuccess = false;

        const dummyProvider = {
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

    describe('Browser provider module names handling', function () {
        it('Should resolve short form of a scoped provider', function () {
            expect(parseProviderName('@private/package')).to.deep.equal({
                providerName: '@private/package',
                moduleName:   '@private/testcafe-browser-provider-package'
            });
        });

        it('Should resolve long form of a scoped provider', function () {
            expect(parseProviderName('@private/testcafe-browser-provider-package')).to.deep.equal({
                providerName: '@private/package',
                moduleName:   '@private/testcafe-browser-provider-package'
            });
        });

        it('Should resolve short form of a unscoped provider', function () {
            expect(parseProviderName('package')).to.deep.equal({
                providerName: 'package',
                moduleName:   'testcafe-browser-provider-package'
            });
        });

        it('Should resolve long form of a unscoped provider', function () {
            expect(parseProviderName('testcafe-browser-provider-package')).to.deep.equal({
                providerName: 'package',
                moduleName:   'testcafe-browser-provider-package'
            });
        });
    });

    describe('Module loading', function () {
        const dummyProvider = {
            init: function () {
                return Promise.resolve();
            },

            dispose: function () {
                return Promise.resolve();
            }
        };

        before(function () {
            browserProviderPool.addProvider('@scope/testcafe-browser-provider-dummy', dummyProvider);
        });

        after(function () {
            browserProviderPool.removeProvider('@scope/testcafe-browser-provider-dummy');
        });

        it('Should load scoped browser provider', function () {
            return browserProviderPool.getProvider('@scope/dummy').then(function (provider) {
                expect(provider).to.be.not.null;
            });
        });

        it('Should load unscoped browser provider', function () {
            return browserProviderPool.getProvider('chrome').then(function (provider) {
                expect(provider).to.be.not.null;
            });
        });

        it('Should emit loading errors', () => {
            const originResolveFilename = Module._resolveFilename;

            Module._resolveFilename = () => 'dummy-module-path.js';

            return browserProviderPool
                .getProvider('dummy')
                .then(() => {
                    Module._resolveFilename = originResolveFilename;

                    throw new Error('The error should be thrown');
                })
                .catch(err => {
                    Module._resolveFilename = originResolveFilename;

                    expect(err.code).eql('ENOENT');
                    expect(err.path).eql('dummy-module-path.js');
                });
        });
    });

    describe('Dedicated providers base', () => {
        describe('isValidBrowserName', function () {
            it('Should return false if a browser is not found', () => {
                const dedicatedBrowserProviderBase = proxyquire('../../lib/browser/provider/built-in/dedicated/base', {
                    'testcafe-browser-tools': {
                        getBrowserInfo () {
                            return null;
                        }
                    }
                });

                const testProvider = Object.assign({}, dedicatedBrowserProviderBase, {
                    providerName: 'browser',

                    getConfig () {
                        return {};
                    }
                });

                return testProvider
                    .isValidBrowserName('browser')
                    .then(result => {
                        expect(result).to.be.false;
                    });
            });

            it('Should return true if a browser is found', () => {
                const dedicatedBrowserProviderBase = proxyquire('../../lib/browser/provider/built-in/dedicated/base', {
                    'testcafe-browser-tools': {
                        getBrowserInfo () {
                            return { alias: 'browser' };
                        }
                    }
                });

                const testProvider = Object.assign({}, dedicatedBrowserProviderBase, {
                    providerName: 'browser',

                    getConfig () {
                        return {};
                    }
                });

                return testProvider
                    .isValidBrowserName('browser')
                    .then(result => {
                        expect(result).to.be.true;
                    });
            });
        });
    });

    describe('API', () => {
        describe('Screenshots', () => {
            it('Should add warning if provider does not support `fullPage` screenshots', () => {
                const provider = new ProviderCtor({
                    isLocalBrowser:            () => true,
                    isHeadlessBrowser:         () => false,
                    hasCustomActionForBrowser: () => false
                });

                const bc = new BrowserConnectionMock();

                return provider.takeScreenshot(bc.id, '', 1, 1, true)
                    .then(() => {
                        expect(bc.message).eql(WARNING_MESSAGE.screenshotsFullPageNotSupported);
                    });
            });

            it('Should create a directory in screenshot was made using the plugin', () => {
                const provider = new ProviderCtor({
                    isLocalBrowser:            stubFalse,
                    isHeadlessBrowser:         stubFalse,
                    hasCustomActionForBrowser: stubFalse,
                    takeScreenshot:            noop
                });

                const dir            = `temp${nanoid(7)}`;
                const screenshotPath = join(process.cwd(), dir, 'tmp.png');

                return provider.takeScreenshot('', screenshotPath, 0, 0, false)
                    .then(() => {
                        const stats = statSync(dirname(screenshotPath));

                        expect(stats.isDirectory()).to.be.true;

                        rmdirSync(dirname(screenshotPath));
                    });
            });
        });
    });

    describe('Remote provider', () => {
        it('Should log an error if a browser window was not found', async () => {
            const bc = new BrowserConnectionMock();

            bc.isReady = () => true;

            const remoteProvider = proxyquire('../../lib/browser/provider/built-in/remote', {
                'testcafe-browser-tools': {
                    findWindow () {
                        throw new Error('SomeError');
                    }
                },
                debug: debugMock
            });

            const provider = new ProviderCtor(new BrowserProviderPluginHost(remoteProvider));

            await provider.openBrowser(bc.id);

            expect(debugMock.data['testcafe:browser:provider:built-in:remote']).eql('Error: SomeError');
        });
    });

    describe('Features', () => {
        const PROVIDERS_WITH_MULTIWINDOW_MODE = ['chrome', 'chromium', 'chrome-canary', 'edge', 'firefox'];

        it('Should support multiwindow mode in some providers', async () => {
            const providers = pick(BUILTIN_PROVIDERS, PROVIDERS_WITH_MULTIWINDOW_MODE);

            for (const [name, plugin] of Object.entries(providers))
                expect(plugin.supportMultipleWindows, `Provider ${name} should support multiple windows`).ok;
        });

        it('Should not support multiwindow mode in other providers', async () => {
            const providers = omit(BUILTIN_PROVIDERS, PROVIDERS_WITH_MULTIWINDOW_MODE);

            for (const [name, plugin] of Object.entries(providers))
                expect(plugin.supportMultipleWindows, `Provider ${name} should not support multiple windows`).not.ok;
        });
    });

    describe('Regression', () => {
        it('Should raise a warning if a browser window was not found', async function () {
            this.timeout(3000);

            const bc         = new BrowserConnectionMock();
            const warningLog = new WarningLog();

            bc.isReady           = () => true;
            bc.browserInfo.alias = 'chromium';
            bc.addWarning        = (...args) => warningLog.addWarning(...args);

            const ProviderMock = proxyquire('../../lib/browser/provider', {
                'testcafe-browser-tools': {
                    default: {
                        findWindow () {
                            throw new Error('SomeError');
                        }
                    }
                },

                'os-family': { win: false, linux: false, mac: false },
                'debug':     debugMock
            });

            const provider = new ProviderMock(
                new BrowserProviderPluginHost({
                    openBrowser:       noop,
                    isLocalBrowser:    () => true,
                    isHeadlessBrowser: () => false,
                })
            );

            await provider.openBrowser(bc.id);

            expect(debugMock.data['testcafe:browser:provider']).eql('Error: SomeError');
            expect(warningLog.messages).eql([dedent`
                Could not find the "chromium" window. TestCafe is unable to resize the window or take screenshots.

                The following error occurred while TestCafe was searching for the window descriptor:

                SomeError`
            ]);
        });
    });

});

