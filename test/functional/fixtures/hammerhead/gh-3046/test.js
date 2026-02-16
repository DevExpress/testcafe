describe('Worker module type', function () {
    it('Should not break due to importScripts with module workers', function () {
        return runTests('testcafe-fixtures/index.js', null);
    });
});
