describe.only('Network connection quality monitoring', function () {
    it('Should handle XHRs', function () {
        this.timeout(3700000);

        return runTests('./testcafe-fixtures/index-test.js', '');
    })
});
