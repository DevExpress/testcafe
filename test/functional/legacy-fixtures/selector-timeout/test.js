var expect = require('chai').expect;

describe('Selector timeout', function () {
    it('Should fail if selector timeout is less than the time required for the element to appear', function () {
        return runTests('testcafe-fixtures/selector-timeout.test.js', 'Wait for element with insufficient timeout',
            { shouldFail: true, selectorTimeout: 500 })
            .catch(function (errs) {
                var expectedError = [
                    'Error at step "2.Click on button":',
                    'A target element <button id="button"> of the click action is not visible.',
                    'If this element should appear when you are hovering over another',
                    'element, make sure that you properly recorded the hover action.'
                ].join(' ');

                expect(errs[0]).contains(expectedError);
                expect(errs[0]).contains("act.click('#button');");
            });
    });
});
