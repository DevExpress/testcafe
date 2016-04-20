var expect = require('chai').expect;

// NOTE: we run tests in chrome only, because we mainly test server API functionality.
// Actions functionality is tested in lower-level raw API.
describe('[API] t.rightClick()', function () {
    it('Should make right click on a button [ONLY:chrome]', function () {
        return runTests('./testcafe-fixtures/right-click-test.js', 'Right click button', { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains('Right click on the button');
                expect(err).to.contains(' >  7 |    await t.rightClick(\'#button\');');
            });
    });

    it('Should validate options [ONLY:chrome]', function () {
        return runTests('./testcafe-fixtures/right-click-test.js', 'Incorrect action option', { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains('Action option offsetX is expected to be a positive integer, but it was -3.');
                expect(err).to.contains(' > 15 |    await t.rightClick(\'#button\', { offsetX: -3 });');
            });
    });

    it('Should validate selector [ONLY:chrome]', function () {
        return runTests('./testcafe-fixtures/right-click-test.js', 'Incorrect action selector', { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains('Action selector is expected to be a string, but it was number.');
                expect(err).to.contains(' > 11 |    await t.rightClick(123);');
            });
    });
});
