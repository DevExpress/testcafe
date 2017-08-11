var expect = require('chai').expect;

//GH-1674
const TEST_DURATION_BOUND = 10000;

// NOTE: we run tests in chrome only, because we mainly test server API functionality.
// Actions functionality is tested in lower-level raw API.
describe('[API] t.click()', function () {
    it('Should make click on a button', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Click button', { shouldFail: true, only: 'chrome' })
            .catch(function (errs) {
                // GH-1674
                expect(testReport.durationMs).below(TEST_DURATION_BOUND);
                expect(errs[0]).to.contains('Button clicked');
                expect(errs[0]).to.contains(
                    ' 15 |test(\'Incorrect action option\', async t => {' +
                    ' 16 |    await t.click(\'#btn\', { offsetX: -3.5 });' +
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
                expect(errs[0]).to.contains('The "offsetX" option is expected to be an integer, but it was -3.5.');
                expect(errs[0]).to.contains(
                    ' 11 |test(\'Incorrect action selector\', async t => {' +
                    ' 12 |    await t.click(123);' +
                    ' 13 |});' +
                    ' 14 |' +
                    ' 15 |test(\'Incorrect action option\', async t => {' +
                    ' > 16 |    await t.click(\'#btn\', { offsetX: -3.5 });' +
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
                    'Action "selector" argument error:  Selector is expected to be initialized with a ' +
                    'function, CSS selector string, another Selector, node snapshot or a Promise returned ' +
                    'by a Selector, but number was passed.'
                );
                expect(errs[0]).to.contains(
                    '7 |    .page `http://localhost:3000/fixtures/api/es-next/click/pages/index.html`;' +
                    ' 8 |' +
                    ' 9 |const getClickOffset = ClientFunction(() => window.clickOffset);' +
                    ' 10 |' +
                    ' 11 |test(\'Incorrect action selector\', async t => {' +
                    ' > 12 |    await t.click(123);' +
                    ' 13 |});' +
                    ' 14 |' +
                    ' 15 |test(\'Incorrect action option\', async t => {' +
                    ' 16 |    await t.click(\'#btn\', { offsetX: -3.5 });' +
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

    it('Should accept Selector function as selector', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Selector function as selector');
    });

    it('Should accept node snapshot as selector', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Node snapshot as selector');
    });

    it('Should accept Promise returned by selector as selector', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Promise returned by selector as selector');
    });

    it('Should handle error in selector', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Error in selector', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).to.contains('An error occurred in Selector code:  Error: yo');
                expect(errs[0]).to.contains('> 34 |    await t.click(() => {');
            });
    });

    it('Should validate node type of element that selector returns', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Selector returns text node', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The specified selector is expected to match a DOM element, but it matches a text node.');
                expect(errs[0]).to.contains('> 83 |    await t.click(getNode);');
            });
    });

    describe('[Regression](GH-628)', function () {
        it('Should click on an "option" element', function () {
            return runTests('./testcafe-fixtures/click-on-select-child-test.js', 'Click on an "option" element');
        });

        it('Should fail if try to click on an "option" element in a closed "select" element', function () {
            return runTests('./testcafe-fixtures/click-on-select-child-test.js', 'Click on an invisible "option" element', {
                shouldFail: true
            })
                .catch(function (errs) {
                    expect(errs[0]).to.contains('The element that matches the specified selector is not visible.');
                    expect(errs[0]).to.contains(
                        "> 17 |        .click('[value=Second]');"
                    );
                });
        });
    });
});
