describe('[Regression](GH-1057)', function () {
    it('The target element should not be under the element with position:fixed after scroll', function () {
        return runTests('testcafe-fixtures/index-test.js', 'gh-1057', {
            // NOTE: https://github.com/DevExpress/testcafe/issues/1237
            // TODO: Android disabled because of https://github.com/DevExpress/testcafe/issues/1492
            skip: 'iphone,ipad,android'
        });
    });
});
