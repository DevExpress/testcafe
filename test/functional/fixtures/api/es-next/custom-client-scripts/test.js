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
                    ' "{ content: \'1\' }",\n' +
                    ` "{ path: '${path.resolve('test/functional/fixtures/api/es-next/custom-client-scripts/data/set-flag1.js')}' }"`
                ]);
            });
    });

    describe('Should handle errors of the injected scripts', () => {
        it('Script loaded from file', () => {
            return runTests('./testcafe-fixtures/error-in-script-from-file.js', null, { shouldFail: true })
                .catch(errs => {
                    expect(errs[0]).eql("An error has occurred during client script execution:  TypeError: Cannot read property 'some-property' of undefined  [[user-agent]]");
                });
        });

        it('Script loaded from module', () => {
            return runTests('./testcafe-fixtures/error-in-script-from-module.js', null, { shouldFail: true })
                .catch(errs => {
                    expect(errs[0]).eql('An error has occurred during client script execution:  ReferenceError: require is not defined  [[user-agent]]');
                });
        });
    });
});
