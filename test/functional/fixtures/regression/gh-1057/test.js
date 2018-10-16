describe('[Regression](GH-1057) - hidden by fixed parent', function () {
    it('The target element should not be under the element with position:fixed after scroll', function () {
        return runTests('testcafe-fixtures/hiddenByFixedParent.js', 'gh-1057', {
            // NOTE: https://github.com/DevExpress/testcafe/issues/1237
            // TODO: Android disabled because of https://github.com/DevExpress/testcafe/issues/1492
            skip: 'iphone,ipad,android'
        });
    });

    it('The target element should not be under the element with position:fixed after scroll when using custom offsets', function () {
        return runTests('testcafe-fixtures/hiddenByFixedParent.js', 'gh-1057 with custom offsets', {
            // NOTE: https://github.com/DevExpress/testcafe/issues/1237
            // TODO: Android disabled because of https://github.com/DevExpress/testcafe/issues/1492
            skip: 'iphone,ipad,android'
        });
    });
});

describe('[Regression](GH-1057) - hidden by fixed ancestor', function () {
    it('Should scroll to element if it is hidden by fixed ancestor', function () {
        // NODE: here we skip edge because of https://github.com/DevExpress/testcafe/issues/2450
        // during the test execution browser window is too small and it breaks scrolling to the element
        return runTests('testcafe-fixtures/hiddenByFixedAncestor.js', null, {
            skip: 'edge'
        });
    });
});
