const expect = require('chai').expect;

describe('[CoffeeScript] Smoke tests', function () {
    // TODO: IMPORTANT: Azure test tasks hang when a role is used in a test, fix it immediately
    it('Should run non-trivial tests', function () {
        return runTests('./testcafe-fixtures/non-trivial-test.coffee', null, { skip: ['safari', 'chrome-osx', 'firefox-osx', 'ipad', 'iphone'], selectorTimeout: 5000 });
    });

    it('Should produce correct callsites on error', function () {
        return runTests('./testcafe-fixtures/callsite-test.coffee', null, { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('The specified selector does not match any element in the DOM tree.');
                expect(errs[0]).contains('> 5 |doSmthg = (selector, t) -> await t.click selector');
            });
    });
});
