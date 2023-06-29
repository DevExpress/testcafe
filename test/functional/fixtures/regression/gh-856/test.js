const { skipInNativeAutomation } = require('../../../utils/skip-in');

// NOTE: details here: https://github.com/DevExpress/testcafe-private/issues/210
describe('[Regression](GH-856) Test should not hang when redirect occurs after the page is loaded', function () {
    skipInNativeAutomation('gh-856', function () {
        return runTests('testcafe-fixtures/index-test.js', 'gh-856');
    });

    skipInNativeAutomation('gh-856 (iframe)', function () {
        return runTests('testcafe-fixtures/index-test.js', 'gh-856 (iframe)', { selectorTimeout: 10000 });
    });
});
