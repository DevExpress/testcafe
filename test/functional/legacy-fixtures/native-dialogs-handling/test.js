var expect = require('chai').expect;


describe('Native dialogs handling', function () {
    it('Should pass if confirmation dialogs appear before first page load event has been raised', function () {
        return runTests('testcafe-fixtures/confirm-page.test.js');
    });

    it('Should handle dialogs appeared after an action', function () {
        return runTests('testcafe-fixtures/index.test.js', 'Expected dialogs after action - should pass');
    });

    it('Should fail if an unexpected alert dialog appears after click on the fake link', function () {
        return runTests('testcafe-fixtures/index.test.js', 'Unexpected alert after click on the link without redirect - should fail', { shouldFail: true })
            .catch(function (errs) {
                var expectedError = [
                    'Error at step "1.Click alert button":',
                    'Unexpected system alert dialog Alert dialog appeared.'
                ].join(' ');

                expect(errs[0]).contains(expectedError);
            });
    });

    it('Should fail if two confirmation dialogs appear and only one is handled', function () {
        return runTests('testcafe-fixtures/index.test.js', 'No expected second confirm - should fail', { shouldFail: true })
            .catch(function (errs) {
                var expectedError = [
                    'Error at step "1.Click submit button "Confirm"":',
                    'Unexpected system confirm dialog Confirm dialog appeared.'
                ].join(' ');

                expect(errs[0]).contains(expectedError);
            });
    });

    it('Should fail when an unexpected confirmation dialog appears after an action', function () {
        return runTests('testcafe-fixtures/index.test.js', 'Unexpected confirm after action - should fail', { shouldFail: true })
            .catch(function (errs) {
                var expectedError = [
                    'Error at step "1.Click submit button "Confirm"":',
                    'Unexpected system confirm dialog Confirm dialog appeared.'
                ].join(' ');

                expect(errs[0]).contains(expectedError);
            });
    });

    it('Should fail when an unexpected prompt dialog appears after an action', function () {
        return runTests('testcafe-fixtures/index.test.js', 'Unexpected prompt after action - should fail', { shouldFail: true })
            .catch(function (errs) {
                var expectedError = [
                    'Error at step "1.Click prompt button":',
                    'Unexpected system prompt dialog Prompt dialog appeared.'
                ].join(' ');

                expect(errs[0]).contains(expectedError);
            });
    });

    it('Should fail when an unexpected alert dialog appears after an action', function () {
        return runTests('testcafe-fixtures/index.test.js', 'Unexpected alert after action - should fail')
            .catch(function (errs) {
                var expectedError = [
                    'Error at step "1.Click alert button":',
                    'Unexpected system alert dialog Alert dialog appeared.'
                ].join(' ');

                expect(errs[0]).contains(expectedError);
            });
    });

    it("Should fail if the expected confirmation dialog doesn't appear after an action", function () {
        return runTests('testcafe-fixtures/index.test.js', 'No expected confirm after action - should fail', { shouldFail: true })
            .catch(function (errs) {
                var expectedError = [
                    'Error at step "1.Click submit button "Button"":',
                    'The expected system confirm dialog did not appear.'
                ].join(' ');

                expect(errs[0]).contains(expectedError);
            });
    });

    it("Should fail if the expected prompt dialog doesn't appear after an action", function () {
        return runTests('testcafe-fixtures/index.test.js', 'No expected prompt after action - should fail', { shouldFail: true })
            .catch(function (errs) {
                var expectedError = [
                    'Error at step "1.Click submit button "Button"":',
                    'The expected system prompt dialog did not appear.'
                ].join(' ');

                expect(errs[0]).contains(expectedError);
            });
    });

    it("Should fail if the expected alert dialog doesn't appear after an action", function () {
        return runTests('testcafe-fixtures/index.test.js', 'No expected alert after action - should fail', { shouldFail: true })
            .catch(function (errs) {
                var expectedError = [
                    'Error at step "1.Click submit button "Button"":',
                    'The expected system alert dialog did not appear.'
                ].join(' ');

                expect(errs[0]).contains(expectedError);
            });
    });

    describe('Dialogs after redirect', function () {
        it('Should handle confirmation dialogs', function () {
            return runTests('testcafe-fixtures/index.test.js', 'Expected confirm after redirect - should pass');
        });

        it('Should fail when an unexpected confirmation dialog appears', function () {
            return runTests('testcafe-fixtures/index.test.js', 'Unexpected confirm after redirect - should fail', { shouldFail: true })
                .catch(function (errs) {
                    var expectedError = [
                        'Error at step "1.Click link "Confirm page"":',
                        'Unexpected system confirm dialog Confirm dialog appeared.'
                    ].join(' ');

                    expect(errs[0]).contains(expectedError);
                });
        });

        it("Should fail if the expected confirmation dialog doesn't appear", function () {
            return runTests('testcafe-fixtures/index.test.js', 'No expected confirm after redirect - should fail', { shouldFail: true })
                .catch(function (errs) {
                    var expectedError = [
                        'Error at step "1.Click link "This page"":',
                        'The expected system confirm dialog did not appear.'
                    ].join(' ');

                    expect(errs[0]).contains(expectedError);
                });
        });
    });

    describe('Dialogs in iframe', function () {
        it('Should handle confirmation dialogs appeared after an action', function () {
            return runTests('testcafe-fixtures/in-iframe.test.js', 'Expected confirm after action in iframe - should pass');
        });

        it('Should fail when an unexpected confirmation dialog appears after an action', function () {
            return runTests('testcafe-fixtures/in-iframe.test.js', 'Unexpected confirm after action in iframe - should fail', { shouldFail: true })
                .catch(function (errs) {
                    var expectedError = [
                        'Error at step "1.Click submit button "Confirm"":',
                        'Unexpected system confirm dialog Confirm dialog appeared.'
                    ].join(' ');

                    expect(errs[0]).contains(expectedError);
                });
        });

        it("Should fail if the expected confirmation dialog doesn't appear after an action", function () {
            return runTests('testcafe-fixtures/in-iframe.test.js', 'No expected confirm after action in iframe - should fail', { shouldFail: true })
                .catch(function (errs) {
                    var expectedError = [
                        'Error at step "1.Click submit button "Button"":',
                        'The expected system confirm dialog did not appear.'
                    ].join(' ');

                    expect(errs[0]).contains(expectedError);
                });
        });

        it('Should handle confirmation dialogs appeared after redirect', function () {
            return runTests('testcafe-fixtures/in-iframe.test.js', 'Expected confirm after redirect in iframe - should pass');
        });

        it('Should fail when an unexpected confirmation dialog appears after redirect', function () {
            return runTests('testcafe-fixtures/in-iframe.test.js', 'Unexpected confirm after redirect in iframe - should fail', { shouldFail: true })
                .catch(function (errs) {
                    var expectedError = [
                        'Error at step "1.Click link "Confirm page"":',
                        'Unexpected system confirm dialog Confirm dialog appeared.'
                    ].join(' ');

                    expect(errs[0]).contains(expectedError);
                });
        });

        it("Should fail if the expected confirmation dialog doesn't appear after redirect", function () {
            return runTests('testcafe-fixtures/in-iframe.test.js', 'No expected confirm after redirect in iframe - should fail', { shouldFail: true })
                .catch(function (errs) {
                    var expectedError = [
                        'Error at step "1.Click link "This page"":',
                        'The expected system confirm dialog did not appear.'
                    ].join(' ');

                    expect(errs[0]).contains(expectedError);
                });
        });
    });
});
