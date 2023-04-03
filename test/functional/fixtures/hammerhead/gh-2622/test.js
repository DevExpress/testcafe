const { skipInNativeAutomation } = require('../../../utils/skip-in');

describe('Page and iframe documents should not contain injected head scripts', () => {
    // NOTE: they really contain. Probably it should not affect tests
    skipInNativeAutomation('Page and iframe documents should not contain injected head scripts', () => {
        return runTests('testcafe-fixtures/index.js');
    });
});
