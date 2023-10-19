describe('[Regression](GH-7377)', () => {
    it('Should scroll element highter than sticky footer and type text in element', async () => {
        return runTests('./testcafe-fixtures/');
    });
});
