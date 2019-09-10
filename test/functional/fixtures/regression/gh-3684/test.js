describe('[Regression](GH-3684) - SVG elements do not break searching by text', function () {
    it('SVG elements do not break searching by text', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});
