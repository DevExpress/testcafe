var expect = require('chai').expect;

describe('[API] Double click action', function () {
    it('Should make double click on a button', function () {
        return runTests('./testcafe-fixtures/double-click-test.js', 'Double click on a button', { shouldFail: true, only: 'chrome' })
            .catch(function (errs) {
                expect(errs[0]).to.contains('Click on button raised 2 times. Double click on button raised.');
                expect(errs[0]).to.contains(' >  7 |    await t.doubleClick(\'#button\');');
            });
    });

    it('Should validate options', function () {
        return runTests('./testcafe-fixtures/double-click-test.js', 'Incorrect action option', { shouldFail: true, only: 'chrome' })
            .catch(function (errs) {
                expect(errs[0]).to.contains('Action option offsetX is expected to be a positive integer, but it was 3.14.');
                expect(errs[0]).to.contains(' > 15 |    await t.doubleClick(\'#button\', { offsetX: 3.14 });');
            });
    });

    it('Should validate selector', function () {
        return runTests('./testcafe-fixtures/double-click-test.js', 'Incorrect action selector', { shouldFail: true, only: 'chrome' })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The selector is expected to be a string, but it was object.');
                expect(errs[0]).to.contains(' > 11 |    await t.doubleClick(null);');
            });
    });
});
