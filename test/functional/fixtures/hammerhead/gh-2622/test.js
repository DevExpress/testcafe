const { skipInProxyless } = require('../../../utils/skip-in');

describe('Page and iframe documents should not contain injected head scripts', () => {
    skipInProxyless('Page and iframe documents should not contain injected head scripts', () => {
        return runTests('testcafe-fixtures/index.js');
    });
});
