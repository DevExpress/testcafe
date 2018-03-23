var expect = require('chai').expect;

describe('[API] Assertions', function () {
    it('Should perform .eql() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.eql() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains("AssertionError: testMessage: expected 'hey' to deeply equal 'yo'");
                expect(errs[0]).contains(">  8 |        .expect('hey').eql('yo', 'testMessage');");
            });
    });

    it('Should perform .notEql() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.notEql() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected 2 to not deeply equal 2');
                expect(errs[0]).contains('> 14 |        .expect(2).notEql(2);');
            });
    });

    it('Should perform .ok() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.ok() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected false to be truthy');
                expect(errs[0]).contains('> 20 |        .expect(false).ok();');
            });
    });

    it('Should perform .notOk() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.notOk() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected 1 to be falsy ');
                expect(errs[0]).contains('> 26 |        .expect(1).notOk();');
            });
    });

    it('Should perform .contains() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.contains() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected [ 1, 2, 3 ] to include 4');
                expect(errs[0]).contains('> 32 |        .expect([1, 2, 3]).contains(4);');
            });
    });

    it('Should perform .notContains() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.notContains() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains("AssertionError: expected 'answer42' to not include '42'");
                expect(errs[0]).contains("> 38 |        .expect('answer42').notContains('42');");
            });
    });

    it('Should perform .typeOf() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.typeOf() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected 42 to be a function');
                expect(errs[0]).contains("> 45 |        .expect(42).typeOf('function');");
            });
    });

    it('Should perform .notTypeOf() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.notTypeOf() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected 42 not to be a number');
                expect(errs[0]).contains("> 52 |        .expect(42).notTypeOf('number');");
            });
    });

    it('Should perform .gt() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.gt() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected 42 to be above 42');
                expect(errs[0]).contains('> 58 |        .expect(42).gt(42);');
            });
    });

    it('Should perform .gte() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.gte() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected 42 to be at least 53');
                expect(errs[0]).contains('> 65 |        .expect(42).gte(53);');
            });
    });

    it('Should perform .lt() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.lt() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected 42 to be below 42');
                expect(errs[0]).contains('> 71 |        .expect(42).lt(42);');
            });
    });

    it('Should perform .lte() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.lte() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected 42 to be at most 12');
                expect(errs[0]).contains('> 78 |        .expect(42).lte(12);');
            });
    });

    it('Should perform .within() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.within() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected 4.5 to be within 4.6..7');
                expect(errs[0]).contains('> 84 |        .expect(4.5).within(4.6, 7);');
            });
    });

    it('Should perform .notWithin() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.notWithin() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected 2.3 to not be within 2..3');
                expect(errs[0]).contains('> 90 |        .expect(2.3).notWithin(2, 3);');
            });
    });

    it('Should perform .match() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.match() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains("AssertionError: expected 'yo' to match /[x,z]o/");
                expect(errs[0]).contains("> 144 |        .expect('yo').match(/[x,z]o/);");
            });
    });

    it('Should perform .notMatch() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.notMatch() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains("AssertionError: expected '42 hey' not to match /\\d+ hey/");
                expect(errs[0]).contains("> 150 |        .expect('42 hey').notMatch(/\\d+ hey/);");
            });
    });

    it('Should retry assertion for selector results', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', 'Selector result assertion', { only: 'chrome' });
    });

    it('Should raise error assertion for selector results assertion on timeout', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', 'Selector result assertion timeout', {
            shouldFail:       true,
            assertionTimeout: 20,
            only:             'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains("AssertionError: expected 'none' to deeply equal 'left'");
                expect(errs[0]).contains("> 112 |        .expect(el.getStyleProperty('float')).eql('left');");
            });
    });

    it('Should raise error when expecting an unawaited Promise that cannot be retried', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', 'Unawaited Promise assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains(`Attempted to run assertions on a Promise object. Did you forget to await it? If not, pass "{ allowUnawaitedPromise: true }" to the assertion options.`);
            });
    });

    it('Should allow an unawaited Promise with override option', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', 'Unawaited Promise assertion override', { only: 'chrome' });
    });

    it('Should raise error if `await` is missing', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', 'Missing await', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('A call to an async function is not awaited.');
                expect(errs[0]).contains('> 124 |    t.expect(42).eql(43); 125 |});');
            });
    });

    it('Should raise error if "timeout" option is not a number', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '"timeout" is not a number', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('The "timeout" option is expected to be a positive integer, but it was string.');
                expect(errs[0]).contains("> 128 |    await t.expect(42).eql(43, { timeout: 'hey' });");
            });
    });

    it('Should provide "timeout" option', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '"timeout" option', {
            only:             'chrome',
            assertionTimeout: 0
        });
    });

    it('Should retry assertion for ClientFunction results', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', 'ClientFunction result assertion', { only: 'chrome' });
    });

});
