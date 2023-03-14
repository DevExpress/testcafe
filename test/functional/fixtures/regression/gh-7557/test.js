const { onlyInProxyless } = require('../../../utils/skip-in');

describe('[Regression](GH-7557)', function () {
    onlyInProxyless('Should consider document scroll in CDP clicking', function () {
        return runTests('./testcafe-fixtures/index.js', null, { only: 'chrome' });
    });
});


