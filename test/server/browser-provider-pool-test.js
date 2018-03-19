/*eslint linebreak-style: ["error", "windows"]*/

var expect               = require('chai').expect;
//var Promise              = require('pinkie');
//var testcafeBrowserTools = require('testcafe-browser-tools');
var browserProviderPool  = require('../../lib/browser/provider/pool');
var browserProviderModuleLoader = require('../../lib/browser/provider/module-loader');

describe('Browser provider pool', function () {
    describe('module handling', function () {

        before(function () {
            browserProviderModuleLoader.loadModule = function () {
                throw new Error('Bradley');
                //return null;
            };
        });

        it('Should fail with private package', function () {
            return browserProviderPool.getProvider('@private-scope/private-package').then(function (provider) {
                expect(provider).to.be.null;
            });
        });

        it('Should pass with chrome', function () {
            return browserProviderPool.getProvider('chrome').then(function (provider) {
                expect(provider).to.be.not.null;
            });
        });
    });
});
