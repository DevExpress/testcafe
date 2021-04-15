const path       = require('path');
const { expect } = require('chai');


describe('Compiler service', () => {
    it('Should execute a basic test', async () => {
        await runTests('testcafe-fixtures/basic-test.js', 'Basic test');
    });

    it('Should handle an error', async () => {
        try {
            await runTests('testcafe-fixtures/error-test.js', 'Throw an error', { shouldFail: true });
        }
        catch (err) {
            expect(err[0].startsWith([
                `The specified selector does not match any element in the DOM tree. ` +
                ` > | Selector('#not-exists') ` +
                ` [[user-agent]] ` +
                ` 1 |fixture \`Compiler service\`;` +
                ` 2 |` +
                ` 3 |test(\`Throw an error\`, async t => {` +
                ` > 4 |    await t.click('#not-exists');` +
                ` 5 |});` +
                ` 6 |  at <anonymous> (${path.join(__dirname, 'testcafe-fixtures/error-test.js')}:4:13)`
            ])).to.be.true;
        }
    });

    it('Should allow using ClientFunction in assertions', async () => {
        await runTests('testcafe-fixtures/client-function-in-assertions.js', 'ClientFunction in assertions');
    });

    describe('Request Hooks', () => {
        describe('Request Logger', () => {
            it('Basic', async () => {
                await runTests('../api/es-next/request-hooks/testcafe-fixtures/request-logger/api.js', 'API');
            });

            it('Log options', async () => {
                await runTests('../api/es-next/request-hooks/testcafe-fixtures/request-logger/log-options.js', 'Log options');
            });
        });

        it('Request Mock', async () => {
            await runTests('../api/es-next/request-hooks/testcafe-fixtures/request-mock/basic.js');
        });

        describe('Request Hook', () => {
            it('Change and remove response headers', async () => {
                await runTests('../api/es-next/request-hooks/testcafe-fixtures/api/change-remove-response-headers.js');
            });
        });
    });
});
