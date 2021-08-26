const delay = require('../../../../lib/utils/delay');

describe('Compiler service', () => {
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


