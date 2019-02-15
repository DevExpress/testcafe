const { expect } = require('chai');

// NOTE: we run tests in chrome only, because we mainly test server API functionality.
// Actions functionality is tested in lower-level raw API.
describe('[API] TestController', () => {
    it('Should support chaining', () => {
        return runTests('./testcafe-fixtures/test-controller-test.js', 'Chaining', { shouldFail: true, only: 'chrome' })
            .catch(errs => {
                expect(errs[0]).to.contains('-btn1-btn2-btn3-page2-btn1-page2-btn2');
            });
    });

    it('Should produce correct callsites for chained calls', () => {
        return runTests('./testcafe-fixtures/test-controller-test.js', 'Chaining callsites', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(errs => {
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

    describe('Proxy object', () => {
        it('Should provide importable proxy object', () => {
            return runTests('./testcafe-fixtures/proxy-test.js', 'Proxy object');
        });
    });

    describe('Missing `await` tracking', () => {
        const missingAwaitErrMsg = 'A call to an async function is not awaited. Use the "await" keyword before actions, ' +
                                   'assertions or chains of them to ensure that they run in the right sequence.';

        it('Should track missing `await`', () => {
            return runTests('./testcafe-fixtures/test-controller-test.js', 'Missing await', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(errs => {
                    expect(errs[1]).to.contains(missingAwaitErrMsg);
                    expect(errs[1]).to.contains('> 28 |    t.click(\'#page2-btn1\');');
                });
        });

        it('Should track missing `await` in chain', () => {
            return runTests('./testcafe-fixtures/test-controller-test.js', 'Missing await in chain',
                { shouldFail: true, only: 'chrome' })
                .catch(errs => {
                    expect(errs[1]).to.contains(missingAwaitErrMsg);
                    expect(errs[1]).to.contains("> 38 |        .click('#page2-btn2');");
                });
        });

        it('Should track missing `await` in the end of test', () => {
            return runTests('./testcafe-fixtures/test-controller-test.js', 'Missing await in the end of the test',
                { shouldFail: true, only: 'chrome' })
                .catch(errs => {
                    expect(errs[0]).to.contains(missingAwaitErrMsg);
                    expect(errs[0]).to.contains("> 44 |    t.click('#btn3');");
                });
        });

        it('Should track missing `await` for actions with error', () => {
            return runTests('./testcafe-fixtures/test-controller-test.js', 'Error caused by action with missing await',
                { shouldFail: true, only: 'chrome' })
                .catch(errs => {
                    expect(errs[1]).to.contains(missingAwaitErrMsg);
                    expect(errs[1]).to.contains("> 48 |    t.click('#error');");
                    expect(errs[0]).to.contains('Error callsite test');
                    expect(errs[0]).to.contains("> 48 |    t.click('#error');");
                });
        });

        it('Should track missing `await` with disrupted chain', () => {
            return runTests('./testcafe-fixtures/test-controller-test.js', 'Missing await with disrupted chain',
                { shouldFail: true, only: 'chrome' })
                .catch(errs => {
                    expect(errs[0]).to.contains(missingAwaitErrMsg);
                    expect(errs[0]).to.contains("> 58 |    t.click('#btn2');");
                });
        });

        it('Should track missing `await` in helper', () => {
            return runTests('./testcafe-fixtures/test-controller-test.js', 'Missing await in helper',
                { shouldFail: true, only: 'chrome' })
                .catch(errs => {
                    expect(errs[0]).to.contains(missingAwaitErrMsg);
                    expect(errs[0]).to.contains("> 2 |    t.click('#yo');");
                });
        });

        it('Should not track missing `await` when uncaught error is occurred (GH-2557)', () => {
            return runTests('./testcafe-fixtures/test-controller-test.js', 'GH-2557',
                { shouldFail: true, only: 'chrome' })
                .catch(errs => {
                    expect(errs.length).eql(1);
                    expect(errs[0]).contains("TypeError: Cannot read property 'someProperty' of undefined  [[user-agent]]");
                });
        });

        describe('Regression', () => {
            it('Should allow chains within chain (GH-1285)', () => {
                return runTests('./testcafe-fixtures/test-controller-test.js', 'GH-1285', { only: 'chrome' });
            });
        });
    });
});
