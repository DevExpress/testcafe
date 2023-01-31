describe('[Regression](GH-7387)', () => {
    it('Should click on SVG inside shadowRoot', async () => {
        return runTests('./testcafe-fixtures/index.js', '', { skip: ['ie'] });
    });
});
