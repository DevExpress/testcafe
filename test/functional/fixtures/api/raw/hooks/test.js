const { expect } = require('chai');

// NOTE: we run tests in chrome only, because we mainly test server API functionality.
describe('[Raw API] fixture.beforeEach/fixture.afterEach hooks', () => {
    it('Should run hooks for all tests', () => {
        let test1Err = null;

        return runTests('./testcafe-fixtures/run-all.testcafe', 'Test1', { shouldFail: true, only: 'chrome' })
            .catch(errs => {
                test1Err = errs[0];

                return runTests('./testcafe-fixtures/run-all.testcafe', 'Test2', { shouldFail: true, only: 'chrome' });
            })
            .catch(errs => {
                expect(errs[0]).eql(test1Err);
                expect(errs[0]).contains(
                    '- Error in fixture.afterEach hook - ' +
                    'A JavaScript error occurred on "http://localhost:3000/fixtures/api/raw/hooks/pages/index.html"');
                expect(errs[0]).contains('Error: [beforeEach][test][afterEach]');

            });
    });

    it('Should not run test and afterEach if fails in beforeEach', () => {
        return runTests('./testcafe-fixtures/fail-in-before-each.testcafe', 'Test', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(errs => {
                expect(errs[0]).contains(
                    '- Error in fixture.beforeEach hook - ' +
                    'A JavaScript error occurred on "http://localhost:3000/fixtures/api/raw/hooks/pages/index.html"');
                expect(errs[0]).contains('Error: [beforeEach]');
            });
    });

    it('Should run test and afterEach and beforeEach if test fails', () => {
        return runTests('./testcafe-fixtures/fail-in-test.testcafe', 'Test', { shouldFail: true, only: 'chrome' })
            .catch(errs => {
                expect(errs[0]).to.contains('A JavaScript error occurred on "http://localhost:3000/fixtures/api/raw/hooks/pages/index.html"');
                expect(errs[0]).to.contains('Error: [beforeEach]');
                expect(errs[1]).to.contains('- Error in fixture.afterEach hook - ' +
                                            'A JavaScript error occurred on "http://localhost:3000/fixtures/api/raw/hooks/pages/index.html"');
                expect(errs[1]).to.contains('Error: [beforeEach][afterEach]');
            });
    });

    it('Variables defined in beforeEach hook or in test should not be available in afterEach hook', () => {
        return runTests('./testcafe-fixtures/context-test.testcafe', 'test1', { shouldFail: true, only: 'chrome' })
            .catch(errs => {
                expect(errs.length).to.equal(1);
                expect(errs[0]).to.contains('Error in fixture.afterEach hook');
                expect(errs[0]).to.contains('Cannot evaluate the "Selector(el).exists" expression in the "actual" parameter because of the following error:  el is not defined');
            });
    });

    it('Variables defined in beforeEach hook should not be available in afterEach hook', () => {
        return runTests('./testcafe-fixtures/context-test.testcafe', 'test2', { shouldFail: true, only: 'chrome' })
            .catch(errs => {
                expect(errs.length).to.equal(1);
                expect(errs[0]).to.contains('Error in fixture.afterEach hook');
                expect(errs[0]).to.contains('Cannot evaluate the "Selector(el).exists" expression in the "actual" parameter because of the following error:  el is not defined');
            });
    });

    it('Variables defined in beforeEach hook should not be available in test', () => {
        return runTests('./testcafe-fixtures/context-test.testcafe', 'test3', { shouldFail: true, only: 'chrome' })
            .catch(errs => {
                expect(errs.length).to.equal(2);
                expect(errs[0]).to.not.contains('Error in ');
                expect(errs[0]).to.contains('Cannot evaluate the "Selector(el).exists" expression in the "actual" parameter because of the following error:  el is not defined');
                expect(errs[1]).to.contains('Error in fixture.afterEach hook');
                expect(errs[1]).to.contains('Cannot evaluate the "Selector(el).exists" expression in the "actual" parameter because of the following error:  el is not defined');
            });
    });
});

describe('[Raw API] test.before/test.after hooks', () => {
    it('Should run hooks before and after test and override fixture hooks', () => {
        return runTests('./testcafe-fixtures/run-all.testcafe', 'Test3', { shouldFail: true, only: 'chrome' })
            .catch(errs => {
                expect(errs[0]).contains('- Error in test.after hook - ');
                expect(errs[0]).contains('[testBefore][test][testAfter]');
            });
    });
});
