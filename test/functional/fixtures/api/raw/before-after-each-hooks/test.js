var expect = require('chai').expect;

// NOTE: we run tests in chrome only, because we mainly test server API functionality.
describe('[Raw API] beforeEach/afterEach hooks', function () {
    it('Should run hooks for all tests', function () {
        var test1Err = null;

        return runTests('./testcafe-fixtures/run-all.testcafe', 'Test1', { shouldFail: true, only: 'chrome' })
            .catch(function (errs) {
                test1Err = errs[0];
                return runTests('./testcafe-fixtures/run-all.testcafe', 'Test2', { shouldFail: true, only: 'chrome' });
            })
            .catch(function (errs) {
                expect(errs[0]).eql(test1Err);

                expect(errs[0]).contains(
                    '- Error in afterEach hook - ' +
                    'Error on page "http://localhost:3000/fixtures/api/raw/before-after-each-hooks/pages/index.html":  ' +
                    'Uncaught Error: [beforeEach][test][afterEach]'
                );

            });
    });

    it('Should not run test and afterEach if fails in beforeEach', function () {
        return runTests('./testcafe-fixtures/fail-in-before-each.testcafe', 'Test', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {

                expect(errs[0]).contains(
                    '- Error in beforeEach hook - ' +
                    'Error on page "http://localhost:3000/fixtures/api/raw/before-after-each-hooks/pages/index.html":  ' +
                    'Uncaught Error: [beforeEach]'
                );

            });
    });

    it('Should run test and afterEach and beforeEach if test fails', function () {
        return runTests('./testcafe-fixtures/fail-in-test.testcafe', 'Test', { shouldFail: true, only: 'chrome' })
            .catch(function (errs) {
                expect(errs[0]).to.contains('Error on page "http://localhost:3000/fixtures/api/raw/before-after-each-hooks/pages/index.html":  ' +
                                            'Uncaught Error: [beforeEach]');
                expect(errs[1]).to.contains('- Error in afterEach hook - ' +
                                            'Error on page "http://localhost:3000/fixtures/api/raw/before-after-each-hooks/pages/index.html":  ' +
                                            'Uncaught Error: [beforeEach][afterEach]');
            });
    });
});
