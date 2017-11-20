var config = require('../../../config.js');

describe.only('[Regression](GH-1940)', function () {
    if (config.useLocalBrowsers) {
        it('Should scroll page when body has scroll', function () {
            return runTests('testcafe-fixtures/index.js');
        });
    }
});
