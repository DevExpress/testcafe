describe('Worker', function () {
    it('Basic Worker', function () {
        return runTests('testcafe-fixtures/index.js', null, { skip: 'ie' });
    });
});
