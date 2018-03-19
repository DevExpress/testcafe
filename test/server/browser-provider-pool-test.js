/*eslint linebreak-style: ["error", "windows"]*/

var expect               = require('chai').expect;
var browserProviderPool  = require('../../lib/browser/provider/pool');

describe('Browser provider pool', function () {
    describe('module handling', function () {
        it('Should fail with not-found private package', function () {
            return browserProviderPool.getProvider('@private-scope/private-package').then(function (provider) {
                expect(provider).to.be.null;
            });
        });

        it('Should pass with chrome - a local package', function () {
            return browserProviderPool.getProvider('chrome').then(function (provider) {
                expect(provider).to.be.not.null;
            });
        });
    });
});
