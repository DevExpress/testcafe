var expect = require('chai').expect;


describe('Before unload handling', function () {
    it('Should handle the beforeUnload dialog', function () {
        return runTests('testcafe-fixtures/index.test.js', 'Expected beforeUnload dialog - should pass');
    });

    it("Should fail if the expected beforeUnload dialog doesn't appear", function () {
        return runTests('testcafe-fixtures/index.test.js', 'No expected beforeUnload dialog - should fail', { shouldFail: true })
            .catch(function (errs) {
                var expectedError = [
                    'Error at step "2.Wait for a dialog":',
                    ' The expected system beforeUnload dialog did not appear.'
                ].join('');

                expect(errs[0]).contains(expectedError);
            });
    });

    it('Should fail if an unexpected beforeUnload dialog appears', function () {
        return runTests('testcafe-fixtures/index.test.js', 'Unexpected beforeUnload dialog - should fail', { shouldFail: true })
            .catch(function (errs) {
                var expectedError = [
                    'Error at step "3.Wait for a dialog":',
                    ' Unexpected system beforeUnload dialog message appeared.'
                ].join('');

                expect(errs[0]).contains(expectedError);
            });
    });

    it('Should handle the beforeUnload dialog in iframe', function () {
        return runTests('testcafe-fixtures/in-iframe.test.js', 'Expected beforeUnload dialog in iframe - should pass');
    });

    it("Should fail if the expected beforeUnload dialog doesn't appear in iframe", function () {
        return runTests('testcafe-fixtures/in-iframe.test.js', 'No expected beforeUnload dialog in iframe - should fail', { shouldFail: true })
            .catch(function (errs) {
                var expectedError = [
                    'Error at step "2.Wait for a dialog":',
                    ' The expected system beforeUnload dialog did not appear.'
                ].join('');

                expect(errs[0]).contains(expectedError);
            });
    });

    it('Should fail if an unexpected beforeUnload dialog appears in iframe', function () {
        return runTests('testcafe-fixtures/in-iframe.test.js', 'Unexpected beforeUnload dialog in iframe - should fail', { shouldFail: true })
            .catch(function (errs) {
                var expectedError = [
                    'Error at step "3.Wait for a dialog":',
                    ' Unexpected system beforeUnload dialog message appeared.'
                ].join('');

                expect(errs[0]).contains(expectedError);
            });
    });
});
