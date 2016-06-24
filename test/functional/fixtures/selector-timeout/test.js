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

    it('Should fail if selector timeout is less than the time required for the element to appear (legacy)', function () {
        return runTests('testcafe-fixtures/selector-timeout.test.js', 'Wait for element with insufficient timeout',
            { shouldFail: true, selectorTimeout: 500 })
            .catch(function (errs) {
                var expectedError = [
                    'Error at step "2.Click on button":',
                    '',
                    "act.click('#button');",
                    '',
                    'A target element \<button id="button"\> of the click action is not visible.',
                    'If this element should appear when you are hovering over another',
                    'element, make sure that you properly recorded the hover action.'
                ].join(' ');

                expect(errs[0]).eql(expectedError);
            });
    });
});
