const path       = require('path');
const { expect } = require('chai');
const delay      = require('../../../../lib/utils/delay');

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

    it('Should execute Selectors in sync mode', async () => {
        await runTests('testcafe-fixtures/synchronous-selectors.js');
    });

    it('debug', async () => {
        let resolver = null;

        const result = new Promise(resolve => {
            resolver = resolve;
        });

        runTests('testcafe-fixtures/debug.js')
            .then(() => resolver());

        setTimeout(async () => {
            const client = global.testCafe.runner.compilerService.cdp;

            await client.Debugger.resume();

            await delay(1000);

            await client.Debugger.resume();
        }, 10000);


        return result;
    });
});


