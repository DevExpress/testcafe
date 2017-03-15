describe('[Regression](GH-1312)', function () {
    it('Should preform a click action on the element inside shadow DOM', function () {
        return runTests('testcafe-fixtures/index-test.js', 'click', {
            // NOTE: Currently supported in Chrome only: http://caniuse.com/#feat=shadowdom
            only: 'chrome'
        });
    });

    it('Should preform a typeText action on the element inside shadow DOM', function () {
        return runTests('testcafe-fixtures/index-test.js', 'typeText', {
            // NOTE: Currently supported in Chrome only: http://caniuse.com/#feat=shadowdom
            only: 'chrome'
        });
    });
});
