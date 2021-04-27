const { createReporter } = require('../../../utils/reporter');

describe('[Regression](GH-5207)', function () {
    it('Should not hand with `disablePageReloads` and async reporter', function () {
        return runTests('testcafe-fixtures/index.js', null, {
            reporter: createReporter({
                async reportTestDone () {
                    return new Promise(resolve => {
                        setTimeout(resolve, 5000);
                    });
                }
            })
        });
    });
});
