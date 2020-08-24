describe('[Regression](GH-5447) Should use the native date methods in the client code', () => {
    it('Should use the native date methods in the client code', () => {
        return runTests('testcafe-fixtures/index.js', null, { selectorTimeout: 5000 });
    });
});
