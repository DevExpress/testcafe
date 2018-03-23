var BrowserProviderModuleLoader  = require('../../lib/browser/provider/module-loader');
var expect = require('chai').expect;

describe('Browser provider module loader', function () {
    describe('module loading regex', function () {
        it('Should find @private/testcafe-browser-provider-package', function () {
            expect(new BrowserProviderModuleLoader().isScopedProvider('@private/testcafe-browser-provider-package')).to.be.not.null;
        });
        it('Should not find @private/private-package', function () {
            expect(new BrowserProviderModuleLoader().isScopedProvider('@private/private-package')).to.be.not.null;
        });
        it('Should not find @private/package', function () {
            expect(new BrowserProviderModuleLoader().isScopedProvider('@private/package')).to.be.not.null;
        });
        it('Should not find browserprovider', function () {
            expect(new BrowserProviderModuleLoader().isScopedProvider('browserprovider')).to.be.null;
        });
    });
    describe('command argument to package name transformation', function () {
        it('Should return @private/testcafe-browser-provider-package for @private/package', function () {
            var result = new BrowserProviderModuleLoader().getScopedProviderModuleName('@private/package');

            expect(result).to.equal('@private/testcafe-browser-provider-package');
        });
        it('Should return @private/testcafe-browser-provider-package for @private/testcafe-browser-provider-package', function () {
            var result = new BrowserProviderModuleLoader().getScopedProviderModuleName('@private/testcafe-browser-provider-package');

            expect(result).to.equal('@private/testcafe-browser-provider-package');
        });
        it('Should clean the prefix from testcafe-browser-provider-package', function () {
            var result = new BrowserProviderModuleLoader().cleanStringOfDefaultPackagePrefix('testcafe-browser-provider-package');

            expect(result).to.equal('package');
        });
        it('Should not clean the prefix from testcafe-browser-provider-package', function () {
            var result = new BrowserProviderModuleLoader().cleanStringOfDefaultPackagePrefix('package');

            expect(result).to.equal('package');
        });
    });
});

