var expect = require('chai').expect;

describe('[Raw API] Assertions', function () {
    it('Should perform eql assertion', function () {
        return runTests('./testcafe-fixtures/assertions.testcafe', 'eql assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains("AssertionError: testMessage: expected 'hey' to deeply equal 'yo'");
                expect(errs[0]).contains('[[Eql assertion failed callsite]]');
            });
    });

    it('Should perform notEql assertion', function () {
        return runTests('./testcafe-fixtures/assertions.testcafe', 'notEql assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected 2 to not deeply equal 2');
                expect(errs[0]).contains('[[NotEql assertion failed callsite]]');
            });
    });

    it('Should perform ok assertion', function () {
        return runTests('./testcafe-fixtures/assertions.testcafe', 'ok assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected false to be truthy');
                expect(errs[0]).contains('[[Ok assertion failed callsite]]');
            });
    });

    it('Should perform notOk assertion', function () {
        return runTests('./testcafe-fixtures/assertions.testcafe', 'notOk assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected 1 to be falsy');
                expect(errs[0]).contains('[[NotOk assertion failed callsite]]');
            });
    });

    it('Should perform within assertion', function () {
        return runTests('./testcafe-fixtures/assertions.testcafe', 'within assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected 4.5 to be within 4.6..7');
                expect(errs[0]).contains('[[Within assertion failed callsite]]');
            });
    });

    it('Should perform notWithin assertion', function () {
        return runTests('./testcafe-fixtures/assertions.testcafe', 'notWithin assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected 2.3 to not be within 2..3');
                expect(errs[0]).contains('[[NotWithin assertion failed callsite]]');
            });
    });

    it('Should raise error if "timeout" option is not a number', function () {
        return runTests('./testcafe-fixtures/assertions.testcafe', 'timeout is not a number', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('The "timeout" option is expected to be a positive integer, but it was string.');
                expect(errs[0]).contains('[[Timeout option is string callsite]]');
            });
    });

    it('Should process js expression', function () {
        return runTests('./testcafe-fixtures/assertions.testcafe', 'js expression', {
            shouldFail: false,
            only:       'chrome'
        });
    });
});
