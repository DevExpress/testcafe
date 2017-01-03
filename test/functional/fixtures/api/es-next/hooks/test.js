var expect = require('chai').expect;
var uniq   = require('lodash').uniq;

// NOTE: we run tests in chrome only, because we mainly test server API functionality.
describe('[API] fixture.beforeEach/fixture.afterEach hooks', function () {
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
                    '- Error in fixture.afterEach hook - ' +
                    'Error on page "http://localhost:3000/fixtures/api/es-next/hooks/pages/index.html":  ' +
                    'Uncaught Error: [beforeEach][test][afterEach]'
                )).eql(0);

                expect(errs[0]).contains(">  9 |            .click('#failAndReport');");
            });
    });

    it('Should not run test and afterEach if fails in beforeEach', function () {
        return runTests('./testcafe-fixtures/fail-in-before-each.js', 'Test', { shouldFail: true, only: 'chrome' })
            .catch(function (errs) {
                expect(errs[0].indexOf(
                    '- Error in fixture.beforeEach hook - ' +
                    'Error on page "http://localhost:3000/fixtures/api/es-next/hooks/pages/index.html":  ' +
                    'Uncaught Error: [beforeEach]'
                )).eql(0);

                expect(errs[0]).contains(">  6 |            .click('#failAndReport');");
            });
    });

    it('Should run test and afterEach and beforeEach if test fails', function () {
        return runTests('./testcafe-fixtures/fail-in-test.js', 'Test', { shouldFail: true, only: 'chrome' })
            .catch(function (errs) {
                expect(errs[0].indexOf(
                    'Error on page "http://localhost:3000/fixtures/api/es-next/hooks/pages/index.html":  ' +
                    'Uncaught Error: [beforeEach] '
                )).eql(0);

                expect(errs[1].indexOf(
                    '- Error in fixture.afterEach hook - ' +
                    'Error on page "http://localhost:3000/fixtures/api/es-next/hooks/pages/index.html":  ' +
                    'Uncaught Error: [beforeEach][afterEach]'
                )).eql(0);

                expect(errs[0]).contains("> 13 |    await t.click('#failAndReport');");
                expect(errs[1]).contains(">  9 |            .click('#failAndReport');");
            });
    });
});

describe('[API] test.before/test.after hooks', function () {
    it('Should run hooks before and after test and override fixture hooks', function () {
        return runTests('./testcafe-fixtures/run-all.js', 'Test3', { shouldFail: true, only: 'chrome' })
            .catch(function (errs) {
                expect(errs[0]).contains('- Error in test.after hook - ');
                expect(errs[0]).contains('[testBefore][test][testAfter]');
            });
    });
});

describe('[API] t.ctx', function () {
    it('Should pass context object to tests and hooks', function () {
        return runTests('./testcafe-fixtures/run-all.js', 't.ctx', { shouldFail: true, only: 'chrome,ie,firefox' })
            .catch(function (errs) {
                var browsers = [];

                Object.keys(errs).forEach(function (browser) {
                    var ctxJson = errs[browser][0].match(/###(.+)###/)[1];
                    var ctx     = JSON.parse(ctxJson);

                    // NOTE: check that we have same browser for each stage
                    expect(uniq(ctx.browsers).length).eql(1);
                    expect(ctx.steps).eql(['before', 'test', 'after']);

                    browsers.push(ctx.browsers[0]);
                });

                // NOTE: check that each context is from different browsers
                expect(uniq(browsers).length).eql(3);
            });
    });
});
