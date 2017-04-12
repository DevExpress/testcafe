var expect         = require('chai').expect;
var parseUserAgent = require('useragent').parse;
var config         = require('../../../../config');

describe('[API] t.eval', function () {
    it('Should execute an anonymous client function', function () {
        function assertUA (errs, alias, expected) {
            if (!errs[alias])
                throw new Error('Error for "' + alias + '" haven\'t created');

            var ua = parseUserAgent(errs[alias][0]).toString().toLowerCase();

            expect(ua.indexOf(expected)).eql(0, ua + ' doesn\'t start with "' + expected + '"');
        }

        var browsers = 'chrome,firefox,ie';

        return runTests('./testcafe-fixtures/eval-test.js', 'Get UA', { shouldFail: true, only: browsers })
            .catch(function (errs) {
                config.browsers
                    .filter(function (browser) {
                        return browsers.indexOf(browser.alias) > -1;
                    })
                    .forEach(function (browser) {
                        assertUA(errs, browser.alias, browser.alias);
                    });
            });
    });

    it('Should execute an anonymous client function with dependencies', function () {
        return runTests('./testcafe-fixtures/eval-test.js', 'Eval with dependencies');
    });

    it('Should have the correct callsite if an error occurs on instantiation', function () {
        return runTests('./testcafe-fixtures/eval-test.js', 'Error on instantiation', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('eval code is expected to be specified as a function, but string was passed.');
                expect(errs[0]).contains("> 21 |    await t.eval('42');");
            });
    });

    it('Should have the correct callsite if an error occurs during execution', function () {
        return runTests('./testcafe-fixtures/eval-test.js', 'Error during execution', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('An error occurred in eval code:  Error: Hi there!');
                expect(errs[0]).contains('> 25 |    await t.eval(() => {');
            });
    });
});
