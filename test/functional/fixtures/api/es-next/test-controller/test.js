var expect = require('chai').expect;

// NOTE: we run tests in chrome only, because we mainly test server API functionality.
// Actions functionality is tested in lower-level raw API.
describe('[API] TestController', function () {
    it('Should support chaining [ONLY:chrome]', function () {
        return runTests('./testcafe-fixtures/test-controller-test.js', 'Chaining', { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains('-btn1-btn2-btn3-page2-btn1-page2-btn2');
            });
    });

    it('Should produce correct callsites for chained calls [ONLY:chrome]', function () {
        return runTests('./testcafe-fixtures/test-controller-test.js', 'Chaining callsites', { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains(
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

    describe('Missing `await` tracking', function () {
        var missingAwaitErrMsg = 'A call to an async function is not awaited. Use the await keyword before actions, ' +
                                 'assertions or chains of them to ensure that they run in the right sequence.';

        it('Should track missing `await` [ONLY:chrome]', function () {
            return runTests('./testcafe-fixtures/test-controller-test.js', 'Missing await', { shouldFail: true })
                .catch(function (err) {
                    expect(err).to.contains(missingAwaitErrMsg);
                    expect(err).to.contains("> 28 |    t.click(\'#page2-btn1\');");
                });
        });

        it('Should track missing `await` in chain [ONLY:chrome]', function () {
            return runTests('./testcafe-fixtures/test-controller-test.js', 'Missing await in chain', { shouldFail: true })
                .catch(function (err) {
                    expect(err).to.contains(missingAwaitErrMsg);
                    expect(err).to.contains("> 38 |        .click('#page2-btn2');");
                });
        });

        it('Should track missing `await` in the end of test [ONLY:chrome]', function () {
            return runTests('./testcafe-fixtures/test-controller-test.js', 'Missing await in the end of the test', { shouldFail: true })
                .catch(function (err) {
                    expect(err).to.contains(missingAwaitErrMsg);
                    expect(err).to.contains("> 44 |    t.click('#btn3');");
                });
        });

        it('Should track missing `await` for actions with error [ONLY:chrome]', function () {
            return runTests('./testcafe-fixtures/test-controller-test.js', 'Error caused by action with missing await', { shouldFail: true })
                .catch(function (err) {
                    expect(err).to.contains(missingAwaitErrMsg);
                    expect(err).to.contains("> 48 |    t.click('#error'); ");
                });
        });

        it('Should track missing `await` with disrupted chain [ONLY:chrome]', function () {
            return runTests('./testcafe-fixtures/test-controller-test.js', 'Missing await with disrupted chain', { shouldFail: true })
                .catch(function (err) {
                    expect(err).to.contains(missingAwaitErrMsg);
                    expect(err).to.contains("> 58 |    t.click('#btn2');");
                });
        });

        it('Should track missing `await` in helper [ONLY:chrome]', function () {
            return runTests('./testcafe-fixtures/test-controller-test.js', 'Missing await in helper', { shouldFail: true })
                .catch(function (err) {
                    expect(err).to.contains(missingAwaitErrMsg);
                    expect(err).to.contains("> 2 |    t.click('#yo');");
                });
        });
    });
});
