const { expect }          = require('chai');
const { onlyInProxyless } = require('../../../utils/skip-in');

describe('Should handle request pipeline errors', function () {
    onlyInProxyless('Certificate error', function () {
        return runTests('./testcafe-fixtures/certificate-error.js', null, { shouldFail: true })
            .catch(errs => {
                expect(errs[0]).contains('Failed to load the page at "https://localhost:3007/".');
                expect(errs[0]).contains('Error: SSL certificate error (ERR_CERT_AUTHORITY_INVALID)');
            });
    });
});
