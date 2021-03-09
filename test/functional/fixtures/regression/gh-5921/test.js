describe('[Regression](GH-5921) typeText should replace the old value when the old value length fits maxlength', () => {
    it('Should replace the old value when it fits the maxlength', () => {
        return runTests('testcafe-fixtures/index.js');
    });
});
