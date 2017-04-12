var expect = require('chai').expect;

describe('Selector timeout', function () {
    it('Should pass if selector timeout exceeds time required for the element to appear', function () {
        return runTests('testcafe-fixtures/selector-timeout.js', 'Wait for element with timeout enough for it to appear',
            { selectorTimeout: 2500 });
    });

    it('Should fail if selector timeout is less than time required for the element to appear', function () {
        return runTests('testcafe-fixtures/selector-timeout.js', 'Wait for element with insufficient timeout',
            { shouldFail: true, selectorTimeout: 500 })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The element that matches the specified selector is not visible.');
            });
    });
});
