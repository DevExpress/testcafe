describe.skip('[Regression](GH-5961)', () => {
    it('Screenshot', () => {
        return runTests('./testcafe-fixtures/index.js', 'Take a full page screenshot');
    });
});
