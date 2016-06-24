var expect = require('chai').expect;

describe('[API] t.select', function () {
    it('Should execute an anonymous selector', function () {
        return runTests('./testcafe-fixtures/select-test.js', 'Select element');
    });

    it('Should execute an anonymous selector with scope vars', function () {
        return runTests('./testcafe-fixtures/select-test.js', 'Select with scope vars');
    });

    it('Should execute an anonymous selector with options', function () {
        return runTests('./testcafe-fixtures/select-test.js', 'Select with options');
    });

    it('Should have the correct callsite if an error occurs on instantiation', function () {
        return runTests('./testcafe-fixtures/select-test.js', 'Error on instantiation', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains(
                    'select is expected to be initialized with a function, CSS selector string, ' +
                    'another Selector, node snapshot or a Promise returned by a Selector, but "number" was passed.'
                );

                expect(errs[0]).contains('> 23 |    await t.select(42);');
            });
    });

    it('Should have the correct callsite if an error occurs during execution', function () {
        return runTests('./testcafe-fixtures/select-test.js', 'Error during execution', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('An error occurred in select code:  Error: yo');
                expect(errs[0]).contains('> 27 |    await t.select(() => {');
            });
    });
});
