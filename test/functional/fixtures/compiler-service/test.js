const path       = require('path');
const { expect } = require('chai');
const config     = require('../../config');


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

    describe('Test hooks', () => {
        describe('fixture.before/fixture.after', () => {
            it('Should run hooks before and after fixture', () => {
                return runTests('../api/es-next/hooks/testcafe-fixtures/fixture-hooks.js');
            });

            it('Should keep sequential reports with long executing hooks', () => {
                return runTests('../api/es-next/hooks/testcafe-fixtures/fixture-hooks-seq.js', null, {
                    shouldFail: true
                }).catch(errs => {
                    expect(errs[0]).contains('$$test1$$');
                    expect(errs[1]).contains('$$afterhook1$$');
                    expect(errs[2]).contains('$$test2$$');
                    expect(errs[3]).contains('$$afterhook2$$');
                    expect(errs[4]).contains('$$test3$$');
                });
            });

            it('Should fail all tests in fixture if fixture.before hooks fails', () => {
                return runTests('../api/es-next/hooks/testcafe-fixtures/fixture-before-fail.js', null, {
                    shouldFail: true
                }).catch(errs => {
                    const allErrors = config.currentEnvironment.browsers.length === 1 ? errs : errs['chrome'].concat(errs['firefox']);

                    expect(allErrors.length).eql(config.currentEnvironment.browsers.length * 3);

                    allErrors.forEach(err => {
                        expect(err).contains('Error in fixture.before hook');
                        expect(err).contains('$$before$$');
                    });
                });
            });

            it('Fixture context', () => {
                return runTests('../api/es-next/hooks/testcafe-fixtures/fixture-ctx.js');
            });
        });
    });
});
