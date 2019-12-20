const path       = require('path');
const { expect } = require('chai');


describe('Compiler service', () => {
    before(() => {
        process.env.TESTCAFE_PID = String(process.pid);
    });

    after(() => {
        delete process.env.TESTCAFE_PID;
    });

    it('Should execute a basic test', async () => {
        await runTests('testcafe-fixtures/basic-test.js', 'Basic test');
    });

    it('Should handle an error', async () => {
        try {
            await runTests('testcafe-fixtures/error-test.js', 'Throw an error', { shouldFail: true });
        }
        catch (err) {
            expect(err).deep.equal([
                `The specified selector does not match any element in the DOM tree. ` +
                ` > | Selector('#not-exists') ` +
                ` [[user-agent]] ` +
                ` 1 |fixture \`Compiler service\`;` +
                ` 2 |` +
                ` 3 |test(\`Throw an error\`, async t => {` +
                ` 4 |    await t.expect(String(process.ppid)).eql(process.env.TESTCAFE_PID);` +
                ` 5 |` +
                ` > 6 |    await t.click('#not-exists');` +
                ` 7 |});` +
                ` 8 |  at <anonymous> (${path.join(__dirname, 'testcafe-fixtures/error-test.js')}:6:13)`
            ]);
        }
    });
});
