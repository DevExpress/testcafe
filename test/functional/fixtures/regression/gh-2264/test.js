describe('[Regression] (GH-2264)', function () {
    it('Smart assertions should work for RAW API tests', function () {
        return runTests('./testcafe-fixtures/test.testcafe', 'Smart Assertion', { only: 'chrome' });
    });
});
