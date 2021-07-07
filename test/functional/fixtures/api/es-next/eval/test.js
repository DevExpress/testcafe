const expect             = require('chai').expect;
const config             = require('../../../../config');
const { checkUserAgent } = require('../../../../assertion-helper');

describe('[API] t.eval', function () {
    it('Should execute an anonymous client function', function () {
        const browsers = 'chrome,firefox,ie';

        return runTests('./testcafe-fixtures/eval-test.js', 'Get UA', { shouldFail: true, only: browsers })
            .catch(function (errs) {
                config.browsers
                    .filter(function (browser) {
                        return browsers.indexOf(browser.alias) > -1;
                    })
                    .forEach(function (browser) {
                        checkUserAgent(errs, browser.alias);
                    });
            });
    });

    it('Should execute an anonymous client function with dependencies', function () {
        return runTests('./testcafe-fixtures/eval-test.js', 'Eval with dependencies');
    });

    it('Should have the correct callsite if an error occurs on instantiation', function () {
        return runTests('./testcafe-fixtures/eval-test.js', 'Error on instantiation', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('Cannot initialize a ClientFunction because eval is string, and not a function.');
                expect(errs[0]).contains("> 21 |    await t.eval('42');");
            });
    });

    it('Should have the correct callsite if an error occurs during execution', function () {
        return runTests('./testcafe-fixtures/eval-test.js', 'Error during execution', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('An error occurred in eval code:');
                expect(errs[0]).contains('Error: Hi there!');
                expect(errs[0]).contains('> 25 |    await t.eval(() => {');
            });
    });
});
