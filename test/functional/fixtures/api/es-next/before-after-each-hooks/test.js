var expect = require('chai').expect;

// NOTE: we run tests in chrome only, because we mainly test server API functionality.
describe('[API] beforeEach/afterEach hooks', function () {
    it('Should run hooks for all tests', function () {
        var test1Err = null;

        return runTests('./testcafe-fixtures/run-all.js', 'Test1', { shouldFail: true, only: 'chrome' })
            .catch(function (errs) {
                test1Err = errs[0];
                return runTests('./testcafe-fixtures/run-all.js', 'Test2', { shouldFail: true, only: 'chrome' });
            })
            .catch(function (errs) {
                expect(errs[0]).eql(test1Err);

                expect(errs[0].indexOf(
                    '- Error in afterEach hook - ' +
                    'Error on page "http://localhost:3000/api/es-next/before-after-each-hooks/pages/index.html":  ' +
                    'Uncaught Error: [beforeEach][test][afterEach]'
                )).eql(0);

                expect(errs[0]).contains(">  7 |            .click('#failAndReport');");
            });
    });

    it('Should not run test and afterEach if fails in beforeEach', function () {
        return runTests('./testcafe-fixtures/fail-in-before-each.js', 'Test', { shouldFail: true, only: 'chrome' })
            .catch(function (errs) {
                expect(errs[0].indexOf(
                    '- Error in beforeEach hook - ' +
                    'Error on page "http://localhost:3000/api/es-next/before-after-each-hooks/pages/index.html":  ' +
                    'Uncaught Error: [beforeEach]'
                )).eql(0);

                expect(errs[0]).contains(">  6 |            .click('#failAndReport');");
            });
    });

    it('Should run test and afterEach and beforeEach if test fails', function () {
        return runTests('./testcafe-fixtures/fail-in-test.js', 'Test', { shouldFail: true, only: 'chrome' })
            .catch(function (errs) {
                expect(errs[0].indexOf(
                    'Error on page "http://localhost:3000/api/es-next/before-after-each-hooks/pages/index.html":  ' +
                    'Uncaught Error: [beforeEach] '
                )).eql(0);

                expect(errs[1].indexOf(
                    '- Error in afterEach hook - ' +
                    'Error on page "http://localhost:3000/api/es-next/before-after-each-hooks/pages/index.html":  ' +
                    'Uncaught Error: [beforeEach][afterEach]'
                )).eql(0);

                expect(errs[0]).contains("> 10 |test('Test', async t => await t.click('#failAndReport'));");
                expect(errs[1]).contains(">  7 |            .click('#failAndReport');");
            });
    });
});
