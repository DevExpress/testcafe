var expect = require('chai').expect;

describe('[Regression](GH-1907)', function () {
    it('Base selector should pass the boundTestRun option to derivative selectors', function () {
        return runTests('testcafe-fixtures/index-test.js', 'Check boundTestRun');
    });

    it('Base selector should pass timeout and visibilityCheck options to derivative selectors', function () {
        return runTests('testcafe-fixtures/index-test.js', 'Check timeout and visibilityCheck', {
            selectorTimeout: 0,
            shouldFail:      true
        })
            .catch(function (errs) {
                expect(errs[0]).contains('Cannot obtain information about the node because the specified selector does not match any node in the DOM tree.');
                expect(errs[0]).contains('> 40 |    await t.expect(div.textContent).eql(\'Hidden\');');
            });
    });
});
