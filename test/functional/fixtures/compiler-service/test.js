const delay               = require('../../../../lib/utils/delay');
const { DEFAULT_TIMEOUT } = require('../../../../lib/configuration/default-values');
const { expect }          = require('chai');

describe('Compiler service', () => {
    describe('Sync selectors', () => {
        it('API', async () => {
            await runTests('testcafe-fixtures/synchronous-selectors.js', 'API');
        });

        it('selector timeout', async () => {
            await runTests('testcafe-fixtures/synchronous-selectors.js', 'timeout', { selectorTimeout: DEFAULT_TIMEOUT.selector });
        });

        it('error', async () => {
            await runTests('testcafe-fixtures/synchronous-selectors.js', 'error');
        });
    });

    describe('Proxy globals on client side (produced by "esm" module)', () => {
        it('Selector', async () => {
            await runTests('testcafe-fixtures/proxy-globals.js', 'Selector');
        });

        it('ClientFunction', async () => {
            await runTests('testcafe-fixtures/proxy-globals.js', 'ClientFunction');
        });
    });

    describe('Debug', () => {
        it('Basic', async () => {
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

        it('Should not break execution chain on using "t.debug" action (GH-6622)', async () => {
            let resolver = null;
            let rejecter = null;

            const result = new Promise((resolve, reject) => {
                resolver = resolve;
                rejecter = reject;
            });

            runTests('testcafe-fixtures/keep-execution-chain.js')
                .then(() => rejecter('The test should fail.'))
                .catch(err => {
                    expect(err[0]).contain('The specified selector does not match any element in the DOM tree.  > | Selector(\'#wrong-selector\')');

                    resolver();
                });

            setTimeout(async () => {
                const client = global.testCafe.runner.compilerService.cdp;

                await client.Debugger.resume();

                await delay(1000);
            }, 10000);

            return result;
        });
    });
});


