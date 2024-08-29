describe('[Regression](GH-8261)', function () {
    it('Element with first DOMRect from getClientRects with zero height/width should be visible', function () {
        return runTests('testcafe-fixtures/index.js', 'Element should be visible', { only: 'chrome' });
    });
});
