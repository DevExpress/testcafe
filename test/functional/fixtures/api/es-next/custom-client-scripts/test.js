const path       = require('path');
const { expect } = require('chai');

describe('Custom client scripts', () => {
    it('Runner', () => {
        return runTests('./testcafe-fixtures/runner.js', null, {
            clientScripts: 'test/functional/fixtures/api/es-next/custom-client-scripts/data/set-flag1.js'
        });
    });

    it('Custom client script should be proxied', () => {
        return runTests('./testcafe-fixtures/check-proxing.js', null, {
            clientScripts: 'test/functional/fixtures/api/es-next/custom-client-scripts/data/page-url.js'
        });
    });

    it('Test API', () => {
        return runTests('./testcafe-fixtures/test-api.js');
    });

    it('Mixed', () => {
        return runTests('./testcafe-fixtures/mixed.js', null, {
            clientScripts: 'test/functional/fixtures/api/es-next/custom-client-scripts/data/set-flag1.js'
        });
    });

    it('Specified page', () => {
        return runTests('./testcafe-fixtures/specified-page.js', null, {
            clientScripts: {
                path: 'test/functional/fixtures/api/es-next/custom-client-scripts/data/set-flag1.js',
                page: 'http://localhost:3000/fixtures/api/es-next/custom-client-scripts/pages/index.html'
            }
        });
    });

    it('Warnings', () => {
        return runTests('./testcafe-fixtures/warnings.js')
            .then(() => {
                expect(testReport.warnings).eql([
                    'The client script you tried to inject is empty.',
                    'You injected the following client scripts several times:\n' +
                    '"{ content: \'1\' }"\n' +
                    `"{ path: '${path.resolve('test/functional/fixtures/api/es-next/custom-client-scripts/data/set-flag1.js')}' }"`
                ]);
            });
    });

    it('Test file and an injected script are located in the same folder', () => {
        return runTests('./testcafe-fixtures/folder/index.js');
    });

    it('Execution order', () => {
        return runTests('./testcafe-fixtures/execution-order.js', null, {
            clientScripts: 'test/functional/fixtures/api/es-next/custom-client-scripts/data/console_log_1.js'
        });
    });

    describe('Should handle errors of the injected scripts', () => {
        // NOTE: Error message format is a little different in various browsers.
        // This is why, we run these tests only in Chrome
        it('Script loaded from file', () => {
            return runTests('./testcafe-fixtures/error-in-script-from-file.js', null, { shouldFail: true, only: 'chrome' })
                .catch(errs => {
                    expect(errs[0]).eql("An error occurred in a script injected into the tested page:  TypeError: Cannot read property 'some-property' of undefined  [[user-agent]]");
                });
        });

        it('Script loaded from module', () => {
            return runTests('./testcafe-fixtures/error-in-script-from-module.js', null, { shouldFail: true, only: 'chrome' })
                .catch(errs => {
                    expect(errs[0]).eql("An error occurred in the 'is-docker' module injected into the tested page. Make sure that this module can be executed in the browser environment.  Error details: ReferenceError: require is not defined  [[user-agent]]");
                });
        });

        it('Wrong module name', () => {
            return runTests('./testcafe-fixtures/wrong-module-name.js', null, { shouldFail: true })
                .catch(err => {
                    expect(err.message).contains("A client script tried to load a JavaScript module that TestCafe cannot locate:\n\nCannot find module 'wrong-module-name'");
                });
        });
    });

    it("Test's client scripts should not override the fixture's client scripts (GH-4122)", () => {
        return runTests('./testcafe-fixtures/i4122.js');
    });
});
