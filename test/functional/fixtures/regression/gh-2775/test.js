const expect = require('chai').expect;

describe.only('[Regression](GH-2775)', () => {
    describe('TestController command', () => {
        it('Should skip JS errors with boolean param', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should skip JS errors with boolean param');
        });

        it('Should skip JS errors with only message param', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should skip JS errors with only message param');
        });

        it('Should skip JS errors with multiple options', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should skip JS errors with multiple options');
        });

        it('Should skip JS errors with callback function', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should skip JS errors with callback function');
        });

        it('Should fail due to incorrect message option', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should fail due to incorrect message option', { shouldFail: true })
                .catch(([erInfo]) => {
                    expect(erInfo).to.contain('Custom client error');
                })
        });

        it('Should fail if at least one option is incorrect', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should fail if at least one option is incorrect', { shouldFail: true })
                .catch(([erInfo]) => {
                    expect(erInfo).to.contain('Custom client error');
                })
        });

        it('Should fail with callback function', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should fail with callback function', { shouldFail: true })
                .catch(([erInfo]) => {
                    expect(erInfo).to.contain('Custom client error');
                })
        });
    });
});
