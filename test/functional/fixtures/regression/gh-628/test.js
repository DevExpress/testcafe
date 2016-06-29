var expect = require('chai').expect;

describe('[Regression](GH-628)', function () {
    it('Should click on an "option" element', function () {
        return runTests('./testcafe-fixtures/click-on-select-child-test.js', 'Click on an "option" element');
    });

    it('Should fail if try to click on an "option" element in a closed "select" element', function () {
        return runTests('./testcafe-fixtures/click-on-select-child-test.js', 'Click on an invisible "option" element', {
            shouldFail: true
        })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The element that matches the specified selector is not visible.');
                expect(errs[0]).to.contains(
                    "> 19 |        .click('[value=Second]');"
                );
            });
    });
});
