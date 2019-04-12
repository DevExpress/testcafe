const expect = require('chai').expect;

describe('[Regression](GH-3681) - Should throw correct errors for non-exising and invisible iframes', function () {
    it('Invisible iframe', function () {
        return runTests('./testcafe-fixtures/index.js', 'Invisible iframe', { shouldFail: true, selectorTimeout: 1 })
            .catch(function (errs) {
                expect(errs[0]).contains('The element that matches the specified selector is not visible');
                expect(errs[0]).contains('.switchToIframe(Selector(\'iframe\')');
            });
    });

    it('Non-existing iframe', function () {
        return runTests('./testcafe-fixtures/index.js', 'Non-existing iframe', { shouldFail: true, selectorTimeout: 1 })
            .catch(function (errs) {
                expect(errs[0]).contains(
                    'The specified selector does not match any element in the DOM tree.' +
                    '  > | Selector(\'non-existing-iframe\')');
            });
    });
});


