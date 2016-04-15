var expect = require('chai').expect;

// NOTE: we run tests in chrome only, because we mainly test server API functionality.
describe('[Raw API] beforeEach/afterEach hooks [ONLY:chrome]', function () {
    it('Should run hooks for all tests', function () {
        var test1Err = null;

        return runTests('./testcafe-fixtures/run-all.testcafe', 'Test1', { shouldFail: true })
            .catch(function (err) {
                test1Err = err;
                return runTests('./testcafe-fixtures/run-all.testcafe', 'Test2', { shouldFail: true });
            })
            .catch(function (err) {
                expect(err).eql(test1Err);

                expect(err).eql('- Error in afterEach hook - ' +
                                'Error on page "http://localhost:3000/api/raw/before-after-each-hooks/pages/index.html":  ' +
                                'Uncaught Error: [beforeEach][test][afterEach]'
                );

            });
    });

    it('Should not run test and afterEach if fails in beforeEach [ONLY:chrome]', function () {
        return runTests('./testcafe-fixtures/fail-in-before-each.testcafe', 'Test', { shouldFail: true })
            .catch(function (err) {
                expect(err).eql('- Error in beforeEach hook - ' +
                                'Error on page "http://localhost:3000/api/raw/before-after-each-hooks/pages/index.html":  ' +
                                'Uncaught Error: [beforeEach]'
                );

            });
    });

    it('Should run test and afterEach and beforeEach if test fails [ONLY:chrome]', function () {
        return runTests('./testcafe-fixtures/fail-in-test.testcafe', 'Test', { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains('Error on page "http://localhost:3000/api/raw/before-after-each-hooks/pages/index.html":  ' +
                                        'Uncaught Error: [beforeEach] ' +
                                        '- Error in afterEach hook - ' +
                                        'Error on page "http://localhost:3000/api/raw/before-after-each-hooks/pages/index.html":  ' +
                                        'Uncaught Error: [beforeEach][afterEach]'
                );
            });
    });
});
