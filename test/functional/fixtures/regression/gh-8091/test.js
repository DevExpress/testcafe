const config = require('../../../config');

describe('[Regression](GH-8091)', function () {
    if (!config.esm) {
        it('Should prepare and execute typescript test', function () {
            return runTests('./testcafe-fixtures/index.ts');
        });
    }
});
