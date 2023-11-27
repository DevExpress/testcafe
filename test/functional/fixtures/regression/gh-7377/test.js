describe('[Regression](GH-7377)', () => {
    it('Should scroll element higher than sticky footer and type text in element', async () => {
        return runTests('./testcafe-fixtures/');
    });
});
