describe('[Regression](GH-1679)', function () {
    it('Should be able to hover an element that became hidden on mouseover', function () {
        return runTests('testcafe-fixtures/index-test.js', 'Hover element', { only: 'chrome' });
    });
});
