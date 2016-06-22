var expect = require('chai').expect;

// NOTE: we run tests in chrome only, because we mainly test server API functionality.
// Actions functionality is tested in lower-level raw API.
describe('[API] t.click()', function () {
    it('Should make click on a button', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Click button', { shouldFail: true, only: 'chrome' })
            .catch(function (errs) {
                expect(errs[0]).to.contains('Button clicked');
                expect(errs[0]).to.contains(
                    ' 15 |test(\'Incorrect action option\', async t => {' +
                    ' 16 |    await t.click(\'#btn\', { offsetX: -3 });' +
                    ' 17 |});' +
                    ' 18 |' +
                    ' 19 |test(\'Click button\', async t => {' +
                    ' > 20 |    await t.click(\'#btn\');' +
                    ' 21 |});' +
                    ' 22 | '
                );
            });
    });

    it('Should validate options', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Incorrect action option', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The offsetX option is expected to be a positive integer, but it was -3.');
                expect(errs[0]).to.contains(
                    ' 11 |test(\'Incorrect action selector\', async t => {' +
                    ' 12 |    await t.click(123);' +
                    ' 13 |});' +
                    ' 14 |' +
                    ' 15 |test(\'Incorrect action option\', async t => {' +
                    ' > 16 |    await t.click(\'#btn\', { offsetX: -3 });' +
                    ' 17 |});' +
                    ' 18 |' +
                    ' 19 |test(\'Click button\', async t => {' +
                    ' 20 |    await t.click(\'#btn\');' +
                    ' 21 |});'
                );
            });
    });

    it('Should validate selector', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Incorrect action selector', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).to.contains(
                    'Action selector error:  Selector is expected to be initialized with a ' +
                    'function, string, another Selector, node snapshot or a Promise returned ' +
                    'by a Selector, but "number" was passed.'
                );
                expect(errs[0]).to.contains(
                    '7 |    .page `http://localhost:3000/api/es-next/click/pages/index.html`;' +
                    ' 8 |' +
                    ' 9 |const getClickOffset = ClientFunction(() => window.clickOffset);' +
                    ' 10 |' +
                    ' 11 |test(\'Incorrect action selector\', async t => {' +
                    ' > 12 |    await t.click(123);' +
                    ' 13 |});' +
                    ' 14 |' +
                    ' 15 |test(\'Incorrect action option\', async t => {' +
                    ' 16 |    await t.click(\'#btn\', { offsetX: -3 });' +
                    ' 17 |});'
                );
            });
    });

    it('Should click at the center of the target if offset options are not specified', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Click without offset options');
    });

    it('Should accept function as selector', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Function as selector');
    });

    it('Should handle error in selector', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Error in selector', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).to.contains('An error occurred in Selector code:  Error: yo');
                expect(errs[0]).to.contains('> 43 |    await t.click(() => {');
            });
    });
});
