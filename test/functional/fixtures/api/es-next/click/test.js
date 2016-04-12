var expect = require('chai').expect;

// NOTE: we run tests in chrome only, because we mainly test server API functionality.
// Actions functionality is tested in lower-level raw API.
describe('[API] t.click()', function () {
    it('Should make click on a button [ONLY:chrome]', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Click button', { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains('Button clicked');
                expect(err).to.contains(
                    ' 10 |test(\'Incorrect action option\', async t => {' +
                    ' 11 |    await t.click(\'#btn\', { offsetX: -3 });' +
                    ' 12 |});' +
                    ' 13 |' +
                    ' 14 |test(\'Click button\', async t => {' +
                    ' > 15 |    await t.click(\'#btn\');' +
                    ' 16 |});' +
                    ' 17 |  '
                );
            });
    });

    it('Should validate options [ONLY:chrome]', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Incorrect action option', { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains('Action option offsetX is expected to be a positive number, but it was -3.');
                expect(err).to.contains(
                    ' 6 |test(\'Incorrect action selector\', async t => {' +
                    ' 7 |    await t.click(123);' +
                    ' 8 |});' +
                    ' 9 |' +
                    ' 10 |test(\'Incorrect action option\', async t => {' +
                    ' > 11 |    await t.click(\'#btn\', { offsetX: -3 });' +
                    ' 12 |});' +
                    ' 13 |' +
                    ' 14 |test(\'Click button\', async t => {' +
                    ' 15 |    await t.click(\'#btn\'); 16 |});'
                )
            });
    });

    it.only('Should validate selector [ONLY:chrome]', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Incorrect action selector', { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains('Action selector is expected to be a string, but it was number.');
                expect(err).to.contains(
                    '2 |' +
                    ' 3 |fixture `Click`' +
                    ' 4 |    .page `http://localhost:3000/api/es-next/click/pages/index.html`;' +
                    ' 5 |' +
                    ' 6 |test(\'Incorrect action selector\', async t => {' +
                    ' >  7 |    await t.click(123);' +
                    ' 8 |});' +
                    ' 9 |' +
                    ' 10 |test(\'Incorrect action option\', async t => {' +
                    ' 11 |    await t.click(\'#btn\', { offsetX: -3 });' +
                    ' 12 |});'
                )
            });
    });
});
