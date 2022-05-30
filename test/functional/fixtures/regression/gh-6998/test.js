describe('[Regression](GH-6998)', () => {
    it('SVG visibility check in case of a parent with nullable dimensions', async () => {
        return runTests('./testcafe-fixtures/index.js');
    });
});
