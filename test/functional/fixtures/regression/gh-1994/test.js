var expect = require('chai').expect;

describe('[Regression](GH-1994)', function () {
    it('Click on hidden element recreated on timeout', function () {
        return runTests('testcafe-fixtures/index.js', 'Recreate invisible element and click', { selectorTimeout: 1000 });
    });

    it('Click on hidden element removed on timeout', function () {
        return runTests('./testcafe-fixtures/index.js', 'Remove invisible element and click', { shouldFail: true, selectorTimeout: 1000 })
            .catch(function (errs) {
                expect(errs[0]).contains('The specified selector does not match any element in the DOM tree.');
            });
    });

});


