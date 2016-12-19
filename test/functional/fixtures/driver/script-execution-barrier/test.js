describe('Script execution barrier', function () {
    it('Should wait while new scripts are executed after an action', function () {
        return runTests('./testcafe-fixtures/index-test.js', 'Add scripts on an action');
    });

    it('Should not wait long loading scripts', function () {
        return runTests('./testcafe-fixtures/index-test.js', 'Add a long loading script on an action');
    });

    it('Should not wait if scripts are added repetitively', function () {
        return runTests('./testcafe-fixtures/index-test.js', 'Add repetitive adding scripts');
    });
});
