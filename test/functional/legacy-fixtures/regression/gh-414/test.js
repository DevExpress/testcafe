var expect = require('chai').expect;


describe("[Regression](GH-414) Should restart a test step if redirect occurs while waiting for the action's target element", function () {
    it('Should restart a user action after redirect', function () {
        return runTests('testcafe-fixtures/index.test.js', 'Click on the element after redirect - should pass',
            { selectorTimeout: 4000 });
    });

    it('Should fail when redirected before the target element for the click action appears', function () {
        return runTests('testcafe-fixtures/index.test.js', 'Redirect before the target element appears - should fail', { shouldFail: true })
            .catch(function (errs) {
                var expectedError = [
                    'Error at step "2.Click div "The second div"":',
                    'A target element of the click action has not been found in the DOM tree.',
                    'If this element should be created after animation or a time-consuming',
                    'operation is finished, use the waitFor action (available for use in code)',
                    'to pause test execution until this element appears.'
                ].join(' ');

                expect(errs[0]).contains(expectedError);
                expect(errs[0]).contains("act.click('#div2');");
            });
    });

    it('Should restart waitFor action after redirect', function () {
        return runTests('testcafe-fixtures/index.test.js', 'Wait for element after redirect - should pass');
    });

    it('Should restart waitFor action after redirect in an iframe', function () {
        return runTests('testcafe-fixtures/in-iframe.test.js', 'Wait in iframe for element after redirect in iframe - should pass');
    });
});
