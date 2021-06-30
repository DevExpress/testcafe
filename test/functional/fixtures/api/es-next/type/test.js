const expect = require('chai').expect;

// NOTE: we run tests in chrome only, because we mainly test server API functionality.
// Actions functionality is tested in lower-level raw API.
describe('[API] t.typeText()', function () {
    it('Should type text in input', function () {
        return runTests('./testcafe-fixtures/type-test.js', 'Type text in input', { only: 'chrome' });
    });

    it('Should validate options', function () {
        return runTests('./testcafe-fixtures/type-test.js', 'Incorrect action options', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The "replace" option is expected to be a boolean value, but it was object.');
                expect(errs[0]).to.contains('> 27 |    await t.typeText(\'#input\', \'a\', { replace: null, paste: null });');
            });
    });

    it('Should validate text', function () {
        return runTests('./testcafe-fixtures/type-test.js', 'Incorrect action text', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The "text" argument is expected to be a non-empty string, but it was number.');
                expect(errs[0]).to.contains('> 23 |    await t.typeText(\'#input\', 123);');
            });
    });

    it('Should validate selector', function () {
        return runTests('./testcafe-fixtures/type-test.js', 'Incorrect action selector', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).to.contains(
                    'Action "selector" argument error:  Cannot initialize a Selector because Selector is number, ' +
                    'and not one of the following: a CSS selector string, a Selector object, a node snapshot, ' +
                    'a function, or a Promise returned by a Selector.'
                );
                expect(errs[0]).to.contains('> 19 |    await t.typeText(NaN, \'a\');');
            });
    });
});
