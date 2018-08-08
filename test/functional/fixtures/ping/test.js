describe.only('Network connection quality monitoring', function () {
    this.timeout(3700000);

    it.skip('Should handle XHRs', function () {

        return runTests('./testcafe-fixtures/index-test.js', '');
    })

    describe('Should execute a lot of tests', function () {
        for(let i = 0; i < 600; i++) {
            it(`Synthetic test ${i}`, function () {
                return runTests('./testcafe-fixtures/simple-test.js', '');
            })
        }
    })
});
