var expect = require('chai').expect;

// NOTE: we run tests in chrome only, because we mainly test server API functionality.
describe('[API] beforeEach/afterEach hooks [ONLY:chrome]', function () {
    it('Should run hooks for all tests', function () {
        var test1Err = null;

        return runTests('./testcafe-fixtures/run-all.js', 'Test1', { shouldFail: true })
            .catch(function (err) {
                test1Err = err;
                return runTests('./testcafe-fixtures/run-all.js', 'Test2', { shouldFail: true });
            })
            .catch(function (err) {
                expect(err).eql(test1Err);

                expect(err.indexOf(
                    '- Error in afterEach hook - ' +
                    'Error on page "http://localhost:3000/api/es-next/before-after-each-hooks/pages/index.html":  ' +
                    'Uncaught Error: [beforeEach][test][afterEach]'
                )).eql(0);

                expect(err).contains(">  7 |            .click('#failAndReport');");
            });
    });

    it('Should not run test and afterEach if fails in beforeEach [ONLY:chrome]', function () {
        return runTests('./testcafe-fixtures/fail-in-before-each.js', 'Test', { shouldFail: true })
            .catch(function (err) {
                expect(err.indexOf(
                    '- Error in beforeEach hook - ' +
                    'Error on page "http://localhost:3000/api/es-next/before-after-each-hooks/pages/index.html":  ' +
                    'Uncaught Error: [beforeEach]'
                )).eql(0);

                expect(err).contains(">  6 |            .click('#failAndReport');");
            });
    });

    it('Should run test and afterEach and beforeEach if test fails [ONLY:chrome]', function () {
        return runTests('./testcafe-fixtures/fail-in-test.js', 'Test', { shouldFail: true })
            .catch(function (err) {
                expect(err.indexOf(
                    'Error on page "http://localhost:3000/api/es-next/before-after-each-hooks/pages/index.html":  ' +
                    'Uncaught Error: [beforeEach] '
                )).eql(0);

                expect(err.indexOf(
                    '- Error in afterEach hook - ' +
                    'Error on page "http://localhost:3000/api/es-next/before-after-each-hooks/pages/index.html":  ' +
                    'Uncaught Error: [beforeEach][afterEach]'
                )).to.be.above(0);

                expect(err).contains("> 10 |test('Test', async t => await t.click('#failAndReport'));");
                expect(err).contains(">  7 |            .click('#failAndReport');");
            });
    });
});
