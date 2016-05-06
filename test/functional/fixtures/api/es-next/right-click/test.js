var expect = require('chai').expect;

// NOTE: we run tests in chrome only, because we mainly test server API functionality.
// Actions functionality is tested in lower-level raw API.
describe('[API] t.rightClick()', function () {
    it('Should make right click on a button', function () {
        return runTests('./testcafe-fixtures/right-click-test.js', 'Right click button', { shouldFail: true, only: 'chrome' })
            .catch(function (errs) {
                expect(errs[0]).to.contains('Right click on the button');
                expect(errs[0]).to.contains(' >  7 |    await t.rightClick(\'#button\');');
            });
    });

    it('Should validate options', function () {
        return runTests('./testcafe-fixtures/right-click-test.js', 'Incorrect action option', { shouldFail: true, only: 'chrome' })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The offsetX option is expected to be a positive integer, but it was -3.');
                expect(errs[0]).to.contains(' > 15 |    await t.rightClick(\'#button\', { offsetX: -3 });');
            });
    });

    it('Should validate selector', function () {
        return runTests('./testcafe-fixtures/right-click-test.js', 'Incorrect action selector', { shouldFail: true, only: 'chrome' })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The selector is expected to be a string, but it was number.');
                expect(errs[0]).to.contains(' > 11 |    await t.rightClick(123);');
            });
    });
});
