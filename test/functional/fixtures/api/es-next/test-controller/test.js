var expect = require('chai').expect;

// NOTE: we run tests in chrome only, because we mainly test server API functionality.
// Actions functionality is tested in lower-level raw API.
describe('[API] TestController', function () {
    it('Should support chaining', function () {
        return runTests('./testcafe-fixtures/test-controller-test.js', 'Chaining', { shouldFail: true, only: 'chrome' })
            .catch(function (errs) {
                expect(errs[0]).to.contains('-btn1-btn2-btn3-page2-btn1-page2-btn2');
            });
    });

    it('Should produce correct callsites for chained calls', function () {
        return runTests('./testcafe-fixtures/test-controller-test.js', 'Chaining callsites', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).to.contains(
                    ' 16 |' +
                    ' 17 |test(\'Chaining callsites\', async t => {' +
                    ' 18 |    await t' +
                    ' 19 |        .click(\'#btn1\')' +
                    ' 20 |        .click(\'#btn2\')' +
                    ' > 21 |        .click(\'#error\')' +
                    ' 22 |        .click(\'#btn3\'); 23 |});' +
                    ' 24 |'
                );
            });
    });

    describe('Proxy object', function () {
        it('Should provide importable proxy object', function () {
            return runTests('./testcafe-fixtures/proxy-test.js', 'Proxy object');
        });
    });

    describe('Missing `await` tracking', function () {
        var missingAwaitErrMsg = 'A call to an async function is not awaited. Use the "await" keyword before actions, ' +
                                 'assertions or chains of them to ensure that they run in the right sequence.';

        it('Should track missing `await`', function () {
            return runTests('./testcafe-fixtures/test-controller-test.js', 'Missing await', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).to.contains(missingAwaitErrMsg);
                    expect(errs[0]).to.contains('> 28 |    t.click(\'#page2-btn1\');');
                });
        });

        it('Should track missing `await` in chain', function () {
            return runTests('./testcafe-fixtures/test-controller-test.js', 'Missing await in chain',
                { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).to.contains(missingAwaitErrMsg);
                    expect(errs[0]).to.contains("> 38 |        .click('#page2-btn2');");
                });
        });

        it('Should track missing `await` in the end of test', function () {
            return runTests('./testcafe-fixtures/test-controller-test.js', 'Missing await in the end of the test',
                { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).to.contains(missingAwaitErrMsg);
                    expect(errs[0]).to.contains("> 44 |    t.click('#btn3');");
                });
        });

        it('Should track missing `await` for actions with error', function () {
            return runTests('./testcafe-fixtures/test-controller-test.js', 'Error caused by action with missing await',
                { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).to.contains(missingAwaitErrMsg);
                    expect(errs[0]).to.contains("> 48 |    t.click('#error');");
                    expect(errs[1]).to.contains('Uncaught Error: Error callsite test');
                    expect(errs[1]).to.contains("> 48 |    t.click('#error');");
                });
        });

        it('Should track missing `await` with disrupted chain', function () {
            return runTests('./testcafe-fixtures/test-controller-test.js', 'Missing await with disrupted chain',
                { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).to.contains(missingAwaitErrMsg);
                    expect(errs[0]).to.contains("> 58 |    t.click('#btn2');");
                });
        });

        it('Should track missing `await` in helper', function () {
            return runTests('./testcafe-fixtures/test-controller-test.js', 'Missing await in helper',
                { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).to.contains(missingAwaitErrMsg);
                    expect(errs[0]).to.contains("> 2 |    t.click('#yo');");
                });
        });

        it('Should track missing `await` before error', function () {
            return runTests('./testcafe-fixtures/test-controller-test.js', 'Missing await before error',
                { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).to.contains(missingAwaitErrMsg);
                    expect(errs[0]).to.contains("> 68 |    t.click('#btn2'); ");
                    expect(errs[1]).to.contains('Error: Hey!');
                    expect(errs[1]).to.contains("> 70 |    throw new Error('Hey!');");
                });
        });

        describe('Regression', function () {
            it('Should allow chains within chain (GH-1285)', function () {
                return runTests('./testcafe-fixtures/test-controller-test.js', 'GH-1285', { only: 'chrome' });
            });
        });
    });
});
