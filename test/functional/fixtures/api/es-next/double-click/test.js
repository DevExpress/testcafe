var expect = require('chai').expect;

describe('[API] Double click action', function () {
    it('Should make double click on a button', function () {
        return runTests('./testcafe-fixtures/double-click-test.js', 'Double click on a button', { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains('Click on button raised 2 times. Double click on button raised.');
                expect(err).to.contains(' >  7 |    await t.doubleClick(\'#button\');');
            });
    });

    it('Should validate options [ONLY:chrome]', function () {
        return runTests('./testcafe-fixtures/double-click-test.js', 'Incorrect action option', { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains('Action option offsetX is expected to be a positive integer, but it was 3.14.');
                expect(err).to.contains(' > 15 |    await t.doubleClick(\'#button\', { offsetX: 3.14 });');
            });
    });

    it('Should validate selector [ONLY:chrome]', function () {
        return runTests('./testcafe-fixtures/double-click-test.js', 'Incorrect action selector', { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains('Action selector is expected to be a string, but it was object.');
                expect(err).to.contains(' > 11 |    await t.doubleClick(null);');
            });
    });
});
