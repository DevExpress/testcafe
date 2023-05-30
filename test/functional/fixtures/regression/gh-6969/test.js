describe('[Regression](GH-6969)', () => {
    it('Should change checkbox checked state when pressing space key', () => {
        return runTests('./testcafe-fixtures/index.js', 'Should change checkbox checked state when pressing space key');
    });
});
