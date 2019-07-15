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
});
